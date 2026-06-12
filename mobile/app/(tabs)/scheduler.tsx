import React from "react";
import { router } from "expo-router";
import { Alert, Platform, Share, StyleSheet, TouchableOpacity, View } from "react-native";

import { ScheduleCard } from "@/components/scheduler/ScheduleCard";
import { ScheduleForm } from "@/components/scheduler/ScheduleForm";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import useSchedulerStore from "@/store/schedulerStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function formatScheduleDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Scheduled";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatScheduleTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Meeting link";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

async function copyText(value: string) {
  if (Platform.OS === "web" && navigator?.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }

  Alert.alert("Meeting link", value);
}

export default function SchedulerScreen() {
  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const deleteMeetings = useSchedulerStore((state) => state.deleteMeetings);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="SCHEDULER"
        title="Plan meetings"
        subtitle="Create future meeting links and keep upcoming calls organized."
      />

      <ScheduleForm />

      <SectionHeader title="Scheduled" actionLabel={`${meetings.length}`} />

      <View style={styles.list}>
        {isLoading ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            Loading meetings...
          </AppText>
        ) : null}

        {!isLoading && meetings.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            No scheduled meetings yet.
          </AppText>
        ) : null}

        {meetings.map((item) => {
          const displayDate = item.date ?? item.created_at;
          const roomId = getRoomIdFromMeetingUrl(item.meeting_url);

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.78}
              onPress={() => router.push(`/meeting/${roomId}`)}
            >
              <ScheduleCard
                title={`Meeting #${item.id}`}
                date={formatScheduleDate(displayDate)}
                time={formatScheduleTime(displayDate)}
                guests={1}
                onCopy={() => copyText(item.meeting_url)}
                onDelete={() => deleteMeetings([String(item.id)])}
              />
            </TouchableOpacity>
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