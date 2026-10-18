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
import { Tap } from "@/components/ui/Tap";
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
  const { colors, isDark } = useAppTheme();
  const isLive = kind === "live";
  const isInvitation = kind === "invitation";

  const accent = isLive
    ? colors.success
    : isInvitation
      ? colors.secondary
      : colors.primary;

  const body = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.045)"
            : colors.card,
          borderColor: isLive
            ? `${colors.success}58`
            : isDark
              ? "rgba(255,255,255,0.12)"
              : colors.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.icon, { backgroundColor: accent }]}>
          {isLive ? (
            <Radio color="#FFFFFF" size={22} />
          ) : isInvitation ? (
            <Users color="#FFFFFF" size={22} />
          ) : (
            <CalendarDays color="#FFFFFF" size={22} />
          )}
        </View>

        <View style={styles.copy}>
          <AppText
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {getTitle(meeting)}
          </AppText>

          <View style={styles.metaRow}>
            <Clock3 color={colors.textSoft} size={15} />
            <AppText
              numberOfLines={1}
              style={[styles.meta, { color: colors.textMuted }]}
            >
              {formatTime(meeting)}
            </AppText>
          </View>

          {meeting.host_name ? (
            <AppText
              numberOfLines={1}
              style={[styles.meta, { color: colors.textMuted }]}
            >
              Hosted by {meeting.host_name}
            </AppText>
          ) : null}
        </View>

        {isLive ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <AppText style={styles.liveText}>LIVE</AppText>
          </View>
        ) : !isInvitation ? (
          <View
            style={[
              styles.openCircle,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : colors.primarySoft,
                borderColor: isDark
                  ? "rgba(255,255,255,0.16)"
                  : `${colors.primary}33`,
              },
            ]}
          >
            {meeting.relationship === "host" ? (
              <Video color={colors.text} size={17} />
            ) : (
              <ChevronRight color={colors.text} size={18} />
            )}
          </View>
        ) : null}
      </View>

      {isInvitation ? (
        <View style={styles.invitationActions}>
          <Tap
            label={`Decline ${getTitle(meeting)}`}
            disabled={busy}
            onPress={() => onRespond("declined")}
            style={styles.actionFlex}
          >
            <View
              style={[
                styles.declineButton,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.16)"
                    : colors.borderStrong,
                },
              ]}
            >
              <X color={colors.textMuted} size={18} />
              <AppText
                style={[styles.declineText, { color: colors.textMuted }]}
              >
                Decline
              </AppText>
            </View>
          </Tap>

          <Tap
            label={`Accept ${getTitle(meeting)}`}
            disabled={busy}
            onPress={() => onRespond("accepted")}
            style={styles.actionFlex}
          >
            <View
              style={[styles.acceptButton, { backgroundColor: accent }]}
            >
              <Check color="#FFFFFF" size={18} />
              <AppText style={styles.acceptText}>
                {busy ? "Saving" : "Accept"}
              </AppText>
            </View>
          </Tap>
        </View>
      ) : null}
    </View>
  );

  if (isInvitation) {
    return body;
  }

  return (
    <Tap
      label={
        meeting.relationship === "host"
          ? `Start ${getTitle(meeting)}`
          : `Join ${getTitle(meeting)}`
      }
      onPress={onOpen}
      style={styles.fullWidth}
    >
      {body}
    </Tap>
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
        <View style={styles.sectionHeaderCopy}>
          <View style={styles.sectionTitleRow}>
            {kind === "live" ? <View style={styles.sectionLiveDot} /> : null}
            <AppText variant="sectionTitle">{title}</AppText>
          </View>

          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        </View>

        <View style={styles.countPill}>
          <AppText variant="label" tone="primary">
            {meetings.length}
          </AppText>
        </View>
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
            size={44}
            accessibilityLabel="Refresh meetings"
            onPress={() => void fetchInbox()}
          />
        }
      />

      <MeetingActionPanel />

      {error ? (
        <Pressable
          onPress={() => void fetchInbox()}
          accessibilityRole="button"
          accessibilityLabel="Retry loading meetings"
        >
          <View
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
          </View>
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
    gap: Spacing.three,
  },
  sectionHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionLiveDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
    shadowColor: "#12D8B0",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 3,
  },
  countPill: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,107,255,0.14)",
  },
  sectionList: {
    width: "100%",
    gap: Spacing.three,
  },
  fullWidth: {
    width: "100%",
  },
  card: {
    width: "100%",
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: Radius.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  livePill: {
    height: 30,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(18,216,176,0.14)",
    borderWidth: 1,
    borderColor: "rgba(18,216,176,0.42)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
  },
  liveText: {
    color: "#12D8B0",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  openCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  invitationActions: {
    width: "100%",
    flexDirection: "row",
    gap: Spacing.two,
  },
  actionFlex: {
    flex: 1,
  },
  declineButton: {
    height: 46,
    borderWidth: 1,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  declineText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  acceptButton: {
    height: 46,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
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