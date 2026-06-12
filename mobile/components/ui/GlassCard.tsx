import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

type GlassCardProps = ViewProps & {
  padded?: boolean;
  radius?: number;
  intensity?: number;
};

export function GlassCard({
  padded = true,
  radius = Radius.large,
  intensity,
  style,
  children,
  ...props
}: GlassCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <BlurView
      {...props}
      intensity={intensity ?? (isDark ? 34 : 46)}
      tint={isDark ? 'dark' : 'light'}
      blurMethod="dimezisBlurViewSdk31Plus"
      style={[
        styles.root,
        {
          borderRadius: radius,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.glass,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            backgroundColor: colors.glassHighlight,
          },
        ]}
      />

      <View style={padded && styles.content}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    padding: Spacing.four,
  },
});