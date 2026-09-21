import React from "react";
import { router } from "expo-router";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Radio,
  RefreshCw,
  Users,
  Video,
  X,
} from "lucide-react-native";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import MeetingInvitationService from "@/api/meeting-invitation.service";
import { MeetingActionPanel } from "@/components/meeting/MeetingActionPanel";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import {
  Radius,
  Spacing,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useMeetingInboxStore from "@/store/meetingInboxStore";
import type { InboxMeeting } from "@/types/user.types";
import { getRoomIdFromMeetingUrl } from "@/utils/meetingLinks";

function getTitle(meeting: InboxMeeting) {
  return meeting.des?.trim() || "Telefya meeting";
}

function getRoomId(meeting: InboxMeeting) {
  return (
    getRoomIdFromMeetingUrl(meeting.meeting_url) ||
    meeting.room_id ||
    String(meeting.id)
  );
}

function formatTime(meeting: InboxMeeting) {
  const value = meeting.scheduled_for || meeting.created_at;

  if (!value) return "Scheduled meeting";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Scheduled meeting";
  }

  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type MeetingRowProps = {
  meeting: InboxMeeting;
  kind: "live" | "upcoming" | "invitation";
  busy: boolean;
  onOpen: () => void;
  onRespond: (status: "accepted" | "declined") => void;
};

function MeetingRow({
  meeting,
  kind,
  busy,
  onOpen,
  onRespond,
}: MeetingRowProps) {
  const { colors } = useAppTheme();
  const isLive = kind === "live";
  const isInvitation = kind === "invitation";

  const accent = isLive
    ? colors.success
    : isInvitation
      ? colors.secondary
      : colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isLive
            ? `${colors.success}58`
            : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: `${accent}20`,
            borderColor: `${accent}38`,
          },
        ]}
      >
        {isLive ? (
          <Radio color={accent} size={20} />
        ) : isInvitation ? (
          <Users color={accent} size={20} />
        ) : (
          <CalendarDays color={accent} size={20} />
        )}
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {getTitle(meeting)}
          </AppText>

          {isLive ? (
            <View
              style={[
                styles.livePill,
                { backgroundColor: `${colors.success}1C` },
              ]}
            >
              <View
                style={[
                  styles.liveDot,
                  { backgroundColor: colors.success },
                ]}
              />
              <AppText
                variant="label"
                style={{ color: colors.success }}
              >
                Live
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Clock3 color={colors.textSoft} size={14} />
          <AppText variant="caption" tone="muted">
            {formatTime(meeting)}
          </AppText>
        </View>

        {meeting.host_name ? (
          <AppText variant="caption" tone="muted">
            Hosted by {meeting.host_name}
          </AppText>
        ) : null}
      </View>

      {!isInvitation ? (
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={
            meeting.relationship === "host"
              ? `Start ${getTitle(meeting)}`
              : `Join ${getTitle(meeting)}`
          }
          style={({ pressed }) => [
            styles.openButton,
            {
              backgroundColor: accent,
              opacity: pressed ? 0.74 : 1,
            },
          ]}
        >
          {meeting.relationship === "host" ? (
            <Video color="#FFFFFF" size={18} />
          ) : (
            <ChevronRight color="#FFFFFF" size={19} />
          )}
        </Pressable>
      ) : null}

      {isInvitation ? (
        <View style={styles.invitationActions}>
          <Pressable
            disabled={busy}
            onPress={() => onRespond("declined")}
            accessibilityRole="button"
            accessibilityLabel={`Decline ${getTitle(meeting)}`}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: colors.borderStrong,
                opacity: pressed || busy ? 0.65 : 1,
              },
            ]}
          >
            <X color={colors.textMuted} size={17} />
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={() => onRespond("accepted")}
            accessibilityRole="button"
            accessibilityLabel={`Accept ${getTitle(meeting)}`}
            style={({ pressed }) => [
              styles.primaryAction,
              {
                backgroundColor: accent,
                opacity: pressed || busy ? 0.65 : 1,
              },
            ]}
          >
            <Check color="#FFFFFF" size={17} />
            <AppText style={styles.acceptText}>
              {busy ? "Saving" : "Accept"}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

type SectionProps = {
  title: string;
  subtitle: string;
  kind: "live" | "upcoming" | "invitation";
  meetings: InboxMeeting[];
  busyId: string | number | null;
  onOpen: (meeting: InboxMeeting) => void;
  onRespond: (
    meeting: InboxMeeting,
    status: "accepted" | "declined",
  ) => void;
};

function MeetingSection({
  title,
  subtitle,
  kind,
  meetings,
  busyId,
  onOpen,
  onRespond,
}: SectionProps) {
  if (!meetings.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        </View>

        <AppText variant="label" tone="primary">
          {meetings.length}
        </AppText>
      </View>

      <View style={styles.sectionList}>
        {meetings.map((meeting) => (
          <MeetingRow
            key={`${kind}-${meeting.id}-${meeting.membership_id ?? ""}`}
            meeting={meeting}
            kind={kind}
            busy={String(busyId) === String(meeting.membership_id)}
            onOpen={() => onOpen(meeting)}
            onRespond={(status) => onRespond(meeting, status)}
          />
        ))}
      </View>
    </View>
  );
}

export default function MeetingsScreen() {
  const { colors } = useAppTheme();
  const inbox = useMeetingInboxStore((state) => state.inbox);
  const isLoading = useMeetingInboxStore((state) => state.isLoading);
  const error = useMeetingInboxStore((state) => state.error);
  const fetchInbox = useMeetingInboxStore(
    (state) => state.fetchInbox,
  );

  const [busyId, setBusyId] = React.useState<
    string | number | null
  >(null);

  React.useEffect(() => {
    void fetchInbox();
  }, [fetchInbox]);

  function openMeeting(meeting: InboxMeeting) {
    const roomId = getRoomId(meeting);

    router.push({
      pathname: "/meeting/[meetingId]",
      params: {
        meetingId: roomId,
        ...(meeting.relationship === "host"
          ? { host: "true" }
          : {}),
      },
    });
  }

  async function respondToInvitation(
    meeting: InboxMeeting,
    status: "accepted" | "declined",
  ) {
    if (!meeting.membership_id) {
      Alert.alert("Invitation unavailable");
      return;
    }

    try {
      setBusyId(meeting.membership_id);

      const response =
        await MeetingInvitationService.respondToInvitation(
          meeting.membership_id,
          status,
        );

      if (response?.success === false) {
        throw new Error(
          response.message || "Unable to update invitation.",
        );
      }

      await fetchInbox();

      if (status === "accepted") {
        openMeeting(meeting);
      }
    } catch (responseError) {
      Alert.alert(
        "Unable to update invitation",
        responseError instanceof Error
          ? responseError.message
          : "Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const meetingCount =
    inbox.live.length +
    inbox.upcoming.length +
    inbox.invitations.length;

  return (
    <AppScreen
      tone="aurora"
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => void fetchInbox()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader
        eyebrow="YOUR WORKSPACE"
        title="Meetings"
        subtitle="Your live rooms, invitations, and upcoming conversations."
        size="page"
        rightSlot={
          <IconButton
            icon={<RefreshCw color={colors.primary} size={18} />}
            variant="surface"
            size={42}
            accessibilityLabel="Refresh meetings"
            onPress={() => void fetchInbox()}
          />
        }
      />

      <MeetingActionPanel />

      {error ? (
        <Pressable
          onPress={() => void fetchInbox()}
          style={[
            styles.errorCard,
            {
              backgroundColor: `${colors.danger}10`,
              borderColor: `${colors.danger}38`,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: colors.danger, fontWeight: "700" }}
          >
            {error} Tap to retry.
          </AppText>
        </Pressable>
      ) : null}

      <MeetingSection
        title="Live now"
        subtitle="Join an active meeting."
        kind="live"
        meetings={inbox.live}
        busyId={busyId}
        onOpen={openMeeting}
        onRespond={respondToInvitation}
      />

      <MeetingSection
        title="Invitations"
        subtitle="Respond before joining."
        kind="invitation"
        meetings={inbox.invitations}
        busyId={busyId}
        onOpen={openMeeting}
        onRespond={respondToInvitation}
      />

      <MeetingSection
        title="Upcoming"
        subtitle={`${meetingCount} meeting${
          meetingCount === 1 ? "" : "s"
        } in your workspace.`}
        kind="upcoming"
        meetings={inbox.upcoming}
        busyId={busyId}
        onOpen={openMeeting}
        onRespond={respondToInvitation}
      />

      {!isLoading && meetingCount === 0 ? (
        <View
          style={[
            styles.emptyState,
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
            <CalendarDays color={colors.primary} size={24} />
          </View>

          <AppText variant="sectionTitle">
            Your calendar is clear
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.emptyCopy}
          >
            Start an instant meeting, join with a link, or schedule one for later.
          </AppText>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.twelve,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionList: {
    gap: Spacing.two,
  },
  card: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  icon: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  livePill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
  openButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  invitationActions: {
    gap: Spacing.one,
    alignItems: "flex-end",
  },
  primaryAction: {
    minHeight: 34,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  secondaryAction: {
    width: 34,
    height: 30,
    borderWidth: 1,
    borderRadius: Radius.small,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.five,
    alignItems: "center",
    gap: Spacing.two,
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCopy: {
    textAlign: "center",
  },
});