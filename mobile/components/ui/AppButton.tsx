import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { Radius, Spacing, verticalScale } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";
import { AppText } from "./AppText";

type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type AppButtonSize = "md" | "lg";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
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
  style,
  onPress,
  ...props
}: AppButtonProps) {
  const { colors } = useAppTheme();
  const feedback = useFeedback();
  const isDisabled = disabled || loading;

  const variantStyle = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondarySoft,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: colors.border,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
  }[variant];

  const textColor =
    variant === "primary" || variant === "danger" ? "#FFFFFF" : colors.text;

  function handlePress(event: GestureResponderEvent) {
    if (!isDisabled) {
      feedback.tap();
      onPress?.(event);
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        {...props}
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles[size],
          variantStyle,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          typeof style === "function"
            ? style({ pressed, hovered: false })
            : style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {leftIcon}
            <AppText
              variant="bodyStrong"
              numberOfLines={1}
              style={[styles.title, { color: textColor }]}
            >
              {title}
            </AppText>
            {rightIcon}
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  base: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  md: {
    minHeight: verticalScale(44),
  },
  lg: {
    minHeight: verticalScale(52),
  },
  title: {
    textAlign: "center",
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
