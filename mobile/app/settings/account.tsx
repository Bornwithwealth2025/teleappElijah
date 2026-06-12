import { StyleSheet, View } from 'react-native';
import { Mail, Phone, UserRound } from 'lucide-react-native';

import { ProfileAvatar } from '@/components/shared/ProfileAvatar';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

export default function AccountSettingsScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="SETTINGS"
        title="Account settings"
        subtitle="Update your profile details and contact information."
      />

      <AppCard style={styles.avatarCard}>
        <ProfileAvatar name="Elijah" editable size={88} />

        <View style={styles.avatarCopy}>
          <AppText variant="bodyStrong">Profile photo</AppText>
          <AppText variant="caption" tone="muted" style={styles.avatarHelp}>
            Upload a clear photo for your Telifier account.
          </AppText>
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.fields}>
          <AppTextInput
            label="Full name"
            placeholder="Elijah"
            leftSlot={<UserRound color={colors.textSoft} size={18} />}
          />

          <AppTextInput
            label="Email address"
            placeholder="elijah@telifier.app"
            autoCapitalize="none"
            keyboardType="email-address"
            leftSlot={<Mail color={colors.textSoft} size={18} />}
          />

          <AppTextInput
            label="Phone number"
            placeholder="+234 000 000 0000"
            keyboardType="phone-pad"
            leftSlot={<Phone color={colors.textSoft} size={18} />}
          />
        </View>

        <AppButton title="Save changes" containerStyle={styles.action} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatarCopy: {
    flex: 1,
  },
  avatarHelp: {
    marginTop: Spacing.one,
  },
  fields: {
    gap: Spacing.three,
  },
  action: {
    marginTop: Spacing.four,
  },
});