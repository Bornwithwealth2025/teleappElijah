import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MailCheck,
  Sparkles,
} from "lucide-react-native";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { TelifierLogo } from "@/components/shared/TelifierLogo";
import {
  AppButton,
  BRAND_GRADIENT,
} from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

const OTP_LENGTH = 6;

const HIGHLIGHT = {
  dark: "#5EEAD4",
  light: "#0D9488",
};

const LINK_COLOR = {
  dark: "#60A5FA",
  light: "#2563EB",
};

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{
    email?: string | string[];
  }>();

  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email ?? "";

  const { colors, isDark } = useAppTheme();

  const verifyEmail = useAuthStore(
    (state) => state.verifyEmail,
  );
  const resendOtp = useAuthStore(
    (state) => state.resendOtp,
  );
  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore(
    (state) => state.clearError,
  );

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [countdown, setCountdown] = useState(60);
  const [verified, setVerified] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  const screenOpacity = useRef(
    new Animated.Value(0),
  ).current;
  const screenTranslateY = useRef(
    new Animated.Value(18),
  ).current;
  const successScale = useRef(
    new Animated.Value(0.82),
  ).current;

  useEffect(() => {
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
    if (!verified) return;

    Animated.spring(successScale, {
      toValue: 1,
      damping: 12,
      stiffness: 160,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [successScale, verified]);

  useEffect(() => {
    if (countdown === 0 || verified) return;

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

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

    if (digits.length > 1) {
      const pasted = digits.slice(0, OTP_LENGTH).split("");
      const next = Array(OTP_LENGTH).fill("");

      pasted.forEach((digit, offset) => {
        next[offset] = digit;
      });

      setOtp(next);
      clearError();

      inputs.current[
        Math.min(pasted.length, OTP_LENGTH - 1)
      ]?.focus();

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

    if (!email || code.length !== OTP_LENGTH || isLoading) {
      return;
    }

    try {
      await verifyEmail({
        email,
        otp: code,
      });

      setVerified(true);
    } catch {
      // The auth store exposes the backend error.
    }
  }

  async function handleResend() {
    if (!email || isLoading || countdown > 0) {
      return;
    }

    try {
      await resendOtp({ email });

      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch {
      // The auth store exposes the backend error.
    }
  }

  const highlight = isDark
    ? HIGHLIGHT.dark
    : HIGHLIGHT.light;

  const linkColor = isDark
    ? LINK_COLOR.dark
    : LINK_COLOR.light;

  if (verified) {
    return (
      <AppScreen
        scroll={false}
        contentStyle={styles.successContent}
      >
        <TelifierLogo size="md" />

        <Animated.View
          style={[
            styles.successIcon,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <CheckCircle2 color={colors.success} size={48} />
        </Animated.View>

        <View style={styles.successCopy}>
          <AppText
            style={[styles.successTitle, { color: colors.text }]}
          >
            Email verified.
          </AppText>

          <AppText
            style={[
              styles.successSubtitle,
              { color: colors.textMuted },
            ]}
          >
            Your Telefya account is ready. We’ll take you to
            sign in now.
          </AppText>
        </View>

        <View
          style={[
            styles.successStatus,
            {
              backgroundColor: `${colors.success}14`,
              borderColor: `${colors.success}38`,
            },
          ]}
        >
          <Check color={colors.success} size={16} />

          <AppText
            style={[
              styles.successStatusText,
              { color: colors.success },
            ]}
          >
            Verification complete
          </AppText>
        </View>
      </AppScreen>
    );
  }

  const codeComplete = otp.join("").length === OTP_LENGTH;

  return (
    <AppScreen
      keyboardShouldPersistTaps="always"
      contentStyle={styles.content}
    >
      <Animated.View
        style={[
          styles.screen,
          {
            opacity: screenOpacity,
            transform: [{ translateY: screenTranslateY }],
          },
        ]}
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/auth/login");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
              styles.backButton,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <ArrowLeft color={colors.text} size={20} />
          </Pressable>

          <TelifierLogo size="sm" />

          <View style={styles.topSpacer} />
        </View>

        <View style={styles.intro}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Sparkles color={highlight} size={13} />

            <AppText
              style={[
                styles.badgeText,
                { color: colors.textMuted },
              ]}
            >
              VERIFY YOUR ACCOUNT
            </AppText>
          </View>

          <AppText style={[styles.title, { color: colors.text }]}>
            Check your inbox.
          </AppText>

          <AppText
            style={[styles.subtitle, { color: colors.textMuted }]}
          >
            Enter the six-digit code sent to{" "}
            <AppText
              style={[styles.emailText, { color: colors.text }]}
            >
              {email || "your email"}
            </AppText>
          </AppText>
        </View>

        <View
          style={[
            styles.formPanel,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
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
              <AppText
                style={[
                  styles.mailTitle,
                  { color: colors.text },
                ]}
              >
                One-time verification code
              </AppText>

              <AppText
                style={[
                  styles.mailSubtitle,
                  { color: colors.textMuted },
                ]}
              >
                Check spam if you do not see the email.
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
                onChangeText={(value) =>
                  handleChange(value, index)
                }
                onKeyPress={(event) =>
                  handleKeyPress(event, index)
                }
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
                    borderColor: digit
                      ? colors.primary
                      : colors.border,
                    color: colors.text,
                  },
                ]}
              />
            ))}
          </View>

          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: `${colors.danger}14`,
                  borderColor: colors.danger,
                },
              ]}
            >
              <AppText
                style={[
                  styles.errorText,
                  { color: colors.danger },
                ]}
              >
                {error}
              </AppText>
            </View>
          ) : null}

          <AppButton
            title="Verify email"
            variant="gradient"
            gradientColors={BRAND_GRADIENT}
            contentAlign="spaceBetween"
            leftIcon={<MailCheck color="#FFFFFF" size={18} />}
            rightIcon={<ArrowRight color="#FFFFFF" size={18} />}
            loading={isLoading}
            disabled={!email || !codeComplete || isLoading}
            onPress={handleVerify}
            accessibilityLabel="Verify email"
          />
        </View>

        <View style={styles.resendRow}>
          <AppText
            style={[
              styles.resendText,
              { color: colors.textMuted },
            ]}
          >
            Didn’t receive the code?
          </AppText>

          {countdown > 0 ? (
            <AppText
              style={[
                styles.resendText,
                { color: colors.textSoft },
              ]}
            >
              Resend in {countdown}s
            </AppText>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={isLoading}
              hitSlop={8}
            >
              <AppText
                style={[
                  styles.resendLink,
                  { color: linkColor },
                ]}
              >
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
    paddingBottom: Spacing.six,
  },

  screen: {
    width: "100%",
    gap: Spacing.five,
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
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topSpacer: {
    width: 44,
  },

  intro: {
    gap: Spacing.two,
  },

  badge: {
    alignSelf: "flex-start",
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  subtitle: {
    maxWidth: 390,
    fontSize: 14,
    lineHeight: 21,
  },

  emailText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
  },

  formPanel: {
    gap: Spacing.four,
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.four,
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
    minWidth: 0,
    gap: 2,
  },

  mailTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  mailSubtitle: {
    fontSize: 12,
    lineHeight: 17,
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

  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },

  errorText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  resendText: {
    fontSize: 12,
    fontWeight: "600",
  },

  resendLink: {
    fontSize: 12,
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
    width: 94,
    height: 94,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  successCopy: {
    alignItems: "center",
    gap: Spacing.two,
  },

  successTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },

  successSubtitle: {
    maxWidth: 330,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  successStatus: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
  },

  successStatusText: {
    fontSize: 12,
    fontWeight: "800",
  },
});