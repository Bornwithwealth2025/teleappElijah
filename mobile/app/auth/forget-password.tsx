import { router, type Href } from 'expo-router';
import { Mail, CheckCircle2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';
import useAuthStore from '@/store/authStore';


function EmailSentView({ email, onResend, isLoading, colors }: {
  email: string;
  onResend: () => void;
  isLoading: boolean;
  colors: any;
}) {
  return (
    <View style={sentStyles.container}>
      {/* Icon */}
      <View style={[sentStyles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <CheckCircle2 color={colors.primary} size={40} strokeWidth={1.5} />
      </View>

      {/* Copy */}
      <View style={sentStyles.copy}>
        <AppText variant="display" style={sentStyles.title}>
          Check your inbox
        </AppText>
        <AppText variant="body" tone="muted" style={sentStyles.body}>
          We sent a password reset link to
        </AppText>
        <AppText variant="bodyStrong" style={[sentStyles.email, { color: colors.text }]}>
          {email}
        </AppText>
      </View>

      {/* Info card */}
      <View style={[sentStyles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="caption" tone="muted" style={sentStyles.infoText}>
          The link will expire in <AppText variant="caption" style={{ color: colors.text, fontWeight: '700' }}>30 minutes</AppText>. Check your spam folder if you don't see it.
        </AppText>
      </View>

      {/* Actions */}
      <AppButton
        title="Back to sign in"
        onPress={() => router.replace('/auth/login' as Href)}
        style={sentStyles.primaryBtn}
      />

      <View style={sentStyles.resendRow}>
        <AppText variant="caption" tone="muted">Didn't receive it? </AppText>
        <TouchableOpacity onPress={onResend} disabled={isLoading} activeOpacity={0.75}>
          <AppText variant="caption" style={[sentStyles.resendLink, { color: colors.primary }]}>
            {isLoading ? 'Sending...' : 'Resend email'}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const { requestPasswordReset, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async () => {
    if (!isValidEmail) return;
    try {
      await requestPasswordReset({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      // error shown via store
    }
  };

  const handleResend = async () => {
    try {
      await requestPasswordReset({ email: email.trim().toLowerCase() });
    } catch {}
  };

  if (sent) {
    return (
      <AppScreen contentStyle={styles.content}>
        <EmailSentView
          email={email.trim().toLowerCase()}
          onResend={handleResend}
          isLoading={isLoading}
          colors={colors}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.75}
      >
        <AppText style={[styles.backArrow, { color: colors.text }]}>←</AppText>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <Mail color={colors.primary} size={28} strokeWidth={1.5} />
        </View>
        <AppText variant="display" style={styles.title}>
          Forgot password?
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.subtitle}>
          No worries. Enter your registered email and we'll send you a secure reset link.
        </AppText>
      </View>

      {/* Error */}
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.danger }]}>
          <AppText variant="caption" style={{ color: colors.danger }}>
            {error}
          </AppText>
        </View>
      ) : null}

      {/* Input */}
      <View style={styles.fieldGroup}>
        <AppText variant="caption" style={[styles.label, { color: colors.textSoft }]}>
          EMAIL ADDRESS
        </AppText>
        <AppTextInput
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          value={email}
          onChangeText={(v) => { setEmail(v); clearError(); }}
          leftSlot={<Mail color={colors.textSoft} size={18} />}
          containerStyle={styles.inputContainer}
          style={styles.input}
        />
      </View>

      {/* Submit */}
      <AppButton
        title="Send reset link"
        onPress={handleSubmit}
        disabled={!isValidEmail || isLoading}
        loading={isLoading}
        style={styles.primaryButton}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <AppText variant="caption" tone="muted">Remember your password? </AppText>
        <TouchableOpacity onPress={() => router.push('/auth/login' as Href)} activeOpacity={0.75}>
          <AppText variant="caption" style={[styles.authLink, { color: colors.primary }]}>
            Sign in.
          </AppText>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}


const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginLeft: -Spacing.two,
    marginBottom: Spacing.two,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  header: {
    gap: Spacing.two,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 20,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    borderLeftWidth: 3,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  inputContainer: {
    borderRadius: 14,
  },
  input: {
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.two,
  },
  authLink: {
    fontWeight: '800',
  },
});

const sentStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 20,
  },
  email: {
    fontSize: 15,
    textAlign: 'center',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  infoText: {
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryBtn: {
    minHeight: 56,
    borderRadius: 999,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLink: {
    fontWeight: '700',
  },
});