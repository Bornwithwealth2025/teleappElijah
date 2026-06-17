import React from "react";
import useAuthStore from "@/store/authStore";
import { FontAwesome } from "@expo/vector-icons";
import { Link, router, Href } from "expo-router";
import { Check, ChevronLeft, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import { useSocialAuth } from "@/hooks/useSocialAuth";

function GoogleLogo() {
  return <FontAwesome name="google" size={20} color="#4285F4" />;
}

function AppleLogo({ color }: { color: string }) {
  return <FontAwesome name="apple" size={22} color={color} />;
}

function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View
        style={[
          styles.checkboxBox,
          { borderColor: checked ? colors.primary : colors.border },
          checked && { backgroundColor: colors.primary },
        ]}
      >
        {checked ? <Check color="#FFFFFF" size={12} strokeWidth={3} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [savePassword, setSavePassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { googleReady, appleAvailable, signInWithGoogle, signInWithApple } = useSocialAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace("/(tabs)");
    } catch {}
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.75}
      >
        <ChevronLeft color={colors.text} size={22} />
      </TouchableOpacity>

      <View style={styles.header}>
        <AppText variant="display" style={[styles.title, { color: colors.text }]}>
          Welcome back
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.subtitle}>
          Sign in to continue managing secure meetings, rooms, and connections.
        </AppText>
      </View>

      <View style={styles.fields}>
        <AppTextInput
          placeholder="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearError();
          }}
          leftSlot={<Mail color={colors.textSoft} size={19} />}
          containerStyle={styles.inputContainer}
          style={styles.input}
        />

        <AppTextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearError();
          }}
          leftSlot={<LockKeyhole color={colors.textSoft} size={19} />}
          rightSlot={
            <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.75}>
              {showPassword ? (
                <EyeOff color={colors.textSoft} size={19} />
              ) : (
                <Eye color={colors.textSoft} size={19} />
              )}
            </TouchableOpacity>
          }
          containerStyle={styles.inputContainer}
          style={styles.input}
        />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.rememberRow}>
          <Checkbox checked={savePassword} onPress={() => setSavePassword((value) => !value)} />
          <AppText variant="caption" tone="muted">
            Save password
          </AppText>
        </View>

        <TouchableOpacity activeOpacity={0.75} onPress={() => router.push("/auth/forgot-password" as Href)}>
          <AppText variant="caption" style={[styles.forgotLink, { color: colors.primary }]}>
            Forgot password?
          </AppText>
        </TouchableOpacity>
      </View>

      {error ? (
        <AppText variant="caption" style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </AppText>
      ) : null}

      <AppButton
        title="Sign In"
        onPress={handleLogin}
        loading={isLoading}
        disabled={!email.trim() || !password || isLoading}
        style={styles.primaryButton}
      />

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <AppText variant="caption" tone="muted" style={styles.dividerLabel}>
          Or continue with
        </AppText>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.socialStack}>
        <TouchableOpacity
          style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.75}
          disabled={!googleReady || isLoading}
          onPress={signInWithGoogle}
        >
          <GoogleLogo />
          <AppText variant="bodyStrong" style={[styles.socialLabel, { color: colors.text }]}>
            Continue with Google
          </AppText>
        </TouchableOpacity>

        {appleAvailable ? (
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.75}
            disabled={isLoading}
            onPress={signInWithApple}
          >
            <AppleLogo color={colors.text} />
            <AppText variant="bodyStrong" style={[styles.socialLabel, { color: colors.text }]}>
              Continue with Apple
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" tone="muted">
          Don&apos;t have an account?
        </AppText>

        <Link href="/auth/register" asChild>
          <TouchableOpacity activeOpacity={0.75}>
            <AppText variant="caption" style={[styles.authLink, { color: colors.primary }]}>
              Sign Up.
            </AppText>
          </TouchableOpacity>
        </Link>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 560,
    justifyContent: "center",
    gap: Spacing.five,
    paddingHorizontal: Spacing.five,
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
    maxWidth: 380,
    lineHeight: 21,
  },
  fields: {
    gap: Spacing.three,
  },
  inputContainer: {
    minHeight: 58,
    borderRadius: 16,
  },
  input: {
    fontSize: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotLink: {
    fontWeight: "800",
  },
  errorText: {
    textAlign: "center",
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 999,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    flexShrink: 0,
  },
  socialStack: {
    gap: Spacing.three,
  },
  socialBtn: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  socialLabel: {
    flexShrink: 1,
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  authLink: {
    fontWeight: "900",
  },
});