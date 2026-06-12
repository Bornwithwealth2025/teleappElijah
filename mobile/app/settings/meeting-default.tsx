import { StyleSheet, Switch, View } from 'react-native';
import { Clock, Link as LinkIcon, Video } from 'lucide-react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

export default function MeetingDefaultsScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="SETTINGS"
        title="Meeting defaults"
        subtitle="Configure the default behavior for new Telifier rooms."
      />

      <AppCard>
        <View style={styles.fields}>
          <AppTextInput
            label="Default meeting duration"
            placeholder="45 minutes"
            leftSlot={<Clock color={colors.textSoft} size={18} />}
          />
          <AppTextInput
            label="Default room name"
            placeholder="Elijah's room"
            leftSlot={<LinkIcon color={colors.textSoft} size={18} />}
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Camera on by default</AppText>
            <AppText variant="caption" tone="muted">
              Start meetings with video enabled.
            </AppText>
          </View>
          <Switch value thumbColor={colors.primary} />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Auto-create meeting link</AppText>
            <AppText variant="caption" tone="muted">
              Generate share links for scheduled meetings.
            </AppText>
          </View>
          <Switch value thumbColor={colors.primary} />
        </View>

        <AppButton title="Save defaults" containerStyle={styles.action} />
      </AppCard>

      <AppCard>
        <View style={styles.mediaRow}>
          <Video color={colors.primary} size={20} />
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Media settings</AppText>
            <AppText variant="caption" tone="muted">
              WebRTC and Mediasoup defaults will connect here later.
            </AppText>
          </View>
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
  optionRow: {
    marginTop: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  copy: {
    flex: 1,
  },
  action: {
    marginTop: Spacing.four,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});