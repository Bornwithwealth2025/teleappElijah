import React from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Film,
  UserRound,
} from "lucide-react-native";

import { MeetingActionPanel } from "@/components/meeting/MeetingActionPanel";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { SCREEN, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useSchedulerStore from "@/store/schedulerStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function formatMeetingTime(value?: string | null) {
  if (!value) return "Scheduled meeting";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Scheduled meeting";
  }

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
    String(
      meeting?.room_id ??
        meeting?.roomId ??
        meeting?.id ??
        "",
    )
  );
}

export default function HomeScreen() {
  const { colors } = useAppTheme();

  const user = useAuthStore((state) => state.user);

  const meetings = useSchedulerStore(
    (state) => state.meetings,
  );
  const isLoading = useSchedulerStore(
    (state) => state.isLoading,
  );
  const fetchMeetings = useSchedulerStore(
    (state) => state.fetchMeetings,
  );

  React.useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  const firstName =
    user?.first_name ||
    user?.email?.split("@")[0] ||
    "there";

  const upcomingMeetings = meetings.slice(0, 3);

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        leftSlot={
          <TelifierLogo
            size={SCREEN.isSmallWidth ? "sm" : "md"}
          />
        }
        title={`Good to see you, ${firstName}.`}
        rightSlot={
          <>
            <IconButton
              icon={<Bell color={colors.primary} size={19} />}
              variant="soft"
              size={SCREEN.isSmallWidth ? 40 : 44}
              accessibilityLabel="Notifications"
            />

            <IconButton
              icon={<UserRound color={colors.primary} size={19} />}
              variant="soft"
              size={SCREEN.isSmallWidth ? 40 : 44}
              accessibilityLabel="Open profile"
              onPress={() =>
                router.push("/(tabs)/profile")
              }
            />
          </>
        }
      />

      <MeetingActionPanel />

      <Pressable
        onPress={() => router.push("/recordings")}
        style={({ pressed }) => [
          styles.linkPressable,
          pressed && styles.pressed,
        ]}
      >
        <AppCard
          compact
          variant="soft"
          style={styles.linkCard}
        >
          <View
            style={[
              styles.linkIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Film color={colors.primary} size={20} />
          </View>

          <View style={styles.linkCopyWrap}>
            <AppText variant="bodyStrong">
              Recordings
            </AppText>
          </View>

          <ArrowUpRight
            color={colors.primary}
            size={20}
          />
        </AppCard>
      </Pressable>

      <SectionHeader
        title="Upcoming meetings"
        rightSlot={
          <Pressable
            hitSlop={8}
            onPress={() =>
              router.push("/(tabs)/meetings")
            }
            style={({ pressed }) => [
              styles.viewAll,
              pressed && styles.pressed,
            ]}
          >
            <AppText variant="bodyStrong" tone="primary">
              View all
            </AppText>

            <ChevronRight
              color={colors.primary}
              size={17}
            />
          </Pressable>
        }
      />

      {isLoading && meetings.length === 0 ? (
        <AppCard
          variant="soft"
          compact
          style={styles.loadingCard}
        >
          <ActivityIndicator color={colors.primary} />
          <AppText variant="caption" tone="muted">
            Loading meetings...
          </AppText>
        </AppCard>
      ) : upcomingMeetings.length > 0 ? (
        <View style={styles.meetingList}>
          {upcomingMeetings.map((meeting) => (
            <MeetingCard
              key={String(
                meeting?.id ??
                  meeting?.meeting_url,
              )}
              id={getMeetingRoomId(meeting)}
              title={getMeetingTitle(meeting)}
              time={formatMeetingTime(
                meeting?.date ??
                  meeting?.scheduled_at ??
                  meeting?.start_time ??
                  meeting?.created_at,
              )}
              participants={
                meeting?.participants_count ??
                meeting?.participants ??
                1
              }
              status="scheduled"
            />
          ))}
        </View>
      ) : (
        <AppCard
          variant="soft"
          compact
          style={styles.emptyCard}
        >
          <CalendarDays color={colors.primary} size={22} />

          <View style={styles.emptyCopy}>
            <AppText variant="bodyStrong">
              No upcoming meetings
            </AppText>

            <AppText variant="caption" tone="muted">
              Scheduled meetings appear here.
            </AppText>
          </View>
        </AppCard>
      )}

      <Pressable
        onPress={() =>
          router.push("/(tabs)/scheduler")
        }
        style={({ pressed }) => [
          styles.linkPressable,
          pressed && styles.pressed,
        ]}
      >
        <AppCard
          compact
          variant="soft"
          style={styles.linkCard}
        >
          <View
            style={[
              styles.linkIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <CalendarPlus
              color={colors.primary}
              size={20}
            />
          </View>

          <View style={styles.linkCopyWrap}>
            <AppText variant="bodyStrong">
              Schedule a meeting
            </AppText>
          </View>

          <ArrowUpRight
            color={colors.primary}
            size={20}
          />
        </AppCard>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SCREEN.isShortHeight
      ? Spacing.three
      : Spacing.five,
  },

  meetingList: {
    gap: Spacing.three,
  },

  loadingCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  emptyCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  emptyCopy: {
    flex: 1,
    gap: 2,
  },

  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  linkPressable: {
    width: "100%",
  },

  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  linkCopyWrap: {
    flex: 1,
    gap: 2,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
});