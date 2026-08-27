import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  type ViewProps,
} from "react-native";

import { cn } from "@/lib/cn";
import {
  Motion,
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
  className?: string;
};

export function AppCard({
  padded = true,
  elevated = false,
  compact = false,
  animated = true,
  variant = "default",
  className,
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
    if (!animated) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(8);

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
      className={cn(
        "overflow-hidden border rounded-card",
        padded && (compact ? "p-3" : "p-5"),
        className,
      )}
      style={[
        surfaceStyle,
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