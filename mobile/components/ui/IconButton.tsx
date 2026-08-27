// components/ui/IconButton.tsx
import type { ReactNode } from "react";
import {
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

type IconButtonVariant = "solid" | "soft" | "surface" | "ghost" | "danger";

type IconButtonProps = PressableProps & {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: number;
  active?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  variant = "soft",
  size = 44,
  active = false,
  disabled = false,
  containerStyle,
  style,
  onPress,
  accessibilityLabel,
  ...props
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const feedback = useFeedback();

  const variantStyle = {
    solid: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    soft: {
      backgroundColor: active ? colors.primary : colors.primarySoft,
      borderColor: active ? colors.primary : colors.primarySoft,
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
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
  }[variant];

  function handlePress(event: GestureResponderEvent) {
    if (disabled) return;

    feedback.tap();
    onPress?.(event);
  }

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
        },
        variantStyle,
        variant === "surface" && Shadows.soft,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        containerStyle,
        typeof style === "function"
          ? style({
              pressed,
              hovered: false,
            })
          : style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },

  disabled: {
    opacity: 0.46,
  },
});