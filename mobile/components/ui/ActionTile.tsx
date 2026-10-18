import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

import { AppText } from "./AppText";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ActionTileTone = "primary" | "secondary" | "accent" | "danger";

type ActionTileProps = Omit<
  PressableProps,
  "children" | "style"
> & {
  icon: React.ReactNode;
  title: string;
  description?: string;
  tone?: ActionTileTone;
  compact?: boolean;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ActionTile({
  icon,
  title,
  description,
  tone = "primary",
  compact = false,
  showChevron = true,
  disabled = false,
  style,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  ...props
}: ActionTileProps) {
  const { colors } = useAppTheme();
  const feedback = useFeedback();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isDisabled = Boolean(disabled);

  const accentColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    danger: colors.danger,
  }[tone];

  function animate(pressed: boolean) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: pressed ? 0.985 : 1,
        stiffness: 300,
        damping: 22,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: pressed ? 0.78 : 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <AnimatedPressable
      {...props}
      disabled={isDisabled}
      android_ripple={{ color: "transparent" }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled }}
      onPress={(event) => {
        if (isDisabled) return;
        feedback.tap();
        onPress?.(event);
      }}
      onPressIn={(event) => {
        animate(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(false);
        onPressOut?.(event);
      }}
      style={[
        styles.root,
        compact && styles.compactRoot,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: isDisabled ? 0.46 : opacity,
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconShell,
          compact && styles.compactIconShell,
          {
            backgroundColor: `${accentColor}1C`,
            borderColor: `${accentColor}2A`,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.copy}>
        <AppText
          numberOfLines={1}
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </AppText>

        {description ? (
          <AppText
            numberOfLines={1}
            style={[styles.description, { color: colors.textMuted }]}
          >
            {description}
          </AppText>
        ) : null}
      </View>

      {showChevron ? (
        <View
          style={[
            styles.chevronShell,
            { backgroundColor: `${accentColor}14` },
          ]}
        >
          <ChevronRight
            color={accentColor}
            size={20}
            strokeWidth={2.4}
          />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    minHeight: 82,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  compactRoot: {
    minHeight: 64,
    borderRadius: Radius.medium,
  },

  iconShell: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  compactIconShell: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },

  description: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  chevronShell: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});