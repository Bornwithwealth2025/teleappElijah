import { StyleSheet } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';

type StatCardProps = {
  value: string | number;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="subtitle">{value}</AppText>
      <AppText variant="caption" tone="muted" style={styles.label}>
        {label}
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
  },
  label: {
    marginTop: Spacing.one,
  },
});