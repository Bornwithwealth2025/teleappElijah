import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { Radius } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

type IconButtonVariant = "solid" | "soft" | "ghost";

type IconButtonProps = PressableProps & {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: number;
  containerStyle?: ViewStyle;
};

export function IconButton({
  icon,
  variant = "soft",
  size = 44,
  disabled,
  containerStyle,
  style,
  onPress,
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
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: colors.border,
    },
  }[variant];

  function handlePress(event: GestureResponderEvent) {
    feedback.tap();
    onPress?.(event);
  }

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
        },
        variantStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        containerStyle,
        typeof style === "function"
          ? style({ pressed, hovered: false })
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
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
