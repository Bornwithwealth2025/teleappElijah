import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock3,
  FolderOpen,
  Link2,
  Plus,
  Users,
  Video,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { BASE_URL } from "@/api/client";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import {
  Layout,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useMeetingInboxStore from "@/store/meetingInboxStore";
import useUserStore from "@/store/userStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function getValue(...values: unknown[]) {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "",
  );
}

function getProfileName(profile: any) {
  const name = [
    profile?.first_name ?? profile?.firstName,
    profile?.last_name ?? profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || profile?.name || profile?.full_name || "Telefya user";
}

function getFirstName(profile: any) {
  const value =
    profile?.first_name ??
    profile?.firstName ??
    profile?.name ??
    profile?.full_name ??
    "there";

  return String(value).trim().split(/\s+/)[0] || "there";
}

function resolveImageUrl(value?: string | null) {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BASE_URL.replace("/api/v2", "")}/${value.replace(
    /^\/+/,
    "",
  )}`;
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getMeetingTitle(meeting: any) {
  return (
    meeting?.title ??
    meeting?.meeting_title ??
    meeting?.name ??
    `Meeting #${meeting?.id ?? ""}`
  );
}

function getMeetingRoomId(meeting: any) {
  return (
    getRoomIdFromMeetingUrl(meeting?.meeting_url) ||
    String(meeting?.room_id ?? meeting?.roomId ?? meeting?.id ?? "")
  );
}

