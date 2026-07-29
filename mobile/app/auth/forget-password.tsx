import React, { useEffect, useState } from "react";
import { router, type Href } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();

  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset,
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(
      () => setResendCountdown((value) => value - 1),
      1000,
    );

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  async function handleSubmit() {
    if (!isValidEmail || isLoading) return;

    try {
      await requestPasswordReset({
        email: email.trim().toLowerCase(),
      });

      setSent(true);
      setResendCountdown(30);
    } catch {
      // AuthStore exposes the backend error.
    }
  }

  async function handleResend() {
    if (!isValidEmail || isLoading || resendCountdown > 0) return;

    try {
      await requestPasswordReset({
        email: email.trim().toLowerCase(),
      });

      setResendCountdown(30);
    } catch {
      // AuthStore exposes the backend error.
    }
  }

if (sent) {
    return (
      <AppScreen scroll={false} contentStyle={styles.successScreen}>
        <Animated.View
          style={{
            width: "100%",
            opacity: screenOpacity,
            transform: [{ translateY: screenTranslateY }],
          }}
        >
          <TelifierLogo size="md" />

          <View
            style={[
              styles.successIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <CheckCircle2 color={colors.success} size={46} />
          </View>

          <View style={styles.successCopy}>
            <AppText variant="display" style={styles.successTitle}>
              Check your inbox.
            </AppText>

            <AppText variant="body" tone="muted" style={styles.successBody}>
              We sent a password reset link to
            </AppText>

            <AppText variant="bodyStrong" style={styles.email}>
              {email.trim().toLowerCase()}
            </AppText>
          </View>

          <AppCard variant="soft" compact style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ShieldCheck color={colors.success} size={18} />
              <AppText variant="caption" tone="muted" style={styles.infoText}>
                The reset link expires in 15 minutes. Check your spam folder if
                you do not see it.
              </AppText>
            </View>
          </AppCard>

          <AppButton
            title="Back to sign in"
            onPress={() => router.replace("/auth/login" as Href)}
            containerStyle={styles.primaryButton}
          />

          <View style={styles.resendRow}>
            <AppText variant="caption" tone="muted">
              Didn't receive it?
            </AppText>

            {resendCountdown > 0 ? (
              <AppText variant="caption" tone="muted">
                Resend in {resendCountdown}s
              </AppText>
            ) : (
              <Pressable onPress={handleResend} disabled={isLoading} hitSlop={8}>
                <AppText variant="caption" tone="primary" style={styles.link}>
                  Resend email
                </AppText>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </AppScreen>
    );
  }

return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <Animated.View
        style={{
          width: "100%",
          opacity: screenOpacity,
          transform: [{ translateY: screenTranslateY }],
        }}
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/auth/login");
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <ArrowLeft color={colors.text} size={20} />
          </Pressable>

          <TelifierLogo size="sm" />
        </View>

        <View style={styles.intro}>
          <View
            style={[
              styles.mailIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Mail color={colors.primary} size={24} />
          </View>

          <AppText variant="overline" tone="primary">
            ACCOUNT RECOVERY
          </AppText>

          <AppText variant="display" style={styles.title}>
            Forgot your password?
          </AppText>

          <AppText variant="body" tone="muted" style={styles.subtitle}>
            Enter your registered email and we'll send you a secure reset link.
          </AppText>
        </View>

        <AppCard variant="default" elevated style={styles.formCard}>
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
              <AppText variant="caption" tone="danger">
                {error}
              </AppText>
            </View>
          ) : null}

          <AppTextInput
            label="Email address"
            placeholder="you@company.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearError();
            }}
            leftSlot={<Mail color={colors.textSoft} size={19} />}
          />

          <AppButton
            title="Send reset link"
            onPress={handleSubmit}
            disabled={!isValidEmail || isLoading}
            loading={isLoading}
            containerStyle={styles.primaryButton}
          />
        </AppCard>

        <View style={styles.footer}>
          <AppText variant="caption" tone="muted">
            Remember your password?
          </AppText>

          <Pressable
            onPress={() => router.push("/auth/login" as Href)}
            hitSlop={8}
          >
            <AppText variant="caption" tone="primary" style={styles.link}>
              Sign in
            </AppText>
          </Pressable>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.five,
    paddingBottom: Spacing.six,
  },

  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  intro: {
    gap: Spacing.two,
  },

  mailIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  title: {
    letterSpacing: -0.8,
  },

  subtitle: {
    maxWidth: 380,
    lineHeight: 23,
  },

  formCard: {
    gap: Spacing.four,
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: Radius.small,
    padding: Spacing.three,
  },

  primaryButton: {
    marginTop: Spacing.one,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  link: {
    fontWeight: "800",
  },

  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.five,
    paddingHorizontal: Spacing.five,
  },

  successIcon: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  successCopy: {
    alignItems: "center",
    gap: Spacing.two,
  },

  successTitle: {
    textAlign: "center",
  },

  successBody: {
    textAlign: "center",
  },

  email: {
    textAlign: "center",
    maxWidth: 330,
  },

  infoCard: {
    width: "100%",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  infoText: {
    flex: 1,
    lineHeight: 20,
  },

  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
});