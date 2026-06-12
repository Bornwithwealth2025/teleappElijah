import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSize, FontWeight } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

type AppTextVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label';

type AppTextTone = 'default' | 'muted' | 'soft' | 'primary' | 'secondary' | 'danger';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
};

export function AppText({
  variant = 'body',
  tone = 'default',
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
    danger: colors.danger,
  }[tone];

  return (
    <Text
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={1.15}
      style={[styles.base, styles[variant], { color: toneColor }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
    flexShrink: 1,
  },
  display: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display + 7,
    fontWeight: FontWeight.bold,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl + 6,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl + 6,
    fontWeight: FontWeight.bold,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md + 8,
    fontWeight: FontWeight.regular,
  },
  bodyStrong: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md + 8,
    fontWeight: FontWeight.semibold,
  },
  caption: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm + 6,
    fontWeight: FontWeight.regular,
  },
  label: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs + 4,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
  },
});