import React from "react";
import { StyleSheet, View } from "react-native";

import { MeetingActionPanel } from "@/components/meeting/MeetingActionPanel";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import useSchedulerStore from "@/store/schedulerStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function formatMeetingTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Scheduled meeting";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MeetingsScreen() {
  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="MEETINGS"
        title="Meeting rooms"
        subtitle="Start live rooms, join scheduled sessions, and review recent calls."
      />

      <MeetingActionPanel />

      <SectionHeader title="Scheduled rooms" actionLabel={`${meetings.length}`} />

      <View style={styles.list}>
        {isLoading ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            Loading meetings...
          </AppText>
        ) : null}

        {!isLoading && meetings.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            No scheduled rooms yet.
          </AppText>
        ) : null}

        {meetings.map((meeting) => {
          const roomId = getRoomIdFromMeetingUrl(meeting.meeting_url);
          const displayDate = meeting.date ?? meeting.created_at;

          return (
            <MeetingCard
              key={meeting.id}
              id={roomId}
              title={`Meeting #${meeting.id}`}
              time={formatMeetingTime(displayDate)}
              participants={1}
              status="scheduled"
            />
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  centerText: {
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
});