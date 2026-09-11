import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  FontFamily,
  FontSize,
  FontWeight,
  Motion,
  Radius,
  Shadows,
  Spacing,
  verticalScale,
} from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

import { AppText } from "./AppText";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "gradient" // solid brand-gradient fill, e.g. "Create Account"
  | "gradientOutline"; // brand-gradient border, transparent/card fill, e.g. "Sign In"

type AppButtonSize = "sm" | "md" | "lg";

// Shared brand gradient used across the app (welcome screen, primary CTAs).
// Pass `gradientColors` to override per-button if a screen needs a
// different sweep.
export const BRAND_GRADIENT = ["#7C3AED", "#3B82F6", "#14B8A6"] as const;

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  /** Overrides the palette's default text/icon-label color. */
  textColor?: string;
  /** Only used by "gradient" and "gradientOutline" variants. */
  gradientColors?: readonly [string, string, ...string[]];
  /**
   * "center" (default) clusters icon/title/icon together — the common case
   * for most buttons in the app. "spaceBetween" pins a leftIcon and
   * rightIcon to opposite edges with the title in between, matching the
   * hero CTA buttons on the welcome screen.
   */
  contentAlign?: "center" | "spaceBetween";
};

export function AppButton({
  title,
  variant = "primary",
  size = "lg",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  containerStyle,
  fullWidth = true,
  style,
  textColor,
  gradientColors = BRAND_GRADIENT,
  contentAlign = "center",
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  ...props
}: AppButtonProps) {
  const { colors } = useAppTheme();
  const feedback = useFeedback();
  const scale = useRef(new Animated.Value(1)).current;

  const isDisabled = Boolean(disabled || loading);
  const isGradient = variant === "gradient";
  const isGradientOutline = variant === "gradientOutline";
  const isStrong = variant === "primary" || variant === "danger" || isGradient;

  const palette = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: "#FFFFFF",
    },
    secondary: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primarySoft,
      textColor: colors.primaryDeep,
    },
    outline: {
      backgroundColor: colors.card,
      borderColor: colors.borderStrong,
      textColor: colors.text,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      textColor: "#FFFFFF",
    },
    gradient: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: "#FFFFFF",
    },
    gradientOutline: {
      backgroundColor: colors.background,
      borderColor: "transparent",
      textColor: colors.text,
    },
  }[variant];

  const resolvedTextColor = textColor ?? palette.textColor;

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      damping: Motion.spring.damping,
      stiffness: Motion.spring.stiffness,
      mass: Motion.spring.mass,
      useNativeDriver: true,
    }).start();
  }

  function handlePress(event: GestureResponderEvent) {
    if (isDisabled) {
      return;
    }

    feedback.tap();
    onPress?.(event);
  }

  const pressableNode = (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={handlePress}
      onPressIn={(event) => {
        animateTo(0.975);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={[
        styles.pressable,
        styles[size],
        isGradientOutline && styles.pressableInsetRadius,
        {
          borderColor: palette.borderColor,
          backgroundColor: palette.backgroundColor,
        },
        isGradient && Shadows.soft,
        isGradient && {
          shadowColor: gradientColors[1] ?? gradientColors[0],
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        isStrong && !isGradient && Shadows.soft,
        isDisabled && styles.disabled,
        typeof style === "function"
          ? style({
              pressed: false,
              hovered: false,
            })
          : style,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <Animated.View
        style={[
          styles.content,
          contentAlign === "spaceBetween" && styles.contentSpaceBetween,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={resolvedTextColor} />
        ) : (
          <>
            {leftIcon}

            <AppText
              variant="button"
              numberOfLines={1}
              style={[
                styles.title,
                {
                  color: resolvedTextColor,
                },
              ]}
            >
              {title}
            </AppText>

            {rightIcon}
          </>
        )}
      </Animated.View>
    </Pressable>
  );

  return (
    <View style={[fullWidth && styles.container, containerStyle]}>
      {isGradientOutline ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          {pressableNode}
        </LinearGradient>
      ) : (
        pressableNode
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  pressable: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  pressableInsetRadius: {
    borderRadius: Radius.medium - 1,
    borderWidth: 0,
  },
  gradientBorder: {
    borderRadius: Radius.medium,
    padding: 1.4,
  },
  sm: {
    minHeight: verticalScale(40),
  },
  md: {
    minHeight: verticalScale(48),
  },
  lg: {
    minHeight: verticalScale(56),
  },
  content: {
    flex: 1,
    minHeight: "100%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  contentSpaceBetween: {
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
  },
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.48,
  },
});