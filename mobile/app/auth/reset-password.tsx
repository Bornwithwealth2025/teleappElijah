import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-themes';
import useAuthStore from '@/store/authStore';

// ─── Password Rule Row ────────────────────────────────────────────────────────
function PasswordRule({ passed, label }: { passed: boolean; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={ruleStyles.row}>
      {passed ? (
        <CheckCircle2 color={colors.success} size={15} />
      ) : (
        <Circle color={colors.textSoft} size={15} />
      )}
      <AppText
        variant="caption"
        style={{ color: passed ? colors.success : colors.textMuted }}
      >
        {label}
      </AppText>
    </View>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────
function SuccessView({ colors }: { colors: any }) {
  return (
    <View style={successStyles.container}>
      <View style={[successStyles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <CheckCircle2 color={colors.primary} size={44} strokeWidth={1.5} />
      </View>

      <View style={successStyles.copy}>
        <AppText variant="display" style={successStyles.title}>
          Password updated!
        </AppText>
        <AppText variant="body" tone="muted" style={successStyles.body}>
          Your password has been reset successfully. You can now sign in with your new password.
        </AppText>
      </View>

      <AppButton
        title="Sign in now"
        onPress={() => router.replace('/auth/login' as Href)}
        style={successStyles.btn}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const allRulesPassed = Object.values(rules).every(Boolean);
  const canSubmit = token.trim().length > 0 && allRulesPassed;

  const handleReset = async () => {
    if (!canSubmit) return;
    try {
      await resetPassword({
        email: email ?? '',
        token: token.trim(),
        password,
      });
      setDone(true);
    } catch {
      // error shown via store
    }
  };

  if (done) {
    return (
      <AppScreen contentStyle={styles.content}>
        <SuccessView colors={colors} />
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
          <KeyRound color={colors.primary} size={28} strokeWidth={1.5} />
        </View>
        <AppText variant="display" style={styles.title}>
          Reset password
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.subtitle}>
          Enter the reset token from your email and choose a new password.
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

      {/* Fields */}
      <View style={styles.fields}>
        {/* Token */}
        <View style={styles.fieldGroup}>
          <AppText variant="caption" style={[styles.label, { color: colors.textSoft }]}>
            RESET TOKEN
          </AppText>
          <AppTextInput
            placeholder="Paste token from your email"
            autoCapitalize="none"
            autoCorrect={false}
            value={token}
            onChangeText={(v) => { setToken(v); clearError(); }}
            leftSlot={<KeyRound color={colors.textSoft} size={18} />}
            containerStyle={styles.inputContainer}
            style={styles.input}
          />
        </View>

        {/* New password */}
        <View style={styles.fieldGroup}>
          <AppText variant="caption" style={[styles.label, { color: colors.textSoft }]}>
            NEW PASSWORD
          </AppText>
          <AppTextInput
            placeholder="Create a strong password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(v) => { setPassword(v); clearError(); }}
            leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
            rightSlot={
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} activeOpacity={0.75}>
                {showPassword
                  ? <EyeOff color={colors.textSoft} size={18} />
                  : <Eye color={colors.textSoft} size={18} />
                }
              </TouchableOpacity>
            }
            containerStyle={styles.inputContainer}
            style={styles.input}
          />
        </View>

        {/* Confirm password */}
        <View style={styles.fieldGroup}>
          <AppText variant="caption" style={[styles.label, { color: colors.textSoft }]}>
            CONFIRM PASSWORD
          </AppText>
          <AppTextInput
            placeholder="Repeat your new password"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); clearError(); }}
            leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
            rightSlot={
              <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} activeOpacity={0.75}>
                {showConfirm
                  ? <EyeOff color={colors.textSoft} size={18} />
                  : <Eye color={colors.textSoft} size={18} />
                }
              </TouchableOpacity>
            }
            containerStyle={styles.inputContainer}
            style={styles.input}
          />
        </View>
      </View>

      {/* Password rules panel */}
      <View style={[styles.rulesPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="caption" style={[styles.rulesTitle, { color: colors.text }]}>
          Password must include:
        </AppText>
        <View style={styles.rulesGrid}>
          <PasswordRule passed={rules.length} label="8+ characters" />
          <PasswordRule passed={rules.uppercase} label="Uppercase letter" />
          <PasswordRule passed={rules.number} label="Number" />
          <PasswordRule passed={rules.special} label="Special character" />
          <PasswordRule passed={rules.match} label="Passwords match" />
        </View>
      </View>

      {/* Submit */}
      <AppButton
        title="Reset password"
        onPress={handleReset}
        disabled={!canSubmit || isLoading}
        loading={isLoading}
        style={styles.primaryButton}
      />
    </AppScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  fields: {
    gap: Spacing.three,
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
  rulesPanel: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rulesTitle: {
    fontWeight: '700',
  },
  rulesGrid: {
    gap: Spacing.two,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
  },
});

const ruleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  iconWrap: {
    width: 88,
    height: 88,
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
    lineHeight: 22,
    maxWidth: 300,
  },
  btn: {
    minHeight: 56,
    borderRadius: 999,
  },
});