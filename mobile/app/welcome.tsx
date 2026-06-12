import { router } from 'expo-router';
import { ImageBackground, StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ImageBackground
        source={require('@/assets/images/telefya.png')}
        style={styles.hero}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(22,10,46,0.02)',
            'rgba(22,10,46,0.35)',
            'rgba(22,10,46,0.92)',
          ]}
          locations={[0.28, 0.62, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
          },
        ]}
      >
        <View style={[styles.pill, { backgroundColor: colors.border }]} />

        <View style={styles.copy}>
          <AppText variant="display" style={[styles.heading, { color: colors.text }]}>
            Welcome
          </AppText>

          <AppText variant="body" style={[styles.tagline, { color: colors.textMuted }]}>
            Plan meetings, start instant rooms, and share secure links from one workspace.
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Register"
            onPress={() => router.push('/auth/register')}
            style={styles.primaryButton}
          />

          <AppButton
            title="Login"
            variant="secondary"
            onPress={() => router.push('/auth/login')}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0C1A',
  },
  hero: {
    height: height * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: -34,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  pill: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    marginBottom: Spacing.two,
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagline: {
    maxWidth: 330,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.three,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 999,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 999,
  },
});