import React, { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Radius, Shadows } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconButtonVariant =
  | "solid"
  | "soft"
  | "surface"
  | "ghost"
  | "danger";

type IconButtonProps = Omit<PressableProps, "style"> & {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: number;
  active?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  variant = "soft",
  size = 48,
  active = false,
  disabled = false,
  containerStyle,
  style,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  ...props
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const feedback = useFeedback();

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isDisabled = Boolean(disabled);

  const variantStyle = {
    solid: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    soft: {
      backgroundColor: active ? colors.primary : colors.primarySoft,
      borderColor: active ? colors.primary : `${colors.primary}1E`,
    },
    surface: {
      backgroundColor: colors.card,
      borderColor: active ? colors.primary : colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    danger: {
      backgroundColor: `${colors.danger}18`,
      borderColor: `${colors.danger}30`,
    },
  }[variant];

  function animate(pressed: boolean) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: pressed ? 0.94 : 1,
        stiffness: 320,
        damping: 22,
        mass: 0.65,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: pressed ? 0.72 : 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handlePress(event: GestureResponderEvent) {
    if (isDisabled) return;

    feedback.tap();
    onPress?.(event);
  }

  return (
    <AnimatedPressable
      {...props}
      disabled={isDisabled}
      android_ripple={{ color: "transparent" }}
      onPress={handlePress}
      onPressIn={(event) => {
        animate(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(false);
        onPressOut?.(event);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          opacity: isDisabled ? 0.46 : opacity,
          transform: [{ scale }],
        },
        variantStyle,
        variant === "surface" && Shadows.soft,
        containerStyle,
        style,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});