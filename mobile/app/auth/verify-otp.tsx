import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MailCheck,
} from "lucide-react-native";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email ?? "";

  const { colors } = useAppTheme();

  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [countdown, setCountdown] = useState(60);
  const [verified, setVerified] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  const screenOpacity = React.useRef(
    new Animated.Value(0),
  ).current;

  const screenTranslateY = React.useRef(
    new Animated.Value(18),
  ).current;

  const successScale = React.useRef(
    new Animated.Value(0.82),
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

  React.useEffect(() => {
    if (!verified) return;

    Animated.spring(successScale, {
      toValue: 1,
      damping: 12,
      stiffness: 160,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [verified, successScale]);

  useEffect(() => {
    if (countdown === 0 || verified) return;

    const timer = setTimeout(
      () => setCountdown((value) => value - 1),
      1000,
    );

    return () => clearTimeout(timer);
  }, [countdown, verified]);

  useEffect(() => {
    if (!verified) return;

    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 1200);

    return () => clearTimeout(timer);
  }, [verified]);

  function handleChange(value: string, index: number) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      clearError();
      return;
    }

    // Supports pasting the complete OTP into any input.
    if (digits.length > 1) {
      const pasted = digits.slice(0, OTP_LENGTH).split("");
      const next = Array(OTP_LENGTH).fill("");

      pasted.forEach((digit, offset) => {
        next[offset] = digit;
      });

      setOtp(next);
      clearError();
      inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = digits.slice(-1);
    setOtp(next);
    clearError();

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(event: any, index: number) {
    if (
      event.nativeEvent.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join("");

    if (!email || code.length !== OTP_LENGTH || isLoading) return;

    try {
      await verifyEmail({
        email,
        otp: code,
      });

      setVerified(true);
    } catch {
      // AuthStore exposes the backend error.
    }
  }

  async function handleResend() {
    if (!email || isLoading || countdown > 0) return;

    try {
      await resendOtp({ email });
      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch {
      // AuthStore exposes the backend error.
    }
  }

  if (verified) {
    return (
      <AppScreen scroll={false} contentStyle={styles.successContent}>
        <TelifierLogo size="md" />

        <Animated.View
          style={[
            styles.successIcon,
            {
              backgroundColor: colors.primarySoft,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <CheckCircle2 color={colors.success} size={46} />
        </Animated.View>

        <View style={styles.successCopy}>
          <AppText variant="display" style={styles.successTitle}>
            Email verified.
          </AppText>

          <AppText variant="body" tone="muted" style={styles.successSubtitle}>
            Your Telefya account is ready. We’ll take you to sign in now.
          </AppText>
        </View>

        <View style={styles.successStatus}>
          <Check color={colors.success} size={16} />
          <AppText variant="caption" tone="success">
            Verification complete
          </AppText>
        </View>
      </AppScreen>
    );
  }

  const codeComplete = otp.join("").length === OTP_LENGTH;

  return (
    <AppScreen contentStyle={styles.content}>
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
          <AppText variant="overline" tone="primary">
            VERIFY YOUR ACCOUNT
          </AppText>

          <AppText variant="display" style={styles.title}>
            Check your inbox.
          </AppText>

          <AppText variant="body" tone="muted" style={styles.subtitle}>
            Enter the six-digit code sent to{" "}
            <AppText variant="bodyStrong">{email || "your email"}</AppText>
          </AppText>
        </View>

        <AppCard variant="default" elevated style={styles.card}>
          <View style={styles.mailRow}>
            <View
              style={[
                styles.mailIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <MailCheck color={colors.primary} size={22} />
            </View>

            <View style={styles.mailCopy}>
              <AppText variant="bodyStrong">One-time verification code</AppText>
              <AppText variant="caption" tone="muted">
                The code expires soon. Check your spam folder if needed.
              </AppText>
            </View>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={OTP_LENGTH}
                selectTextOnFocus
                selectionColor={colors.primary}
                cursorColor={colors.primary}
                accessibilityLabel={`Verification digit ${index + 1}`}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: digit ? colors.primary : colors.border,
                    color: colors.text,
                  },
                ]}
              />
            ))}
          </View>

          {error ? (
            <AppText variant="caption" tone="danger" style={styles.errorText}>
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Verify email"
            onPress={handleVerify}
            loading={isLoading}
            disabled={!email || !codeComplete || isLoading}
            containerStyle={styles.button}
          />
        </AppCard>

        <View style={styles.resendRow}>
          <AppText variant="caption" tone="muted">
            Didn’t receive the code?
          </AppText>

          {countdown > 0 ? (
            <AppText variant="caption" tone="muted">
              Resend in {countdown}s
            </AppText>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={isLoading}
              hitSlop={8}
            >
              <AppText variant="caption" tone="primary" style={styles.link}>
                Resend code
              </AppText>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
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

  title: {
    letterSpacing: -0.8,
  },

  subtitle: {
    maxWidth: 390,
    lineHeight: 23,
  },

  card: {
    gap: Spacing.four,
  },

  mailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  mailIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  mailCopy: {
    flex: 1,
    gap: 2,
  },

  otpRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
  },

  otpInput: {
    flex: 1,
    maxWidth: 54,
    minHeight: 58,
    borderWidth: 2,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
  },

  errorText: {
    textAlign: "center",
    fontWeight: "700",
  },

  button: {
    marginTop: Spacing.one,
  },

  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  link: {
    fontWeight: "800",
  },

  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.five,
    paddingHorizontal: Spacing.five,
  },

  successIcon: {
    width: 92,
    height: 92,
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

  successSubtitle: {
    maxWidth: 330,
    textAlign: "center",
    lineHeight: 23,
  },

  successStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});