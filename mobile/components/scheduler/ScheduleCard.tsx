import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  CalendarDays,
  Copy,
  Trash2,
  UsersRound,
} from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type ScheduleCardProps = {
  title: string;
  date: string;
  time: string;
  guests: number;
  onPress?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
};

export function ScheduleCard({
  title,
  date,
  time,
  guests,
  onPress,
  onCopy,
  onDelete,
}: ScheduleCardProps) {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const safeGuests = Math.max(0, Number(guests) || 0);

  function animatePressIn() {
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 24,
      bounciness: 4,
    }).start();
  }

  function animatePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 7,
    }).start();
  }

  const meetingInfo = (
    <>
      <View
        style={[
          styles.dateBlock,
          {
            backgroundColor: colors.primarySoft,
            borderColor: `${colors.primary}25`,
          },
        ]}
      >
        <CalendarDays color={colors.primary} size={18} />

        <AppText
          variant="label"
          numberOfLines={1}
          style={{ color: colors.primary }}
        >
          {date}
        </AppText>

        <AppText
          variant="caption"
          numberOfLines={1}
          style={[styles.dateTime, { color: colors.primary }]}
        >
          {time}
        </AppText>
      </View>

      <View style={styles.copy}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {title}
        </AppText>

        <View style={styles.metaRow}>
          <UsersRound color={colors.textSoft} size={14} />

          <AppText variant="caption" tone="muted">
            {safeGuests} {safeGuests === 1 ? "guest" : "guests"} invited
          </AppText>
        </View>
      </View>
    </>
  );

  return (
    <Animated.View
      style={[
        styles.animated,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <AppCard elevated style={styles.card}>
        {onPress ? (
          <Pressable
            onPress={onPress}
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            accessibilityRole="button"
            accessibilityLabel={`Open ${title}`}
            style={styles.mainAction}
          >
            {meetingInfo}
          </Pressable>
        ) : (
          <View style={styles.mainAction}>{meetingInfo}</View>
        )}

        <View style={styles.actions}>
          {onCopy ? (
            <IconButton
              icon={<Copy color={colors.primary} size={16} />}
              variant="soft"
              size={36}
              accessibilityLabel="Copy meeting link"
              onPress={onCopy}
            />
          ) : null}

          {onDelete ? (
            <IconButton
              icon={<Trash2 color={colors.danger} size={16} />}
              variant="surface"
              size={36}
              accessibilityLabel="Delete scheduled meeting"
              onPress={onDelete}
            />
          ) : null}
        </View>
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animated: {
    width: "100%",
  },

  card: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  mainAction: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  dateBlock: {
    width: 76,
    minHeight: 68,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: Spacing.one,
  },

  dateTime: {
    fontWeight: "700",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
});