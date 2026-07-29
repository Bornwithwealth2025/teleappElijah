import React from "react";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { CalendarDays, RefreshCw } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { MeetingActionPanel } from "@/components/meeting/MeetingActionPanel";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
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
    String(meeting?.room_id ?? meeting?.roomId ?? meeting?.id ?? "")
  );
}

export default function MeetingsScreen() {
  const { colors } = useAppTheme();

  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  const error = useSchedulerStore((state) => state.error);

  React.useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  const renderMeeting = ({ item: meeting }: { item: any }) => {
    const roomId = getMeetingRoomId(meeting);

    const displayDate =
      meeting?.date ??
      meeting?.scheduled_at ??
      meeting?.start_time ??
      meeting?.created_at;

    return (
      <View style={styles.meetingItem}>
        <MeetingCard
          id={roomId}
          title={getMeetingTitle(meeting)}
          time={formatMeetingTime(displayDate)}
          participants={
            meeting?.participants_count ?? meeting?.participants ?? 1
          }
          status="scheduled"
        />
      </View>
    );
  };

  return (
    <AppScreen scroll={false} contentStyle={styles.screenContent}>
      <FlashList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={(meeting, index) =>
          String(meeting?.id ?? meeting?.meeting_url ?? index)
        }
        refreshing={isLoading}
        onRefresh={() => void fetchMeetings()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <AppHeader
              title="Meetings"
              size="page"
              rightSlot={
                <IconButton
                  icon={<RefreshCw color={colors.primary} size={19} />}
                  variant="soft"
                  accessibilityLabel="Refresh meetings"
                  onPress={() => void fetchMeetings()}
                />
              }
            />

            {error ? (
              <AppCard style={styles.errorCard}>
                <AppText variant="caption" style={{ color: colors.danger }}>
                  {error}
                </AppText>

                <Pressable onPress={() => void fetchMeetings()}>
                  <AppText variant="bodyStrong" tone="primary">
                    Try again
                  </AppText>
                </Pressable>
              </AppCard>
            ) : null}

            <MeetingActionPanel />

            <SectionHeader
              title="Scheduled"
              actionLabel={String(meetings.length)}
            />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <AppCard variant="soft" style={styles.emptyCard}>
              <View
                style={[
                  styles.emptyIcon,
                  {
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <CalendarDays color={colors.primary} size={24} />
              </View>

              <AppText variant="sectionTitle">No meetings scheduled</AppText>

              <Pressable
                onPress={() => router.push("/(tabs)/scheduler")}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <AppText variant="bodyStrong" tone="primary">
                  Schedule a meeting
                </AppText>
              </Pressable>
            </AppCard>
          ) : (
            <AppText variant="body" tone="muted" style={styles.loadingText}>
              Loading meetings...
            </AppText>
          )
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },

  listContent: {
    paddingBottom: Spacing.twelve,
  },

  headerContent: {
    gap: Spacing.five,
    paddingBottom: Spacing.four,
  },

  meetingItem: {
    marginBottom: Spacing.three,
  },

  emptyCard: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.eight,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    textAlign: "center",
    paddingVertical: Spacing.six,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },

  errorCard: {
    gap: Spacing.two,
    borderWidth: 1,
  },
});