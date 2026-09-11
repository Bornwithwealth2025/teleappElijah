import React from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  CalendarDays,
  Link2,
  RefreshCw,
  Video,
} from "lucide-react-native";

import { ScheduleCard } from "@/components/scheduler/ScheduleCard";
import { ScheduleForm } from "@/components/scheduler/ScheduleForm";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useSchedulerStore from "@/store/schedulerStore";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function formatScheduleDate(value?: string | null) {
  if (!value) {
    return "Scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Scheduled";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatScheduleTime(value?: string | null) {
  if (!value) {
    return "Meeting link";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Meeting link";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

async function shareMeetingLink(value?: string | null) {
  if (!value) {
    Alert.alert(
      "Meeting link",
      "No meeting link is available for this room.",
    );
    return;
  }

  if (
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    navigator.clipboard
  ) {
    await navigator.clipboard.writeText(value);
    Alert.alert("Meeting link", "Meeting link copied.");
    return;
  }

  await Share.share({
    title: "Join my Telefya meeting",
    message: value,
  });
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
  const { colors } = useAppTheme();

  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const deleteMeetings = useSchedulerStore((state) => state.deleteMeetings);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);
  const error = useSchedulerStore((state) => state.error);

  React.useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  function confirmDelete(meetingId: string) {
    Alert.alert(
      "Delete meeting?",
      "This will remove the scheduled meeting. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteMeetings([meetingId]),
        },
      ],
    );
  }

  return (
    <AppScreen
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => void fetchMeetings()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader
        title="Schedule"
        size="page"
        rightSlot={
          <IconButton
            icon={<RefreshCw color={colors.primary} size={19} />}
            variant="soft"
            accessibilityLabel="Refresh scheduled meetings"
            onPress={() => void fetchMeetings()}
          />
        }
      />

      <View
        style={[
          styles.introCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <View
          style={[
            styles.introIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <CalendarDays color={colors.primary} size={21} />
        </View>

        <View style={styles.introCopy}>
          <AppText variant="bodyStrong">
            Plan your next conversation
          </AppText>

          <AppText variant="caption" tone="muted">
            Create a shareable meeting link and invite your team when ready.
          </AppText>
        </View>
      </View>

      {error ? (
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: `${colors.danger}10`,
              borderColor: `${colors.danger}35`,
            },
          ]}
        >
          <AppText variant="caption" style={{ color: colors.danger }}>
            {error}
          </AppText>
        </View>
      ) : null}

      <ScheduleForm />

      <View style={styles.sectionRow}>
        <SectionHeader
          title="Scheduled meetings"
          actionLabel={String(meetings.length)}
        />
      </View>

      <View style={styles.list}>
        {isLoading && meetings.length === 0 ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <View
              style={[
                styles.loadingIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Video color={colors.primary} size={22} />
            </View>

            <AppText variant="bodyStrong">
              Loading meetings
            </AppText>
          </View>
        ) : null}

        {!isLoading && meetings.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Link2 color={colors.primary} size={25} />
            </View>

            <AppText variant="sectionTitle">
              No meetings scheduled
            </AppText>

            <AppText
              variant="caption"
              tone="muted"
              style={styles.centerText}
            >
              Schedule a meeting above and share the link with participants.
            </AppText>
          </View>
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
            <ScheduleCard
              key={String(item?.id ?? roomId)}
              title={getScheduleTitle(item)}
              date={formatScheduleDate(displayDate)}
              time={formatScheduleTime(displayDate)}
              guests={item?.participants_count ?? item?.participants ?? 1}
              onPress={() => {
                if (!roomId) {
                  Alert.alert(
                    "Meeting unavailable",
                    "This meeting does not have a valid room ID.",
                  );
                  return;
                }

                router.push({
                  pathname: "/meeting/[meetingId]",
                  params: { meetingId: roomId },
                });
              }}
              onCopy={() => void shareMeetingLink(item?.meeting_url)}
              onDelete={() => {
                const backendMeetingId = item?.id;

                if (!backendMeetingId) {
                  Alert.alert(
                    "Unable to delete",
                    "This meeting does not have a valid backend ID.",
                  );
                  return;
                }

                confirmDelete(String(backendMeetingId));
              }}
            />
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },

  introCard: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  introIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  introCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  sectionRow: {
    marginTop: Spacing.one,
  },

  list: {
    gap: Spacing.two,
  },

  loadingCard: {
    minHeight: 142,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  loadingIcon: {
    width: 54,
    height: 54,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    minHeight: 210,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  centerText: {
    textAlign: "center",
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
  },
});