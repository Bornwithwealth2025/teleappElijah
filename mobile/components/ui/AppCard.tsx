import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

type AppCardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  compact?: boolean;
};

export function AppCard({
  padded = true,
  elevated = false,
  compact = false,
  style,
  ...props
}: AppCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        padded && (compact ? styles.compactPadded : styles.padded),
        elevated && !isDark && styles.elevated,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  padded: {
    padding: Spacing.four,
  },
  compactPadded: {
    padding: Spacing.three,
  },
  elevated: {
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 2,
  },
});