import { StyleSheet, Switch, View } from 'react-native';
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

export default function SecurityScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="SETTINGS"
        title="Security"
        subtitle="Protect your account and meeting access."
      />

      <AppCard>
        <View style={styles.securityHeader}>
          <ShieldCheck color={colors.primary} size={22} />
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Account protection</AppText>
            <AppText variant="caption" tone="muted">
              Keep your Telifier workspace secure.
            </AppText>
          </View>
        </View>

        <View style={styles.fields}>
          <AppTextInput
            label="Current password"
            placeholder="Enter current password"
            secureTextEntry
            leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
          />
          <AppTextInput
            label="New password"
            placeholder="Enter new password"
            secureTextEntry
            leftSlot={<KeyRound color={colors.textSoft} size={18} />}
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Require room approval</AppText>
            <AppText variant="caption" tone="muted">
              Review guests before they enter private rooms.
            </AppText>
          </View>
          <Switch value thumbColor={colors.primary} />
        </View>

        <AppButton title="Update security" containerStyle={styles.action} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
  },
  fields: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  optionRow: {
    marginTop: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  action: {
    marginTop: Spacing.four,
  },
});