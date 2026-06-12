import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { AppText } from './AppText';

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
};

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  leftSlot,
  rightSlot,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.root, style]}>
      {(leftSlot || rightSlot) ? (
        <View style={styles.brandRow}>
          {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : <View />}
          {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
        </View>
      ) : null}

      <View style={styles.copyWrap}>
        {eyebrow ? (
          <AppText variant="label" tone="primary" style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        ) : null}

        <AppText variant="display" style={styles.title}>
          {title}
        </AppText>

        {subtitle ? (
          <AppText variant="body" tone="muted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: Spacing.six,
  },
  brandRow: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSlot: {
    flexShrink: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginLeft: Spacing.three,
  },
  copyWrap: {
    width: '100%',
    maxWidth: 370,
    paddingTop: Spacing.two,
  },
  eyebrow: {
    marginBottom: Spacing.two,
  },
  title: {
    maxWidth: 350,
  },
  subtitle: {
    marginTop: Spacing.three,
    maxWidth: 330,
  },
});