function getMeetingDate(value?: string | null) {
  if (!value) {
    return {
      day: "--",
      month: "TBD",
      time: "Scheduled meeting",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "--",
      month: "TBD",
      time: "Scheduled meeting",
    };
  }

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: isToday
      ? "Today"
      : isTomorrow
        ? "Tomorrow"
        : date.toLocaleDateString(undefined, {
            month: "short",
          }),
    time: date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

type UpcomingMeetingProps = {
  meeting: any;
  isLive: boolean;
  onPress: () => void;
};

function UpcomingMeeting({
  meeting,
  isLive,
  onPress,
}: UpcomingMeetingProps) {
  const { colors, isDark } = useAppTheme();
  const [pressed, setPressed] = React.useState(false);

  const dateValue =
    meeting?.date ??
    meeting?.scheduled_at ??
    meeting?.start_time ??
    meeting?.created_at;

  const date = getMeetingDate(dateValue);
  const participantCount = Number(
    meeting?.participants_count ?? meeting?.participants ?? 1,
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`Join ${getMeetingTitle(meeting)}`}
      style={styles.meetingPressable}
    >
      <View
        style={[
          styles.meetingRow,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.045)"
              : colors.surface,
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : colors.border,
            opacity: pressed ? 0.76 : 1,
          },
        ]}
      >
        <View style={[styles.dateBlock, { backgroundColor: colors.primary }]}>
          <AppText style={styles.dateDay}>{date.day}</AppText>

          <AppText numberOfLines={1} style={styles.dateMonth}>
            {date.month}
          </AppText>
        </View>

        <View style={styles.meetingCopy}>
          <AppText
            numberOfLines={1}
            style={[styles.meetingTitle, { color: colors.text }]}
          >
            {getMeetingTitle(meeting)}
          </AppText>

          <View style={styles.meetingDetails}>
            <Clock3 color={colors.textSoft} size={15} />
            <AppText style={[styles.meetingMeta, { color: colors.textMuted }]}>
              {date.time}
            </AppText>

            <View
              style={[
                styles.dotSeparator,
                { backgroundColor: colors.textSoft },
              ]}
            />

            <Users color={colors.textSoft} size={15} />
            <AppText style={[styles.meetingMeta, { color: colors.textMuted }]}>
              {participantCount}
            </AppText>
          </View>
        </View>

        {isLive ? (
          <View style={styles.meetingTrailing}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <AppText style={styles.liveText}>LIVE</AppText>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function HeroActionTile({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={styles.heroActionPressable}
    >
      <View style={styles.heroActionTile}>
        <View style={styles.heroActionIcon}>{icon}</View>

        <View style={styles.heroActionCopy}>
          <AppText numberOfLines={1} style={styles.heroActionTitle}>
            {title}
          </AppText>

          <AppText numberOfLines={1} style={styles.heroActionDescription}>
            {description}
          </AppText>
        </View>

        <View style={styles.heroActionChevron}>
          <ChevronRight color="#FFFFFF" size={16} strokeWidth={2.6} />
        </View>
      </View>
    </Pressable>
  );
}

function LibraryRow({
  icon,
  title,
  description,
  accent,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={styles.libraryPressable}
    >
      <View
        style={[
          styles.libraryRow,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.045)"
              : colors.surface,
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : colors.border,
            opacity: pressed ? 0.76 : 1,
          },
        ]}
      >
        <View style={[styles.libraryIcon, { backgroundColor: accent }]}>
          {icon}
        </View>

        <View style={styles.libraryCopy}>
          <AppText
            numberOfLines={1}
            style={[styles.libraryTitle, { color: colors.text }]}
          >
            {title}
          </AppText>

          <AppText
            numberOfLines={1}
            style={[styles.libraryDescription, { color: colors.textMuted }]}
          >
            {description}
          </AppText>
        </View>

        <View style={styles.libraryChevron}>
          <ChevronRight color={colors.textMuted} size={22} />
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();

  const authUser = useAuthStore((state) => state.user);

  const profile = useUserStore((state) => state.profile);
  const profileLoading = useUserStore((state) => state.isLoading);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  const inbox = useMeetingInboxStore((state) => state.inbox);
  const meetingsLoading = useMeetingInboxStore(
    (state) => state.isLoading,
  );
  const fetchMeetings = useMeetingInboxStore(
    (state) => state.fetchInbox,
  );

  React.useEffect(() => {
    void Promise.allSettled([fetchProfile(), fetchMeetings()]);
  }, [fetchMeetings, fetchProfile]);

  const activeUser = {
    ...(authUser ?? {}),
    ...(profile ?? {}),
  };

  const firstName = getFirstName(activeUser);
  const profileName = getProfileName(activeUser);

  const imageUrl = resolveImageUrl(
    String(
      getValue(
        activeUser.profile_image,
        activeUser.profileImage,
        activeUser.avatar,
      ) ?? "",
    ),
  );

  const liveMeetings = inbox.live;
  const upcomingMeetings = inbox.upcoming;
  const pendingInvitations = inbox.invitations;
  const hasLive = liveMeetings.length > 0;

  const featuredMeetings = [...liveMeetings, ...upcomingMeetings].slice(
    0,
    3,
  );

  function startMeeting() {
    router.push("/(tabs)/create");
  }

  async function refresh() {
    await Promise.allSettled([fetchProfile(), fetchMeetings()]);
  }

  return (
    <AppScreen
      tone="aurora"
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={profileLoading || meetingsLoading}
          onRefresh={() => void refresh()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.topBar}>
        <View style={styles.identity}>
          <View
            style={[
              styles.avatarShell,
              {
                backgroundColor: colors.primarySoft,
                borderColor: `${colors.primary}2A`,
              },
            ]}
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.avatar}
                accessibilityLabel={`${profileName} profile image`}
              />
            ) : (
              <AppText
                style={[
                  styles.avatarInitial,
                  { color: colors.primary },
                ]}
              >
                {profileName.charAt(0).toUpperCase()}
              </AppText>
            )}
          </View>

          <View style={styles.identityCopy}>
            <AppText
              numberOfLines={1}
              style={[styles.greeting, { color: colors.text }]}
            >
              {getTimeGreeting()}, {firstName}
            </AppText>

            <AppText
              numberOfLines={1}
              style={[styles.greetingSub, { color: colors.textMuted }]}
            >
              Your meeting workspace is ready.
            </AppText>
          </View>
        </View>

        <View>
          <IconButton
            icon={<Bell color={colors.text} size={19} />}
            variant="surface"
            size={44}
            accessibilityLabel="Open notifications"
            onPress={() => router.push("/(tabs)/profile")}
          />

          {pendingInvitations.length > 0 ? (
            <View
              style={[
                styles.bellBadge,
                { backgroundColor: colors.primary },
              ]}
            />
          ) : null}
        </View>
      </View>

      <LinearGradient
        colors={["#7B1CFF", "#0F6BFF", "#12D8B0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.meetingHero}
      >
        <View style={styles.heroTopLine} />

        <View style={styles.heroHeader}>
          <View style={styles.heroIcon}>
            <Video color="#FFFFFF" size={23} strokeWidth={2.4} />
          </View>

          <View style={styles.readyPill}>
            <View style={styles.readyDot} />

            <AppText numberOfLines={1} style={styles.readyText}>
              Ready to meet
            </AppText>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <AppText style={styles.heroTitle}>
            Meet with confidence.
          </AppText>

          <AppText style={styles.heroDescription}>
            Start now, schedule ahead, or share a secure meeting link.
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start instant meeting"
          onPress={startMeeting}
          style={styles.heroPrimaryPressable}
        >
          <View style={styles.heroPrimaryButton}>
            <View style={styles.heroPrimaryIcon}>
              <Plus color="#FFFFFF" size={22} strokeWidth={2.8} />
            </View>

            <AppText numberOfLines={1} style={styles.heroPrimaryButtonText}>
              Start instant meeting
            </AppText>

            <View style={styles.heroPrimaryChevron}>
              <ChevronRight color="#0F6BFF" size={22} strokeWidth={2.6} />
            </View>
          </View>
        </Pressable>

        <View style={styles.heroUtilities}>
          <HeroActionTile
            icon={<CalendarPlus color="#FFFFFF" size={19} strokeWidth={2.25} />}
            title="Schedule"
            description="Plan ahead"
            onPress={() => router.push("/(tabs)/scheduler")}
          />

          <HeroActionTile
            icon={<Link2 color="#FFFFFF" size={19} strokeWidth={2.25} />}
            title="Join meeting"
            description="Use a link"
            onPress={() => router.push("/meeting/join")}
          />
        </View>
      </LinearGradient>

      {pendingInvitations.length > 0 ? (
        <Pressable
          onPress={() => router.push("/(tabs)/meetings")}
          accessibilityRole="button"
          accessibilityLabel="View meeting invitations"
          style={({ pressed }) => [
            styles.emptyMeetings,
            {
              backgroundColor: `${colors.secondary}14`,
              borderColor: `${colors.secondary}36`,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: `${colors.secondary}22` },
            ]}
          >
            <Users color={colors.secondary} size={20} />
          </View>

          <View style={styles.emptyCopy}>
            <AppText style={[styles.meetingTitle, { color: colors.text }]}>
              {pendingInvitations.length} meeting invitation
              {pendingInvitations.length === 1 ? "" : "s"} waiting
            </AppText>

            <AppText
              style={[styles.meetingMeta, { color: colors.textMuted }]}
            >
              Review and respond before joining.
            </AppText>
          </View>

          <ChevronRight color={colors.secondary} size={20} />
        </Pressable>
      ) : null}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderCopy}>
          <View style={styles.sectionTitleRow}>
            {hasLive ? <View style={styles.sectionLiveDot} /> : null}

            <AppText style={[styles.sectionTitle, { color: colors.text }]}>
              {hasLive ? "Live now" : "Upcoming meetings"}
            </AppText>
          </View>

          <AppText
            style={[styles.sectionSubtitle, { color: colors.textMuted }]}
          >
            {hasLive
              ? "Join an active conversation."
              : "Your next scheduled conversations."}
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/meetings")}
          accessibilityRole="button"
          accessibilityLabel="View all meetings"
          hitSlop={8}
          style={styles.viewAllButton}
        >
          <AppText style={[styles.viewAll, { color: colors.primary }]}>
            View all
          </AppText>
          <ChevronRight color={colors.primary} size={16} />
        </Pressable>
      </View>

      {meetingsLoading && featuredMeetings.length === 0 ? (
        <View
          style={[
            styles.loadingState,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <AppText variant="caption" tone="muted">
            Loading your meetings…
          </AppText>
        </View>
      ) : featuredMeetings.length > 0 ? (
        <View style={styles.meetingList}>
          {featuredMeetings.map((meeting) => (
            <UpcomingMeeting
              key={String(meeting?.id ?? meeting?.meeting_url)}
              meeting={meeting}
              isLive={liveMeetings.includes(meeting)}
              onPress={() =>
                router.push({
                  pathname: "/meeting/[meetingId]",
                  params: {
                    meetingId: getMeetingRoomId(meeting),
                    ...(meeting.relationship === "host"
                      ? { host: "true" }
                      : {}),
                  },
                })
              }
            />
          ))}
        </View>
      ) : (
        <Pressable
          onPress={() => router.push("/(tabs)/scheduler")}
          accessibilityRole="button"
          accessibilityLabel="Schedule your first meeting"
          style={({ pressed }) => [
            styles.emptyMeetings,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.045)"
                : colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <CalendarDays color={colors.primary} size={20} />
          </View>

          <View style={styles.emptyCopy}>
            <AppText style={[styles.meetingTitle, { color: colors.text }]}>
              Nothing scheduled yet
            </AppText>

            <AppText
              style={[styles.meetingMeta, { color: colors.textMuted }]}
            >
              Create a meeting and invite your team.
            </AppText>
          </View>

          <ChevronRight color={colors.primary} size={20} />
        </Pressable>
      )}

      <View style={styles.libraryHeader}>
        <View
          style={[
            styles.libraryHeaderIcon,
            {
              backgroundColor: `${colors.secondary}24`,
              borderColor: `${colors.secondary}3A`,
            },
          ]}
        >
          <FolderOpen color={colors.secondary} size={19} />
        </View>

        <View style={styles.libraryHeaderCopy}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            Your meeting library
          </AppText>

          <AppText
            style={[styles.sectionSubtitle, { color: colors.textMuted }]}
          >
            Access your past and upcoming meetings.
          </AppText>
        </View>
      </View>

      <View style={styles.libraryList}>
        <LibraryRow
          icon={<CalendarDays color="#FFFFFF" size={22} />}
          title="Past meetings"
          description="View recorded and completed meetings"
          accent={colors.secondary}
          onPress={() => router.push("/recordings")}
        />

        <LibraryRow
          icon={<CalendarClock color="#FFFFFF" size={22} />}
          title="Upcoming meetings"
          description="See your scheduled meetings"
          accent={colors.primary}
          onPress={() => router.push("/(tabs)/meetings")}
        />
      </View>

      <View style={styles.bottomSpace} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Layout.sectionGap,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  avatarShell: {
    width: 48,
    height: 48,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarInitial: {
    fontSize: 17,
    fontWeight: "900",
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  greeting: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.25,
  },

  greetingSub: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  bellBadge: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: Radius.pill,
  },

  meetingHero: {
    overflow: "hidden",
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Shadows.enterprise,
  },

  heroTopLine: {
    position: "absolute",
    top: 0,
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.36)",
  },

  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3, 13, 43, 0.32)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  readyPill: {
    minHeight: 34,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(3, 13, 43, 0.40)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  readyDot: {
    width: 9,
    height: 9,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
    shadowColor: "#12D8B0",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 3,
  },

  readyText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },

  heroCopy: {
    gap: Spacing.one,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  heroDescription: {
    maxWidth: 320,
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },

  heroPrimaryPressable: {
    width: "100%",
    marginTop: Spacing.two,
  },

  heroPrimaryButton: {
    width: "100%",
    height: 64,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    shadowColor: "#061A3A",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  heroPrimaryIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6BFF",
  },

  heroPrimaryButtonText: {
    flex: 1,
    textAlign: "center",
    color: "#0B2D75",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  heroPrimaryChevron: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,107,255,0.10)",
  },

  heroUtilities: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.three,
    marginTop: Spacing.one,
  },

  heroActionPressable: {
    flex: 1,
    minWidth: 0,
  },

  heroActionTile: {
    height: 80,
    borderWidth: 1,
    borderRadius: Radius.large,
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(3,13,43,0.22)",
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  heroActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  heroActionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  heroActionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },

  heroActionDescription: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  heroActionChevron: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  sectionHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  sectionLiveDot: {
    width: 11,
    height: 11,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
    shadowColor: "#12D8B0",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 19,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingTop: 6,
  },

  viewAll: {
    fontSize: 15,
    fontWeight: "800",
  },

  meetingList: {
    width: "100%",
    gap: Spacing.three,
  },

  meetingPressable: {
    width: "100%",
  },

  meetingRow: {
    width: "100%",
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  dateBlock: {
    width: 60,
    height: 60,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  dateDay: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "900",
  },

  dateMonth: {
    marginTop: 1,
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },

  meetingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },

  meetingTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },

  meetingDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  meetingMeta: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },

  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: Radius.pill,
    opacity: 0.65,
  },

  meetingTrailing: {
    alignItems: "center",
    justifyContent: "center",
  },

  livePill: {
    height: 30,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(18,216,176,0.14)",
    borderWidth: 1,
    borderColor: "rgba(18,216,176,0.42)",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
  },

  liveText: {
    color: "#12D8B0",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  loadingState: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyMeetings: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  libraryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },

  libraryHeaderIcon: {
    width: 38,
    height: 38,
    marginTop: 2,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  libraryHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

  libraryList: {
    width: "100%",
    gap: Spacing.three,
  },

  libraryPressable: {
    width: "100%",
  },

  libraryRow: {
    width: "100%",
    height: 84,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  libraryIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  libraryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  libraryTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  libraryDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  libraryChevron: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomSpace: {
    height: Spacing.two,
  },
});