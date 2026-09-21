import React from "react";
import {
  Alert,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import {
  CalendarClock,
  CalendarDays,
  Link2,
  RefreshCw,
  Video,
} from "lucide-react-native";

import { ScheduleCard } from "@/components/scheduler/ScheduleCard";
import { ScheduleForm } from "@/components/scheduler/ScheduleForm";
import { InvitePeopleSheet } from "@/components/meeting/InvitePeopleSheet";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useSchedulerStore from "@/store/schedulerStore";
import {
  createMeetingUrl,
  getRoomIdFromMeetingUrl,
} from "@/utils/meetingLinks";

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

function getScheduleTitle(item: any) {
  return (
    item?.title ??
    item?.meeting_title ??
    item?.name ??
    `Meeting #${item?.id ?? ""}`
  );
}

function getMeetingLink(item: any) {
  const roomId =
    getRoomIdFromMeetingUrl(item?.meeting_url) ||
    String(item?.room_id ?? item?.roomId ?? "");

  return roomId
    ? createMeetingUrl(roomId)
    : String(item?.meeting_url ?? "");
}

async function copyMeetingLink(item: any) {
  const link = getMeetingLink(item);

  if (!link) {
    Alert.alert("Meeting link unavailable");
    return;
  }

  await Clipboard.setStringAsync(link);
  Alert.alert("Copied", "Meeting link copied to clipboard.");
}

async function shareMeetingLink(item: any) {
  const link = getMeetingLink(item);

  if (!link) {
    Alert.alert("Meeting link unavailable");
    return;
  }

  await Share.share({
    title: "Join my Telefya meeting",
    message: `Join my Telefya meeting: ${link}`,
  });
}

export default function SchedulerScreen() {
  const { colors } = useAppTheme();
  const [inviteMeeting, setInviteMeeting] = React.useState<any>(null);

  const meetings = useSchedulerStore((state) => state.meetings);
  const isLoading = useSchedulerStore((state) => state.isLoading);
  const error = useSchedulerStore((state) => state.error);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);
  const deleteMeetings = useSchedulerStore(
    (state) => state.deleteMeetings,
  );

  React.useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  function confirmDelete(meetingId: string) {
    Alert.alert(
      "Delete scheduled meeting?",
      "Its invitation link will no longer be available. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete meeting",
          style: "destructive",
          onPress: () => void deleteMeetings([meetingId]),
        },
      ],
    );
  }

  return (
    <AppScreen
      tone="aurora"
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
        eyebrow="MEETING PLANNER"
        title="Schedule with clarity"
        subtitle="Create secure meeting rooms, organize your agenda, and send an invitation in moments."
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
          styles.plannerNote,
          {
            backgroundColor: colors.surfaceStrong,
            borderColor: colors.borderStrong,
            borderLeftColor: colors.primary,
          },
        ]}
      >
        <View
          style={[
            styles.plannerIcon,
            { backgroundColor: `${colors.primary}20` },
          ]}
        >
          <CalendarClock color={colors.primary} size={20} />
        </View>

        <View style={styles.plannerCopy}>
          <AppText variant="bodyStrong">
            A meeting link is created automatically
          </AppText>

          <AppText variant="caption" tone="muted">
            Select a time below. After creating it, share the secure Telefya link from your meeting list.
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
          <AppText
            variant="caption"
            style={{ color: colors.danger, fontWeight: "700" }}
          >
            {error}
          </AppText>
        </View>
      ) : null}

      <ScheduleForm />

      <SectionHeader
        title="Your scheduled meetings"
        actionLabel={meetings.length ? String(meetings.length) : undefined}
      />

      <View style={styles.list}>
        {isLoading && meetings.length === 0 ? (
          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.stateIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Video color={colors.primary} size={23} />
            </View>

            <View style={styles.stateCopy}>
              <AppText variant="bodyStrong">
                Loading your schedule
              </AppText>

              <AppText variant="caption" tone="muted">
                Retrieving your upcoming meetings.
              </AppText>
            </View>
          </View>
        ) : null}

        {!isLoading && meetings.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
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
              Your schedule is open
            </AppText>

            <AppText
              variant="caption"
              tone="muted"
              style={styles.emptyCopy}
            >
              Create your first scheduled meeting above. It will appear here with quick share and delete controls.
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
              guests={item?.participants_count ?? item?.participants ?? 0}
              status={item?.status}
              onStart={() => {
                if (!roomId) {
                  Alert.alert("Meeting unavailable");
                  return;
                }

                router.push({
                  pathname: "/meeting/[meetingId]",
                  params: {
                    meetingId: roomId,
                    host: "true",
                  },
                });
              }}
              onCopy={() => void copyMeetingLink(item)}
              onShare={() => void shareMeetingLink(item)}
              onInvite={() => setInviteMeeting(item)}
              onDelete={() => {
                if (!item?.id) {
                  Alert.alert(
                    "Unable to delete",
                    "This meeting does not have a valid backend ID.",
                  );
                  return;
                }

                confirmDelete(String(item.id));
              }}
            />
          );
        })}
      </View>

      <InvitePeopleSheet
        visible={Boolean(inviteMeeting)}
        meetingId={inviteMeeting?.id ?? null}
        meetingTitle={getScheduleTitle(inviteMeeting)}
        onClose={() => setInviteMeeting(null)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.twelve,
  },
  plannerNote: {
    minHeight: 92,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  plannerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  plannerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  stateCard: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  stateCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  emptyCard: {
    minHeight: 220,
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
  emptyCopy: {
    maxWidth: 290,
    textAlign: "center",
    lineHeight: 20,
  },
});