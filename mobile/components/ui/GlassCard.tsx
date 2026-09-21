import { BlurView } from "expo-blur";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import {
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type GlassCardVariant = "subtle" | "strong";

type GlassCardProps = ViewProps & {
  padded?: boolean;
  radius?: number;
  intensity?: number;
  elevated?: boolean;
  variant?: GlassCardVariant;
  contentStyle?: StyleProp<ViewStyle>;
};

export function GlassCard({
  padded = true,
  radius = Radius.large,
  intensity,
  elevated = false,
  variant = "subtle",
  contentStyle,
  style,
  children,
  ...props
}: GlassCardProps) {
  const { colors, isDark } = useAppTheme();

  const resolvedIntensity =
    intensity ??
    (variant === "strong"
      ? isDark
        ? 48
        : 60
      : isDark
        ? 28
        : 38);

  const surfaceColor =
    variant === "strong"
      ? colors.glassStrong
      : colors.glass;

  return (
    <BlurView
      {...props}
      intensity={resolvedIntensity}
      tint={isDark ? "dark" : "light"}
      style={[
        styles.root,
        {
          borderRadius: radius,
          borderColor: colors.glassBorder,
        },
        elevated && !isDark && Shadows.card,
        elevated && isDark && styles.darkElevation,
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: surfaceColor },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.topHighlight,
          {
            left: radius,
            right: radius,
            backgroundColor: colors.glassHighlight,
          },
        ]}
      />

      <View
        style={[
          styles.content,
          padded && styles.paddedContent,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
  },

  content: {
    width: "100%",
  },

  paddedContent: {
    padding: Spacing.four,
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    height: 1,
    opacity: 0.9,
  },

  darkElevation: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 8,
  },
});