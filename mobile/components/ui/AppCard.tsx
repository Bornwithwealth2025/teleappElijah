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
  /**
   * Use only for an intentional entrance animation.
   * List, dashboard, and form cards should remain still by default.
   */
  animated?: boolean;
  variant?: AppCardVariant;
  className?: string;
};

export function AppCard({
  padded = true,
  elevated = false,
  compact = false,
  animated = false,
  variant = "default",
  className,
  style,
  children,
  ...props
}: AppCardProps) {
  const { colors, isDark } = useAppTheme();

  const opacity = useRef(
    new Animated.Value(animated ? 0 : 1),
  ).current;

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
      borderColor: `${colors.primary}26`,
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
        styles.card,
        surfaceStyle,
        elevated && !isDark && Shadows.card,
        elevated && isDark && styles.darkElevation,
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
  card: {
    width: "100%",
  },

  darkElevation: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  },
});