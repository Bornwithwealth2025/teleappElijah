import { StyleSheet, Text, type TextProps } from "react-native";

import { cn } from "@/lib/cn";
import { FontSize, FontWeight } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

export type AppTextVariant =
  | "display"
  | "title"
  | "sectionTitle"
  | "subtitle"
  | "body"
  | "bodyStrong"
  | "caption"
  | "label"
  | "overline"
  | "button"
  | "metric";

export type AppTextTone =
  | "default"
  | "muted"
  | "soft"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  className?: string;
};

export function AppText({
  variant = "body",
  tone = "default",
  className,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useAppTheme();

  const toneColor = {
    default: colors.text,
    muted: colors.textMuted,
    soft: colors.textSoft,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[tone];

  const variantClassName = {
    display: "tracking-tight",
    title: "tracking-tight",
    sectionTitle: "tracking-tight",
    subtitle: "",
    body: "",
    bodyStrong: "",
    caption: "",
    label: "uppercase",
    overline: "uppercase",
    button: "text-center",
    metric: "tracking-tight",
  }[variant];

  return (
    <Text
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={1.2}
      className={cn("flex-shrink", variantClassName, className)}
      style={[
        styles.base,
        styles[variant],
        { color: toneColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
    includeFontPadding: false,
  },
  display: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.06,
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.9,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.12,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * 1.18,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.25,
  },
  subtitle: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.28,
    fontWeight: FontWeight.semibold,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    fontWeight: FontWeight.regular,
  },
  bodyStrong: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.45,
    fontWeight: FontWeight.semibold,
  },
  caption: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
    fontWeight: FontWeight.regular,
  },
  label: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.3,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  overline: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.3,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  button: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.15,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.1,
  },
  metric: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.05,
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.7,
    fontVariant: ["tabular-nums"],
  },
});