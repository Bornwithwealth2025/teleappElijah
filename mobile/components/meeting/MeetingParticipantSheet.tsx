import React from "react";
import {
  Hand,
  Mic,
  MicOff,
  ShieldCheck,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
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

export function MeetingParticipantSheet({
  visible,
  participants,
  pendingRequestCount = 0,
  isHost = false,
  busy = false,
  onClose,
  onMuteAll,
}: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const raisedHands = participants.filter(
    (participant) => participant.isHandRaised,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close participants"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingBottom: Math.max(
                insets.bottom,
                Spacing.four,
              ),
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <AppText variant="sectionTitle">
                Participants
              </AppText>

              <AppText variant="caption" tone="muted">
                {participants.length} in this meeting
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close participants"
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <X color={colors.text} size={19} />
            </Pressable>
          </View>

          {isHost && pendingRequestCount > 0 ? (
            <View
              style={[
                styles.waitingNotice,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <Users color={colors.primary} size={18} />

              <View style={styles.waitingCopy}>
                <AppText variant="bodyStrong" tone="primary">
                  {pendingRequestCount} waiting to join
                </AppText>

                <AppText variant="caption" tone="muted">
                  Use the join request banner in the meeting to admit them.
                </AppText>
              </View>
            </View>
          ) : null}

          {raisedHands.length > 0 ? (
            <View
              style={[
                styles.handNotice,
                {
                  backgroundColor: `${colors.warning}16`,
                  borderColor: `${colors.warning}38`,
                },
              ]}
            >
              <Hand color={colors.warning} size={18} />

              <AppText
                variant="caption"
                style={{
                  color: colors.warning,
                  fontWeight: "800",
                }}
              >
                {raisedHands.length} hand
                {raisedHands.length === 1 ? "" : "s"} raised
              </AppText>
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
                  backgroundColor: `${colors.danger}14`,
                  borderColor: `${colors.danger}42`,
                  opacity: busy ? 0.55 : pressed ? 0.76 : 1,
                },
              ]}
            >
              <VolumeX color={colors.danger} size={18} />

              <AppText
                variant="bodyStrong"
                style={{ color: colors.danger }}
              >
                Mute all participants
              </AppText>
            </Pressable>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {participants.map((participant) => {
              const name = participant.name || "Participant";

              return (
                <View
                  key={participant.userId || participant.id}
                  style={[
                    styles.row,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
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
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      tone={
                        participant.isHost
                          ? "secondary"
                          : "primary"
                      }
                      style={styles.avatarText}
                    >
                      {getInitials(name)}
                    </AppText>
                  </View>

                  <View style={styles.copy}>
                    <View style={styles.nameRow}>
                      <AppText
                        variant="bodyStrong"
                        numberOfLines={1}
                      >
                        {name}
                      </AppText>

                      {participant.isHost ? (
                        <View
                          style={[
                            styles.hostBadge,
                            {
                              backgroundColor:
                                colors.secondarySoft,
                            },
                          ]}
                        >
                          <ShieldCheck
                            color={colors.secondary}
                            size={12}
                          />

                          <AppText
                            variant="label"
                            tone="secondary"
                            style={styles.hostLabel}
                          >
                            Host
                          </AppText>
                        </View>
                      ) : null}
                    </View>

                    <AppText variant="caption" tone="muted">
                      {participant.isHandRaised
                        ? "Hand raised"
                        : participant.isMuted
                          ? "Microphone muted"
                          : "In the meeting"}
                    </AppText>
                  </View>

                  <View style={styles.status}>
                    {participant.isHandRaised ? (
                      <Hand
                        color={colors.warning}
                        size={17}
                      />
                    ) : null}

                    {participant.isMuted ? (
                      <MicOff
                        color={colors.danger}
                        size={17}
                      />
                    ) : (
                      <Mic
                        color={colors.success}
                        size={17}
                      />
                    )}

                    {participant.isCameraOff ? (
                      <VideoOff
                        color={colors.danger}
                        size={17}
                      />
                    ) : (
                      <Video
                        color={colors.success}
                        size={17}
                      />
                    )}
                  </View>
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
    backgroundColor: "rgba(3, 9, 20, 0.6)",
  },

  sheet: {
    maxHeight: "82%",
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.42)",
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
    gap: 2,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  waitingNotice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
  },

  waitingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  handNotice: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },

  muteAllButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },

  row: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontWeight: "900",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  hostBadge: {
    minHeight: 21,
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
    gap: Spacing.one,
  },
});