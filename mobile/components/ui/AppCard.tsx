import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import {
  Motion,
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type AppCardVariant =
  | "default"
  | "soft"
  | "tinted"
  | "transparent";

type AppCardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  compact?: boolean;
  animated?: boolean;
  variant?: AppCardVariant;
};

export function AppCard({
  padded = true,
  elevated = false,
  compact = false,
  animated = true,
  variant = "default",
  style,
  children,
  ...props
}: AppCardProps) {
  const { colors, isDark } = useAppTheme();

  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(
    new Animated.Value(animated ? 8 : 0),
  ).current;

  useEffect(() => {
    if (!animated) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Motion.emphasis,
        easing: Motion.easing,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: Motion.spring.damping,
        stiffness: Motion.spring.stiffness,
        mass: Motion.spring.mass,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, opacity, translateY]);

  const surfaceStyle = {
    default: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    soft: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    tinted: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
    },
    transparent: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
  }[variant];

  return (
    <Animated.View
      {...props}
      style={[
        styles.base,
        surfaceStyle,
        padded &&
          (compact
            ? styles.compactPadded
            : styles.padded),
        elevated && !isDark && Shadows.card,
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  padded: {
    padding: Spacing.five,
  },
  compactPadded: {
    padding: Spacing.three,
  },
});