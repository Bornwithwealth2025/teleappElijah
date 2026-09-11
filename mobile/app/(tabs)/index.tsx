import React from "react";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Film,
  ScreenShare,
  Users,
  Video,
} from "lucide-react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { BASE_URL } from "@/api/client";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useSchedulerStore from "@/store/schedulerStore";
import useUserStore from "@/store/userStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function createRoomId() {
  return `telefya-${Math.random().toString(36).slice(2, 10)}`;
}

function getValue(...values: unknown[]) {
  return values.find(
    (value) =>
      value !== null && value !== undefined && String(value).trim() !== "",
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
  if (/^https?:\/\//i.test(value)) return value;

  return `${BASE_URL.replace("/api/v2", "")}/${value.replace(/^\/+/, "")}`;
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
}

function formatMeetingTime(value?: string | null) {
  if (!value) return "Scheduled meeting";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Scheduled meeting";
  }

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

type QuickAction = {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
};

type MeetingRowProps = {
  title: string;
  time: string;
  color: string;
  onJoin: () => void;
};

function MeetingRow({ title, time, color, onJoin }: MeetingRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.meetingRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.meetingIcon, { backgroundColor: `${color}22` }]}>
        <Video color={color} size={18} />
      </View>

      <View style={styles.meetingCopy}>
        <AppText
          numberOfLines={1}
          style={[styles.meetingTitle, { color: colors.text }]}
        >
          {title}
        </AppText>
        <AppText style={[styles.meetingTime, { color: colors.textMuted }]}>
          {time}
        </AppText>
      </View>

      <Pressable
        onPress={onJoin}
        accessibilityRole="button"
        accessibilityLabel={`Join ${title}`}
        style={({ pressed }) => [
          styles.joinButton,
          { backgroundColor: color },
          pressed && styles.pressed,
        ]}
      >
        <AppText style={styles.joinButtonText}>Join</AppText>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useAppTheme();

  const authUser = useAuthStore((state) => state.user);

  const profile = useUserStore((state) => state.profile);
  const profileLoading = useUserStore((state) => state.isLoading);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  const meetings = useSchedulerStore((state) => state.meetings);
  const meetingsLoading = useSchedulerStore((state) => state.isLoading);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

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

  const upcomingMeetings = meetings.slice(0, 3);

  // Cycles through the same four brand accents used everywhere else in the
  // app (primary/success/danger/secondary), so each meeting row gets its
  // own identity without inventing a new color system just for this list.
  const rowAccents = [
    colors.success,
    colors.danger,
    colors.primary,
    colors.secondary,
  ];

  const startMeeting = () => {
    router.push({
      pathname: "/meeting/[meetingId]",
      params: { meetingId: createRoomId() },
    });
  };

  const refresh = async () => {
    await Promise.allSettled([fetchProfile(), fetchMeetings()]);
  };

  const quickActions: QuickAction[] = [
    {
      key: "new",
      label: "New Meeting",
      icon: <Video color="#FFFFFF" size={22} />,
      color: colors.primary,
      onPress: startMeeting,
    },
    {
      key: "join",
      label: "Join Meeting",
      icon: <Users color="#FFFFFF" size={22} />,
      color: colors.success,
      // Assumption: no dedicated "join by code" route was in the files I
      // have, so this opens the meetings list for now — point me at the
      // real route if there is one and I'll wire it in directly.
      onPress: () => router.push("/(tabs)/meetings"),
    },
    {
      key: "schedule",
      label: "Schedule",
      icon: <CalendarPlus color="#FFFFFF" size={22} />,
      color: colors.danger,
      onPress: () => router.push("/(tabs)/scheduler"),
    },
    {
      key: "share",
      label: "Share Screen",
      icon: <ScreenShare color="#FFFFFF" size={22} />,
      color: colors.secondary,
      // Assumption: screen share is a live-meeting action, not a standalone
      // one — this starts an instant meeting, same as "New Meeting", so
      // sharing can be turned on once inside. Swap this out if there's a
      // different flow intended.
      onPress: startMeeting,
    },
  ];

  return (
    <AppScreen
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
              { backgroundColor: colors.primarySoft, borderColor: colors.border },
            ]}
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.avatar}
                accessibilityLabel={`${profileName} profile image`}
              />
            ) : (
              <AppText style={[styles.avatarInitial, { color: colors.primary }]}>
                {profileName.charAt(0).toUpperCase()}
              </AppText>
            )}
          </View>

          <View>
            <AppText style={[styles.greetingName, { color: colors.text }]}>
              Hello, {firstName} 👋
            </AppText>
            <AppText style={[styles.greetingSub, { color: colors.textMuted }]}>
              {getTimeGreeting()}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={({ pressed }) => [
            styles.bellButton,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <Bell color={colors.text} size={19} />
        </Pressable>
      </View>

      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[styles.quickActionCircle, { backgroundColor: action.color }]}
            >
              {action.icon}
            </View>
            <AppText
              numberOfLines={1}
              style={[styles.quickActionLabel, { color: colors.textMuted }]}
            >
              {action.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming Meetings
          </AppText>

          <Pressable
            onPress={() => router.push("/(tabs)/meetings")}
            hitSlop={8}
          >
            <AppText style={[styles.viewAll, { color: colors.primary }]}>
              View all
            </AppText>
          </Pressable>
        </View>

        {meetingsLoading && meetings.length === 0 ? (
          <View style={styles.loadingState}>
            <AppText style={{ color: colors.textMuted, fontSize: 12 }}>
              Loading meetings…
            </AppText>
          </View>
        ) : upcomingMeetings.length > 0 ? (
          <View style={styles.meetingList}>
            {upcomingMeetings.map((meeting, index) => (
              <MeetingRow
                key={String(meeting?.id ?? meeting?.meeting_url)}
                title={getMeetingTitle(meeting)}
                time={formatMeetingTime(
                  meeting?.date ??
                    meeting?.scheduled_at ??
                    meeting?.start_time ??
                    meeting?.created_at,
                )}
                color={rowAccents[index % rowAccents.length]}
                onJoin={() =>
                  router.push({
                    pathname: "/meeting/[meetingId]",
                    params: { meetingId: getMeetingRoomId(meeting) },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => router.push("/(tabs)/scheduler")}
            style={({ pressed }) => [
              styles.emptyState,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.meetingIcon,
                { backgroundColor: `${colors.primary}22` },
              ]}
            >
              <CalendarDays color={colors.primary} size={18} />
            </View>

            <View style={styles.meetingCopy}>
              <AppText style={[styles.meetingTitle, { color: colors.text }]}>
                No upcoming meetings
              </AppText>
              <AppText style={[styles.meetingTime, { color: colors.textMuted }]}>
                Schedule one to see it here
              </AppText>
            </View>

            <ChevronRight color={colors.textSoft} size={18} />
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            Recent
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push("/recordings")}
          style={({ pressed }) => [
            styles.recentRow,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.meetingIcon,
              { backgroundColor: `${colors.secondary}22` },
            ]}
          >
            <Film color={colors.secondary} size={18} />
          </View>

          <View style={styles.meetingCopy}>
            <AppText style={[styles.meetingTitle, { color: colors.text }]}>
              Recordings
            </AppText>
            <AppText style={[styles.meetingTime, { color: colors.textMuted }]}>
              View your recent meetings
            </AppText>
          </View>

          <ChevronRight color={colors.textSoft} size={18} />
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flex: 1,
    minWidth: 0,
  },

  avatarShell: {
    width: 46,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarInitial: {
    fontSize: 17,
    fontWeight: "800",
  },

  greetingName: {
    fontSize: 15,
    fontWeight: "800",
  },

  greetingSub: {
    fontSize: 12,
    marginTop: 1,
  },

  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quickAction: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },

  quickActionCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionLabel: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "800",
  },

  meetingList: {
    gap: Spacing.two,
  },

  meetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
  },

  meetingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  meetingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  meetingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  meetingTime: {
    fontSize: 12,
  },

  joinButton: {
    minWidth: 56,
    minHeight: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },

  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  loadingState: {
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});