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
  const opacity = useRef(new Animated.Value(1)).current;

  const safeGuests = Math.max(0, Number(guests) || 0);

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

  const card = (
    <AppCard elevated style={styles.card}>
      <View
        style={[
          styles.dateBlock,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <CalendarDays color={colors.primary} size={18} />

        <AppText variant="label" tone="primary" numberOfLines={1}>
          {date}
        </AppText>

        <AppText
          variant="caption"
          tone="primary"
          style={styles.dateTime}
          numberOfLines={1}
        >
          {time}
        </AppText>
      </View>

      <View style={styles.copy}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {title}
        </AppText>

        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {safeGuests} {safeGuests === 1 ? "guest" : "guests"} invited
        </AppText>
      </View>

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
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable
      onPress={onPress}
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
        {card}
      </Animated.View>
    </Pressable>
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
    gap: Spacing.three,
  },

  dateBlock: {
    width: 78,
    minHeight: 68,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: Spacing.two,
  },

  dateTime: {
    fontWeight: "700",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
});