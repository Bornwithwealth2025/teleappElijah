import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import {
  Hand,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { MeetingParticipant } from "@/types/meeting.types";

type Props = {
  participants: MeetingParticipant[];
};

function getInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

export function ParticipantPanel({ participants }: Props) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, participants.length]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <AppCard elevated variant="soft" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <AppText variant="bodyStrong">
              Participants
            </AppText>

            <AppText variant="caption" tone="muted">
              People currently in this room
            </AppText>
          </View>

          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <AppText
              variant="bodyStrong"
              tone="primary"
            >
              {participants.length}
            </AppText>
          </View>
        </View>

        <View style={styles.list}>
          {participants.map((participant, index) => {
            const name = participant.name || "Participant";

            return (
              <View
                key={participant.userId || participant.id || index}
                style={[
                  styles.row,
                  {
                    borderBottomColor:
                      index === participants.length - 1
                        ? "transparent"
                        : colors.divider,
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <AppText
                    variant="caption"
                    tone="primary"
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
                        <AppText
                          variant="label"
                          tone="secondary"
                        >
                          HOST
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  <AppText variant="caption" tone="muted">
                    {participant.isHandRaised
                      ? "Hand raised"
                      : participant.isMuted
                        ? "Muted"
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

          {participants.length === 0 ? (
            <View style={styles.empty}>
              <AppText variant="bodyStrong">
                No participants yet
              </AppText>

              <AppText variant="caption" tone="muted">
                Participants will appear here when they join.
              </AppText>
            </View>
          ) : null}
        </View>
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  card: {
    gap: Spacing.four,
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
    gap: 3,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    gap: 0,
  },

  row: {
    minHeight: 66,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderBottomWidth: 1,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontWeight: "800",
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
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  empty: {
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },
});