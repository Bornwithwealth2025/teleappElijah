import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  CheckCircle2,
  ChevronLeft,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
} from "lucide-react-native";
import React from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function PasswordRule({
  passed,
  label,
}: {
  passed: boolean;
  label: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.ruleRow}>
      {passed ? (
        <CheckCircle2 color={colors.success} size={16} />
      ) : (
        <Circle color={colors.textSoft} size={16} />
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

export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{
    email?: string | string[];
    token?: string | string[];
    resetToken?: string | string[];
  }>();

  const initialEmail = firstParam(params.email);
  const initialToken =
    firstParam(params.token) || firstParam(params.resetToken);

  const {
    resetPassword,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [email, setEmail] = React.useState(initialEmail);
  const [token, setToken] = React.useState(initialToken);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const screenOpacity = React.useRef(
    new Animated.Value(0),
  ).current;

  const screenTranslateY = React.useRef(
    new Animated.Value(18),
  ).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(screenTranslateY, {
        toValue: 0,
        damping: 17,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [screenOpacity, screenTranslateY]);

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const canSubmit =
    email.trim().length > 0 &&
    token.trim().length > 0 &&
    Object.values(rules).every(Boolean) &&
    !isLoading;

  const handleReset = async () => {
    if (!canSubmit) return;

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        password,
      });

      setCompleted(true);
    } catch {
      // Error is provided by the auth store.
    }
  };

  if (completed) {
    return (
      <AppScreen scroll={false} contentStyle={styles.successScreen}>
        <TelifierLogo size="md" />

        <View
          style={[
            styles.successIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <CheckCircle2 color={colors.primary} size={46} />
        </View>

        <AppText variant="display" style={styles.successTitle}>
          Password updated
        </AppText>

        <AppText
          variant="body"
          tone="muted"
          style={styles.successDescription}
        >
          Your password has been reset successfully. You can now sign in with
          your new password.
        </AppText>

        <AppButton
          title="Sign in now"
          onPress={() => router.replace("/auth/login" as Href)}
          containerStyle={styles.fullWidth}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <Animated.View
        style={{
          width: "100%",
          opacity: screenOpacity,
          transform: [{ translateY: screenTranslateY }],
        }}
      >
        <View style={styles.topBar}>
          <TelifierLogo size="sm" />

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <ChevronLeft color={colors.text} size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.heading}>
          <AppText variant="label" tone="primary">
            ACCOUNT RECOVERY
          </AppText>

          <AppText variant="display" style={styles.title}>
            Reset your password
          </AppText>

          <AppText variant="body" tone="muted" style={styles.subtitle}>
            Enter the reset token from your email and create a new secure
            password.
          </AppText>
        </View>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.danger,
              },
            ]}
          >
            <AppText variant="caption" style={{ color: colors.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <AppCard variant="soft" style={styles.formCard}>
          <AppTextInput
            label="Email address"
            placeholder="you@example.com"
            value={email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={(value) => {
              setEmail(value);
              clearError();
            }}
            leftSlot={<Mail color={colors.textSoft} size={18} />}
          />

          <AppTextInput
            label="Reset token"
            placeholder="Paste token from your email"
            value={token}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(value) => {
              setToken(value);
              clearError();
            }}
            leftSlot={<KeyRound color={colors.textSoft} size={18} />}
          />

          <AppTextInput
            label="New password"
            placeholder="Create a strong password"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={(value) => {
              setPassword(value);
              clearError();
            }}
            leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
            rightSlot={
              <TouchableOpacity
                onPress={() => setShowPassword((value) => !value)}
                activeOpacity={0.75}
              >
                {showPassword ? (
                  <EyeOff color={colors.textSoft} size={19} />
                ) : (
                  <Eye color={colors.textSoft} size={19} />
                )}
              </TouchableOpacity>
            }
          />

          <AppTextInput
            label="Confirm password"
            placeholder="Repeat your new password"
            value={confirmPassword}
            secureTextEntry={!showConfirm}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearError();
            }}
            leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
            rightSlot={
              <TouchableOpacity
                onPress={() => setShowConfirm((value) => !value)}
                activeOpacity={0.75}
              >
                {showConfirm ? (
                  <EyeOff color={colors.textSoft} size={19} />
                ) : (
                  <Eye color={colors.textSoft} size={19} />
                )}
              </TouchableOpacity>
            }
          />

          <View
            style={[
              styles.rulesPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <AppText variant="bodyStrong">Password requirements</AppText>

            <View style={styles.rulesGrid}>
              <PasswordRule passed={rules.length} label="8+ characters" />
              <PasswordRule passed={rules.uppercase} label="Uppercase letter" />
              <PasswordRule passed={rules.number} label="Number" />
              <PasswordRule passed={rules.special} label="Special character" />
              <PasswordRule passed={rules.match} label="Passwords match" />
            </View>
          </View>

          <AppButton
            title="Reset password"
            onPress={handleReset}
            loading={isLoading}
            disabled={!canSubmit}
          />
        </AppCard>

        <View style={styles.footer}>
          <AppText variant="caption" tone="muted">
            Remember your password?
          </AppText>

          <TouchableOpacity
            onPress={() => router.replace("/auth/login" as Href)}
            activeOpacity={0.75}
          >
            <AppText variant="caption" tone="primary" style={styles.footerLink}>
              Sign in
            </AppText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    maxWidth: 360,
    lineHeight: 22,
  },
  errorBox: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  formCard: {
    gap: Spacing.three,
  },
  rulesPanel: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rulesGrid: {
    gap: Spacing.two,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    paddingBottom: Spacing.two,
  },
  footerLink: {
    fontWeight: "800",
  },
  successScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.five,
  },
  successTitle: {
    textAlign: "center",
  },
  successDescription: {
    maxWidth: 340,
    textAlign: "center",
    lineHeight: 22,
  },
  fullWidth: {
    width: "100%",
  },
});