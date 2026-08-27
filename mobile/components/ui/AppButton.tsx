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
  | "danger";

type AppButtonSize = "sm" | "md" | "lg";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
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
  const isStrong = variant === "primary" || variant === "danger";

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
  }[variant];

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

  return (
    <View
      style={[
        fullWidth && styles.container,
        containerStyle,
      ]}
    >
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
          {
            borderColor: palette.borderColor,
            backgroundColor: palette.backgroundColor,
          },
          isStrong && Shadows.soft,
          isDisabled && styles.disabled,
          typeof style === "function"
            ? style({
                pressed: false,
                hovered: false,
                    // focused: false, // Removed focused property
              })
            : style,
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale }],
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={palette.textColor} />
          ) : (
            <>
              {leftIcon}

              <AppText
                variant="button"
                numberOfLines={1}
                style={[
                  styles.title,
                  {
                    color: palette.textColor,
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