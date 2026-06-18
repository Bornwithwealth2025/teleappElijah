import React from "react";
import { Alert, Platform, Share, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { ScheduleCard } from "@/components/scheduler/ScheduleCard";
import { ScheduleForm } from "@/components/scheduler/ScheduleForm";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import useSchedulerStore from "@/store/schedulerStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function formatScheduleDate(value?: string | null) {
  if (!value) return "Scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Scheduled";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatScheduleTime(value?: string | null) {
  if (!value) return "Meeting link";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Meeting link";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

async function shareMeetingLink(value?: string | null) {
  if (!value) {
    Alert.alert("Meeting link", "No meeting link available.");
    return;
  }

  if (Platform.OS === "web" && navigator?.clipboard) {
    await navigator.clipboard.writeText(value);
    Alert.alert("Meeting link", "Meeting link copied.");
    return;
  }

  await Share.share({ message: value });
}

function getScheduleTitle(item: any) {
  return (
    item?.title ??
    item?.meeting_title ??
    item?.name ??
    `Meeting #${item?.id ?? ""}`
  );
}

export default function SchedulerScreen() {
  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const deleteMeetings = useSchedulerStore((state) => state.deleteMeetings);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        eyebrow="SCHEDULER"
        title="Plan meetings"
        subtitle="Create future meeting links and keep upcoming calls organized."
      />

      <ScheduleForm />

      <SectionHeader title="Scheduled" actionLabel={`${meetings.length}`} />

      <View style={styles.list}>
        {isLoading && meetings.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            Loading meetings...
          </AppText>
        ) : null}

        {!isLoading && meetings.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.centerText}>
            No scheduled meetings yet.
          </AppText>
        ) : null}

        {meetings.map((item: any) => {
          const displayDate =
            item?.date ??
            item?.scheduled_at ??
            item?.start_time ??
            item?.created_at;

          const roomId =
            getRoomIdFromMeetingUrl(item?.meeting_url) ||
            String(item?.room_id ?? item?.roomId ?? item?.id ?? "");

          return (
            <TouchableOpacity
              key={String(item?.id ?? roomId)}
              activeOpacity={0.78}
              onPress={() => {
                if (roomId) router.push(`/meeting/${roomId}` as any);
              }}
            >
              <ScheduleCard
                title={getScheduleTitle(item)}
                date={formatScheduleDate(displayDate)}
                time={formatScheduleTime(displayDate)}
                guests={item?.participants_count ?? item?.participants ?? 1}
                onCopy={() => shareMeetingLink(item?.meeting_url)}
                onDelete={() => deleteMeetings([String(item?.id)])}
              />
            </TouchableOpacity>
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