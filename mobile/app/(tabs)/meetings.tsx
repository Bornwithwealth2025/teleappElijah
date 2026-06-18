import React from "react";
import { RefreshControl, StyleSheet, View } from "react-native";

import { MeetingActionPanel } from "@/components/meeting/MeetingActionPanel";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import useSchedulerStore from "@/store/schedulerStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function formatMeetingTime(value?: string | null) {
  if (!value) return "Scheduled meeting";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Scheduled meeting";

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

export default function MeetingsScreen() {
  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  const refreshControl = (
    <RefreshControl refreshing={isLoading} onRefresh={() => void fetchMeetings()} />
  );

  return (
    <AppScreen contentStyle={styles.content} refreshControl={refreshControl as any}>
      <AppHeader
        eyebrow="MEETINGS"
        title="Meeting rooms"
        subtitle="Start live rooms, join scheduled sessions, and review recent calls."
      />

      <MeetingActionPanel />

      <SectionHeader title="Scheduled rooms" actionLabel={`${meetings.length}`} />

      <View style={styles.list}>
        {isLoading && meetings.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            Loading meetings...
          </AppText>
        ) : null}

        {!isLoading && meetings.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            No scheduled rooms yet.
          </AppText>
        ) : null}

        {meetings.map((meeting: any) => {
          const roomId =
            getRoomIdFromMeetingUrl(meeting?.meeting_url) ||
            String(meeting?.room_id ?? meeting?.roomId ?? meeting?.id ?? "");

          const displayDate =
            meeting?.date ??
            meeting?.scheduled_at ??
            meeting?.start_time ??
            meeting?.created_at;

          return (
            <MeetingCard
              key={String(meeting?.id ?? roomId)}
              id={roomId}
              title={getMeetingTitle(meeting)}
              time={formatMeetingTime(displayDate)}
              participants={meeting?.participants_count ?? meeting?.participants ?? 1}
              status="scheduled"
            />
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },
  list: {
    gap: Spacing.three,
  },
  centerText: {
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
});