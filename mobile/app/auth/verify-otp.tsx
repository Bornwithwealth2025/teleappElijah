import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useAppTheme();
  const { verifyEmail, resendOtp, isLoading, error, clearError } =
    useAuthStore();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    clearError();
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return;
    try {
      await verifyEmail({ email, otp: code });
      router.replace("/auth/login");
    } catch {}
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email });
      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch {}
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <AppText style={[styles.backArrow, { color: colors.text }]}>←</AppText>
      </TouchableOpacity>

      <View style={styles.header}>
        <AppText variant="display" style={styles.title}>
          Verify email
        </AppText>
        <AppText variant="caption" tone="muted">
          Enter the 6-digit code sent to{" "}
          <AppText
            variant="caption"
            style={{ color: colors.text, fontWeight: "700" }}
          >
            {email}
          </AppText>
        </AppText>
      </View>

      {error ? (
        <AppText
          variant="caption"
          style={{ color: colors.danger, textAlign: "center" }}
        >
          {error}
        </AppText>
      ) : null}

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
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
            onChangeText={(v) => handleChange(v, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
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
        style={styles.button}
      />

      <View style={styles.resendRow}>
        <AppText variant="caption" tone="muted">
          Didn't receive it?{" "}
        </AppText>
        {countdown > 0 ? (
          <AppText variant="caption" tone="muted">
            Resend in {countdown}s
          </AppText>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <AppText
              variant="caption"
              style={{ color: colors.primary, fontWeight: "700" }}
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
    justifyContent: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  backArrow: { fontSize: 22, fontWeight: "700", lineHeight: 24 },
  header: { gap: Spacing.two },
  title: { fontSize: 29, fontWeight: "800" },
  otpRow: { flexDirection: "row", justifyContent: "space-between" },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  button: { minHeight: 56, borderRadius: 999 },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
