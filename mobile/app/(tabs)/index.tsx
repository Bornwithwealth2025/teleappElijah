import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock3,
  Film,
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
import { AppButton } from "@/components/ui/AppButton";
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
  onPress: () => void;
};

function UpcomingMeeting({
  meeting,
  onPress,
}: UpcomingMeetingProps) {
  const { colors, isDark } = useAppTheme();

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
      accessibilityRole="button"
      accessibilityLabel={`Join ${getMeetingTitle(meeting)}`}
      style={({ pressed }) => [
        styles.meetingRow,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.045)"
            : colors.surface,
          borderColor: isDark
            ? "rgba(255,255,255,0.09)"
            : colors.border,
          opacity: pressed ? 0.74 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.dateBlock,
          {
            backgroundColor: colors.primarySoft,
            borderColor: `${colors.primary}24`,
          },
        ]}
      >
        <AppText style={[styles.dateDay, { color: colors.primary }]}>
          {date.day}
        </AppText>

        <AppText
          numberOfLines={1}
          style={[styles.dateMonth, { color: colors.primary }]}
        >
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
          <Clock3 color={colors.textSoft} size={14} />
          <AppText style={[styles.meetingMeta, { color: colors.textMuted }]}>
            {date.time}
          </AppText>

          <View
            style={[
              styles.dotSeparator,
              { backgroundColor: colors.textSoft },
            ]}
          />

          <Users color={colors.textSoft} size={14} />
          <AppText style={[styles.meetingMeta, { color: colors.textMuted }]}>
            {participantCount}
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.joinCircle,
          { backgroundColor: colors.primary },
        ]}
      >
        <ChevronRight color="#FFFFFF" size={19} />
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

        <IconButton
          icon={<Bell color={colors.text} size={19} />}
          variant="surface"
          size={42}
          accessibilityLabel="Open notifications"
          onPress={() => router.push("/(tabs)/profile")}
        />
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
              READY TO MEET
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

        <AppButton
          title="Start instant meeting"
          variant="outline"
          textColor="#FFFFFF"
          leftIcon={<Plus color="#FFFFFF" size={21} />}
          rightIcon={<ChevronRight color="#FFFFFF" size={20} />}
          contentAlign="spaceBetween"
          containerStyle={styles.primaryAction}
          style={{
            backgroundColor: "rgba(2,6,24,0.20)",
            borderColor: "rgba(255,255,255,0.46)",
          }}
          onPress={startMeeting}
        />

        <View style={styles.heroUtilities}>
          <Pressable
            onPress={() => router.push("/(tabs)/scheduler")}
            accessibilityRole="button"
            accessibilityLabel="Schedule a meeting"
            style={({ pressed }) => [
              styles.heroUtility,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.heroUtilityIcon}>
              <CalendarPlus color="#FFFFFF" size={17} />
            </View>
            <AppText numberOfLines={1} style={styles.heroUtilityText}>
              Schedule
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/meeting/join")}
            accessibilityRole="button"
            accessibilityLabel="Join a meeting"
            style={({ pressed }) => [
              styles.heroUtility,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.heroUtilityIcon}>
              <Link2 color="#FFFFFF" size={17} />
            </View>
            <AppText numberOfLines={1} style={styles.heroUtilityText}>
              Join meeting
            </AppText>
          </Pressable>
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

          <View style={styles.emptyArrow}>
            <ChevronRight color={colors.secondary} size={20} />
          </View>
        </Pressable>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            {liveMeetings.length > 0 ? "Live now" : "Upcoming meetings"}
          </AppText>

          <AppText
            style={[styles.sectionSubtitle, { color: colors.textMuted }]}
          >
            {liveMeetings.length > 0
              ? "Join an active conversation."
              : "Your next scheduled conversations."}
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/meetings")}
          accessibilityRole="button"
          accessibilityLabel="View all meetings"
          hitSlop={8}
        >
          <AppText style={[styles.viewAll, { color: colors.primary }]}>
            View all
          </AppText>
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

          <View style={styles.emptyArrow}>
            <ChevronRight color={colors.primary} size={20} />
          </View>
        </Pressable>
      )}

      <Pressable
        onPress={() => router.push("/recordings")}
        accessibilityRole="button"
        accessibilityLabel="Open recordings library"
        style={({ pressed }) => [
          styles.recordingShortcut,
          {
            backgroundColor: isDark
              ? "rgba(123, 90, 255, 0.13)"
              : colors.secondarySoft,
            borderColor: `${colors.secondary}2C`,
            opacity: pressed ? 0.76 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.recordingIcon,
            { backgroundColor: `${colors.secondary}1F` },
          ]}
        >
          <Film color={colors.secondary} size={20} />
        </View>

        <View style={styles.recordingCopy}>
          <AppText style={[styles.recordingTitle, { color: colors.text }]}>
            Your meeting library
          </AppText>

          <AppText
            style={[styles.recordingDescription, { color: colors.textMuted }]}
          >
            Replay, download, and share completed recordings.
          </AppText>
        </View>

        <View style={styles.emptyArrow}>
          <ChevronRight color={colors.secondary} size={20} />
        </View>
      </Pressable>

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
    width: 46,
    height: 46,
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

  meetingHero: {
    minHeight: 310,
    overflow: "hidden",
    borderRadius: Radius.card,
    padding: Spacing.five,
    justifyContent: "space-between",
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
    minHeight: 30,
    maxWidth: 148,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(3, 13, 43, 0.40)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  readyDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: "#A7FF5A",
    shadowColor: "#A7FF5A",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 3,
  },

  readyText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.45,
  },

  heroCopy: {
    gap: Spacing.one,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  heroDescription: {
    maxWidth: 300,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },

  primaryAction: {
    marginTop: Spacing.two,
  },

  heroUtilities: {
    width: "100%",
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.24)",
  },

  heroUtility: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(3,13,43,0.18)",
  },

  heroUtilityIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,13,43,0.22)",
  },

  heroUtilityText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },

  emptyArrow: {
    width: 36,
    height: 36,
    marginLeft: "auto",
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  sectionTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: "800",
  },

  meetingList: {
    gap: Spacing.two,
  },

  meetingRow: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  dateBlock: {
    width: 54,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  dateDay: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
  },

  dateMonth: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },

  meetingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },

  meetingTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },

  meetingDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  meetingMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },

  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: Radius.pill,
    opacity: 0.65,
  },

  joinCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
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

  recordingShortcut: {
    minHeight: 94,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  recordingIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  recordingTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },

  recordingDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },

  bottomSpace: {
    height: Spacing.two,
  },
});