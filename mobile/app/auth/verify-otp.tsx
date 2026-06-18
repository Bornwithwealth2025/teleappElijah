import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { CheckCircle2, ChevronLeft } from "lucide-react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(params.email) ? params.email[0] : params.email ?? "";

  const { colors } = useAppTheme();
  const { verifyEmail, resendOtp, isLoading, error, clearError } = useAuthStore();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [verified, setVerified] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown === 0 || verified) return;

    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);

    return () => clearTimeout(timer);
  }, [countdown, verified]);

  useEffect(() => {
    if (!verified) return;

    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 900);

    return () => clearTimeout(timer);
  }, [verified]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    clearError();

    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (!email || code.length < OTP_LENGTH || isLoading) return;

    try {
      await verifyEmail({
        email,
        otp: code,
      });

      setVerified(true);
    } catch {}
  };

  const handleResend = async () => {
    if (!email || isLoading) return;

    try {
      await resendOtp({ email });
      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch {}
  };

  if (verified) {
    return (
      <AppScreen scroll={false} contentStyle={styles.successContent}>
        <View
          style={[
            styles.successIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <CheckCircle2 color={colors.primary} size={44} />
        </View>

        <View style={styles.successCopy}>
          <AppText variant="display" style={[styles.successTitle, { color: colors.text }]}>
            Email verified
          </AppText>

          <AppText variant="body" style={[styles.successSubtitle, { color: colors.textMuted }]}>
            Your account is ready. Redirecting you to sign in.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        activeOpacity={0.75}
      >
        <ChevronLeft color={colors.text} size={22} />
      </TouchableOpacity>

      <View style={styles.header}>
        <AppText variant="display" style={[styles.title, { color: colors.text }]}>
          Verify email
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.subtitle}>
          Enter the 6-digit code sent to{" "}
          <AppText
            variant="caption"
            style={{ color: colors.text, fontWeight: "800" }}
          >
            {email || "your email"}
          </AppText>
        </AppText>
      </View>

      {error ? (
        <AppText
          variant="caption"
          style={[styles.errorText, { color: colors.danger }]}
        >
          {error}
        </AppText>
      ) : null}

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.surface,
                borderColor: digit ? colors.primary : colors.border,
                color: colors.text,
              },
            ]}
            value={digit}
            onChangeText={(value) => handleChange(value, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <AppButton
        title="Verify email"
        onPress={handleVerify}
        loading={isLoading}
        disabled={!email || otp.join("").length < OTP_LENGTH || isLoading}
        style={styles.button}
      />

      <View style={styles.resendRow}>
        <AppText variant="caption" tone="muted">
          Didn&apos;t receive it?{" "}
        </AppText>

        {countdown > 0 ? (
          <AppText variant="caption" tone="muted">
            Resend in {countdown}s
          </AppText>
        ) : (
          <TouchableOpacity onPress={handleResend} activeOpacity={0.75}>
            <AppText
              variant="caption"
              style={{ color: colors.primary, fontWeight: "800" }}
            >
              Resend code
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  subtitle: {
    maxWidth: 390,
    lineHeight: 21,
  },
  errorText: {
    textAlign: "center",
    fontWeight: "700",
  },
  otpRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpInput: {
    flex: 1,
    maxWidth: 54,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
  },
  button: {
    minHeight: 58,
    borderRadius: 999,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  successIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  successCopy: {
    alignItems: "center",
    gap: Spacing.two,
  },
  successTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    textAlign: "center",
  },
  successSubtitle: {
    maxWidth: 320,
    textAlign: "center",
    lineHeight: 22,
  },
});