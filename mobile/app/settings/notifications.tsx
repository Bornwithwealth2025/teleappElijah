import { StyleSheet, Switch, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

const notificationOptions = [
  {
    title: 'Meeting reminders',
    description: 'Get notified before scheduled meetings start.',
    enabled: true,
  },
  {
    title: 'Room invitations',
    description: 'Receive alerts when someone shares a room with you.',
    enabled: true,
  },
  {
    title: 'Product updates',
    description: 'Occasional updates about Telifier improvements.',
    enabled: false,
  },
];

export default function NotificationPreferencesScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="SETTINGS"
        title="Notification preferences"
        subtitle="Choose how Telifier keeps you updated."
      />

      <View style={styles.list}>
        {notificationOptions.map((option) => (
          <AppCard key={option.title} style={styles.optionCard}>
            <View style={styles.copy}>
              <AppText variant="bodyStrong">{option.title}</AppText>
              <AppText variant="caption" tone="muted">
                {option.description}
              </AppText>
            </View>

            <Switch
              value={option.enabled}
              trackColor={{
                false: colors.border,
                true: colors.primarySoft,
              }}
              thumbColor={option.enabled ? colors.primary : colors.textSoft}
            />
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  optionCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  copy: {
    flex: 1,
  },
});