import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <AppCard style={styles.card}>
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <AppText variant="subtitle" tone="primary">
          +
        </AppText>
      </View>

      <AppText variant="bodyStrong" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="caption" tone="muted" style={styles.message}>
        {message}
      </AppText>

      {actionLabel ? (
        <AppButton
          title={actionLabel}
          onPress={onActionPress}
          containerStyle={styles.action}
        />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.two,
    maxWidth: 280,
  },
  action: {
    marginTop: Spacing.four,
    alignSelf: 'stretch',
  },
});