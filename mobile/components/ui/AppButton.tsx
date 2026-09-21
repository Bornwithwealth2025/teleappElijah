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
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

import { AppText } from "./AppText";

// Kept as a shared export because welcome, meeting, and auth CTAs use it.
// Hardcoded to the exact 3-stop gradient used on the welcome screen
// (purple -> blue -> teal) so every button, checkbox, and step indicator
// that references BRAND_GRADIENT matches it, instead of drifting from
// whatever TelefyaGradients.primary happens to be.
export const BRAND_GRADIENT = ["#7B1CFF", "#0F6BFF", "#12D8B0"] as const;

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "gradient"
  | "gradientOutline";

type AppButtonSize = "sm" | "md" | "lg";

// FIX: pinned pixel heights instead of verticalScale(). If verticalScale()
// was returning 0/NaN/undefined, the pressable's minHeight collapsed to
// nothing, which in turn collapsed the "minHeight: '100%'" content view
// inside it -> buttons visually disappeared (only the absolute-fill
// gradient painted as a thin line).
const SIZE_HEIGHTS: Record<AppButtonSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  textColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
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
  const { colors, isDark } = useAppTheme();
  const feedback = useFeedback();

  const scale = useRef(new Animated.Value(1)).current;

  const isDisabled = Boolean(disabled || loading);
  const isGradient = variant === "gradient";
  const isGradientOutline = variant === "gradientOutline";
  const isStrong =
    variant === "primary" ||
    variant === "danger" ||
    variant === "gradient";

  const resolvedHeight = SIZE_HEIGHTS[size] ?? SIZE_HEIGHTS.lg;

  // FIX: gradientOutline fakes a colored border by wrapping the button in a
  // full LinearGradient, then relying on the inner Pressable's background to
  // cover the middle so it reads as "outlined, not filled". If colors.card
  // is transparent/undefined, that cover never paints and the gradient
  // shows through the entire button, making it look identical to the solid
  // "gradient" variant. Force a real opaque fallback so it can't happen.
  const opaqueCardColor = colors?.card ?? (isDark ? "#0B1220" : "#FFFFFF");

  const palette = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: "#FFFFFF",
    },
    secondary: {
      backgroundColor: colors.secondarySoft,
      borderColor: `${colors.secondary}30`,
      textColor: colors.secondary,
    },
    outline: {
      backgroundColor: opaqueCardColor,
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
      backgroundColor: opaqueCardColor,
      borderColor: "transparent",
      textColor: colors.text,
    },
  }[variant];

  const resolvedTextColor = textColor ?? palette.textColor;

  // FIX (Android): elevation/shadow and overflow:"hidden" on the SAME view
  // is what was making these buttons render "weird" (collapsed/garbled
  // content) — identical root cause to the welcome-screen bug. The shadow
  // now lives only on this outer, non-clipping wrapper; the Pressable below
  // (which has overflow:"hidden" for the gradient/border radius) never
  // carries elevation itself.
  const shadowStyle = isStrong
    ? isDark
      ? styles.darkStrongElevation
      : Shadows?.soft
    : null;

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      damping: Motion?.spring?.damping ?? 15,
      stiffness: Motion?.spring?.stiffness ?? 150,
      mass: Motion?.spring?.mass ?? 1,
      useNativeDriver: true,
    }).start();
  }

  function handlePress(event: GestureResponderEvent) {
    if (isDisabled) {
      return;
    }

    feedback?.tap?.();
    onPress?.(event);
  }

  const button = (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      onPress={handlePress}
      onPressIn={(event) => {
        animateTo(0.975);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={(state) => [
        styles.pressable,
        { minHeight: resolvedHeight, height: resolvedHeight },
        isGradientOutline && styles.pressableInsetRadius,
        {
          borderColor: palette.borderColor,
          backgroundColor: palette.backgroundColor,
        },
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, styles.gradientFill]}
        />
      ) : null}

      <Animated.View
        style={[
          styles.content,
          { height: resolvedHeight },
          contentAlign === "spaceBetween" && styles.contentSpaceBetween,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={resolvedTextColor} size="small" />
        ) : (
          leftIcon
        )}

        <AppText
          variant="button"
          numberOfLines={1}
          style={[styles.title, { color: resolvedTextColor }]}
        >
          {title}
        </AppText>

        {!loading ? rightIcon : null}
      </Animated.View>
    </Pressable>
  );

  return (
    <View
      style={[fullWidth && styles.container, shadowStyle, containerStyle]}
    >
      {isGradientOutline ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          {button}
        </LinearGradient>
      ) : (
        button
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
    borderRadius: 20,
    justifyContent: "center",
    zIndex: 1,
  },

  gradientFill: {
    borderRadius: 20,
  },

  pressableInsetRadius: {
    borderWidth: 0,
    borderRadius: 19,
  },

  gradientBorder: {
    overflow: "hidden",
    borderRadius: 20,
    padding: 1.4,
  },

  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing?.two ?? 8,
    paddingHorizontal: Spacing?.five ?? 20,
  },

  contentSpaceBetween: {
    justifyContent: "space-between",
    paddingHorizontal: Spacing?.four ?? 16,
  },

  title: {
    flexShrink: 1,
    fontFamily: FontFamily?.bold,
    fontSize: FontSize?.md ?? 16,
    fontWeight: FontWeight?.bold ?? "700",
    letterSpacing: 0.1,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.9,
  },

  disabled: {
    opacity: 0.48,
  },

  darkStrongElevation: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 7,
  },
});