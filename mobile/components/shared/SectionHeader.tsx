import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { AppText } from '@/components/ui/AppText';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
};

export function SectionHeader({
  title,
  actionLabel,
  rightSlot,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.root, style]}>
      <AppText variant="subtitle">{title}</AppText>

      {rightSlot ? (
        rightSlot
      ) : actionLabel ? (
        <AppText variant="bodyStrong" tone="primary">
          {actionLabel}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
});