import React, { useRef } from "react";
import { router } from "expo-router";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Radio,
  RotateCcw,
} from "lucide-react-native";

import { ParticipantStack } from "./ParticipantStack";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, SCREEN, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type MeetingStatus = "live" | "scheduled" | "ended";

type MeetingCardProps = {
  id: string;
  title: string;
  time: string;
  participants: number;
  status: MeetingStatus;
};

export function MeetingCard({
  id,
  title,
  time,
  participants,
  status,
}: MeetingCardProps) {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const safeParticipants = Math.max(0, Number(participants) || 0);

  const statusConfig = {
    live: {
      label: "Live now",
      backgroundColor: colors.danger,
      color: "#FFFFFF",
      icon: <Radio color="#FFFFFF" size={13} />,
    },
    scheduled: {
      label: "Scheduled",
      backgroundColor: colors.primarySoft,
      color: colors.primaryDeep,
      icon: <CalendarDays color={colors.primary} size={13} />,
    },
    ended: {
      label: "Ended",
      backgroundColor: colors.surface,
      color: colors.textMuted,
      icon: <RotateCcw color={colors.textMuted} size={13} />,
    },
  }[status];

  function animatePressIn() {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.985,
        useNativeDriver: true,
        speed: 24,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.86,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function animatePressOut() {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 7,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handlePress() {
    router.push(`/meeting/${id}` as any);
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={animatePressIn}
      onPressOut={animatePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
    >
      <Animated.View
        style={[
          styles.animated,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <AppCard
          elevated={status !== "ended"}
          compact={SCREEN.isShortHeight}
          variant={status === "live" ? "tinted" : "default"}
          style={styles.card}
        >
          <View style={styles.topRow}>
            <View style={styles.titleWrap}>
              <AppText variant="subtitle" numberOfLines={1}>
                {title}
              </AppText>

              <View style={styles.timeRow}>
                <Clock3 color={colors.textMuted} size={14} />
                <AppText variant="caption" tone="muted" numberOfLines={1}>
                  {time}
                </AppText>
              </View>
            </View>

            <View style={styles.rightSide}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.backgroundColor },
                ]}
              >
                {statusConfig.icon}

                <AppText
                  variant="caption"
                  numberOfLines={1}
                  style={[
                    styles.statusText,
                    { color: statusConfig.color },
                  ]}
                >
                  {statusConfig.label}
                </AppText>
              </View>

              <ChevronRight color={colors.textSoft} size={20} />
            </View>
          </View>

          <View style={styles.footer}>
            <ParticipantStack
              count={safeParticipants}
              showLabel={false}
            />

            <AppText variant="caption" tone="muted">
              {safeParticipants}{" "}
              {safeParticipants === 1 ? "participant" : "participants"}
            </AppText>
          </View>
        </AppCard>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  animated: {
    width: "100%",
  },

  card: {
    gap: SCREEN.isShortHeight ? Spacing.three : Spacing.four,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },

  titleWrap: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rightSide: {
    alignItems: "flex-end",
    gap: Spacing.two,
  },

  statusBadge: {
    minHeight: 26,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  statusText: {
    fontWeight: "800",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
});