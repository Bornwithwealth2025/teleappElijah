import React from "react";
import {
  Hand,
  Mic,
  MicOff,
  ShieldCheck,
  UserMinus,
  Users,
  Video,
  VideoOff,
  VolumeX,
  X,
} from "lucide-react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { MeetingParticipant } from "@/types/meeting.types";

type Props = {
  visible: boolean;
  participants: MeetingParticipant[];
  pendingRequestCount?: number;
  isHost?: boolean;
  busy?: boolean;
  onClose: () => void;
  onMuteAll?: () => void;
  onMuteParticipant?: (userId: string) => void;
  onRemoveParticipant?: (userId: string) => void;
};

function getInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

function getParticipantState(participant: MeetingParticipant) {
  if (participant.isHandRaised) {
    return "Hand raised";
  }

  if (participant.isMuted) {
    return "Microphone muted";
  }

  if (participant.isCameraOff) {
    return "Camera off";
  }

  return "In the meeting";
}

export function MeetingParticipantSheet({
  visible,
  participants,
  pendingRequestCount = 0,
  isHost = false,
  busy = false,
  onClose,
  onMuteAll,
  onMuteParticipant,
  onRemoveParticipant,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const raisedHands = participants.filter(
    (participant) => participant.isHandRaised,
  );

  const mutedParticipantCount = participants.filter(
    (participant) => !participant.isHost && participant.isMuted,
  ).length;

  // Raised hands are first, followed by host, then all other participants.
  const sortedParticipants = [...participants].sort((left, right) => {
    const leftPriority =
      (left.isHandRaised ? 4 : 0) +
      (left.isHost ? 2 : 0) +
      (!left.isMuted ? 1 : 0);

    const rightPriority =
      (right.isHandRaised ? 4 : 0) +
      (right.isHost ? 2 : 0) +
      (!right.isMuted ? 1 : 0);

    return rightPriority - leftPriority;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close participants"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark
                ? "rgba(9, 21, 45, 0.99)"
                : colors.card,
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : colors.glassBorder,
              paddingBottom: Math.max(insets.bottom, Spacing.four),
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: colors.borderStrong },
            ]}
          />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <LinearGradient
                colors={BRAND_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.titleIcon}
              >
                <Users color="#FFFFFF" size={18} />
              </LinearGradient>

              <View style={styles.titleCopy}>
                <AppText variant="sectionTitle">
                  People
                </AppText>

                <AppText variant="caption" tone="muted">
                  {participants.length} participant
                  {participants.length === 1 ? "" : "s"} in this meeting
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close participants"
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: colors.surfaceStrong,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <X color={colors.text} size={19} />
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryPill,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: `${colors.primary}30`,
                },
              ]}
            >
              <Users color={colors.primary} size={14} />
              <AppText variant="label" style={{ color: colors.primary }}>
                {participants.length} live
              </AppText>
            </View>

            {raisedHands.length > 0 ? (
              <View
                style={[
                  styles.summaryPill,
                  {
                    backgroundColor: `${colors.warning}18`,
                    borderColor: `${colors.warning}45`,
                  },
                ]}
              >
                <Hand color={colors.warning} size={14} />
                <AppText variant="label" style={{ color: colors.warning }}>
                  {raisedHands.length} raised
                </AppText>
              </View>
            ) : null}

            {isHost && pendingRequestCount > 0 ? (
              <View
                style={[
                  styles.summaryPill,
                  {
                    backgroundColor: colors.secondarySoft,
                    borderColor: `${colors.secondary}35`,
                  },
                ]}
              >
                <Users color={colors.secondary} size={14} />
                <AppText variant="label" style={{ color: colors.secondary }}>
                  {pendingRequestCount} waiting
                </AppText>
              </View>
            ) : null}
          </View>

          {isHost && pendingRequestCount > 0 ? (
            <View
              style={[
                styles.waitingNotice,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: `${colors.primary}30`,
                },
              ]}
            >
              <View
                style={[
                  styles.noticeIcon,
                  { backgroundColor: colors.card },
                ]}
              >
                <Users color={colors.primary} size={17} />
              </View>

              <View style={styles.waitingCopy}>
                <AppText variant="bodyStrong">
                  Join requests waiting
                </AppText>

                <AppText variant="caption" tone="muted">
                  Admit or decline requests from the meeting banner.
                </AppText>
              </View>
            </View>
          ) : null}

          {isHost && participants.length > 1 ? (
            <Pressable
              disabled={busy}
              onPress={onMuteAll}
              accessibilityRole="button"
              accessibilityLabel="Mute all participants"
              style={({ pressed }) => [
                styles.muteAllButton,
                {
                  backgroundColor: `${colors.danger}12`,
                  borderColor: `${colors.danger}38`,
                  opacity: busy ? 0.55 : pressed ? 0.76 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.muteIcon,
                  { backgroundColor: `${colors.danger}18` },
                ]}
              >
                <VolumeX color={colors.danger} size={17} />
              </View>

              <View style={styles.muteCopy}>
                <AppText
                  variant="bodyStrong"
                  style={{ color: colors.danger }}
                >
                  Mute all participants
                </AppText>

                <AppText variant="caption" tone="muted">
                  {mutedParticipantCount > 0
                    ? `${mutedParticipantCount} already muted`
                    : "Participants can unmute themselves afterwards"}
                </AppText>
              </View>
            </Pressable>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {sortedParticipants.map((participant) => {
              const name = participant.name || "Participant";
              const participantKey = participant.userId || participant.id;
              const isRaised = Boolean(participant.isHandRaised);

              return (
                <View
                  key={participantKey}
                  style={[
                    styles.row,
                    {
                      backgroundColor: isRaised
                        ? `${colors.warning}0D`
                        : colors.surface,
                      borderColor: isRaised
                        ? `${colors.warning}45`
                        : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: participant.isHost
                          ? colors.secondarySoft
                          : colors.primarySoft,
                        borderColor: participant.isHost
                          ? `${colors.secondary}48`
                          : `${colors.primary}38`,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.avatarText,
                        {
                          color: participant.isHost
                            ? colors.secondary
                            : colors.primary,
                        },
                      ]}
                    >
                      {getInitials(name)}
                    </AppText>

                    {!participant.isMuted ? (
                      <View
                        style={[
                          styles.onlineDot,
                          {
                            backgroundColor: colors.success,
                            borderColor: isDark
                              ? colors.background
                              : colors.card,
                          },
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={styles.copy}>
                    <View style={styles.nameRow}>
                      <AppText
                        variant="bodyStrong"
                        numberOfLines={1}
                        style={styles.name}
                      >
                        {name}
                      </AppText>

                      {participant.isHost ? (
                        <View
                          style={[
                            styles.hostBadge,
                            {
                              backgroundColor: colors.secondarySoft,
                              borderColor: `${colors.secondary}32`,
                            },
                          ]}
                        >
                          <ShieldCheck color={colors.secondary} size={12} />
                          <AppText
                            variant="label"
                            style={[
                              styles.hostLabel,
                              { color: colors.secondary },
                            ]}
                          >
                            Host
                          </AppText>
                        </View>
                      ) : null}
                    </View>

                    <AppText
                      variant="caption"
                      tone="muted"
                      numberOfLines={1}
                    >
                      {getParticipantState(participant)}
                    </AppText>
                  </View>

                  <View style={styles.status}>
                    {isRaised ? (
                      <View
                        style={[
                          styles.statusIcon,
                          { backgroundColor: `${colors.warning}20` },
                        ]}
                      >
                        <Hand color={colors.warning} size={15} />
                      </View>
                    ) : null}

                    <View
                      style={[
                        styles.statusIcon,
                        {
                          backgroundColor: participant.isMuted
                            ? `${colors.danger}15`
                            : `${colors.success}18`,
                        },
                      ]}
                    >
                      {participant.isMuted ? (
                        <MicOff color={colors.danger} size={15} />
                      ) : (
                        <Mic color={colors.success} size={15} />
                      )}
                    </View>

                    <View
                      style={[
                        styles.statusIcon,
                        {
                          backgroundColor: participant.isCameraOff
                            ? `${colors.danger}15`
                            : colors.primarySoft,
                        },
                      ]}
                    >
                      {participant.isCameraOff ? (
                        <VideoOff color={colors.danger} size={15} />
                      ) : (
                        <Video color={colors.primary} size={15} />
                      )}
                    </View>
                  </View>

                  {isHost && !participant.isHost ? (
                    <View style={styles.hostActions}>
                      <Pressable
                        disabled={busy}
                        onPress={() =>
                          onMuteParticipant?.(participant.userId)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Mute ${name}`}
                        style={({ pressed }) => [
                          styles.hostAction,
                          {
                            backgroundColor: `${colors.warning}16`,
                            borderColor: `${colors.warning}36`,
                            opacity: busy ? 0.5 : pressed ? 0.72 : 1,
                          },
                        ]}
                      >
                        <MicOff color={colors.warning} size={15} />
                      </Pressable>

                      <Pressable
                        disabled={busy}
                        onPress={() =>
                          onRemoveParticipant?.(participant.userId)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${name}`}
                        style={({ pressed }) => [
                          styles.hostAction,
                          {
                            backgroundColor: `${colors.danger}12`,
                            borderColor: `${colors.danger}38`,
                            opacity: busy ? 0.5 : pressed ? 0.72 : 1,
                          },
                        ]}
                      >
                        <UserMinus color={colors.danger} size={15} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
  },

  sheet: {
    maxHeight: "86%",
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  titleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },

  summaryPill: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  waitingNotice: {
    minHeight: 66,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  waitingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  muteAllButton: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  muteIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  muteCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },

  row: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  avatar: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  name: {
    flexShrink: 1,
  },

  hostBadge: {
    minHeight: 22,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  hostLabel: {
    fontSize: 9,
    lineHeight: 11,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusIcon: {
    width: 29,
    height: 29,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  hostActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  hostAction: {
    width: 29,
    height: 29,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
});