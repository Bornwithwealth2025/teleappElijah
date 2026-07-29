// app/auth/login.tsx
import React from "react";
import { router, type Href } from "expo-router";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import { Pressable, StyleSheet, View, Animated } from "react-native";

import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

function Checkbox({
  checked,
  onPress,
}: {
  checked: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.checkboxBox,
        {
          borderColor: checked ? colors.primary : colors.border,
          backgroundColor: checked ? colors.primary : "transparent",
        },
      ]}
    >
      {checked ? <Check color="#FFFFFF" size={13} strokeWidth={3} /> : null}
    </Pressable>
  );
}

export default function LoginScreen() {
  const { colors } = useAppTheme();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberDevice, setRememberDevice] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);

  const introOpacity = React.useRef(new Animated.Value(0)).current;

  const introTranslateY = React.useRef(new Animated.Value(18)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(introTranslateY, {
        toValue: 0,
        damping: 17,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [introOpacity, introTranslateY]);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) return;

    try {
      await login({
        email: normalizedEmail,
        password,
      });

      router.replace("/(tabs)");
    } catch {
      // AuthStore exposes the backend error to the screen.
    }
  }

  return (
    <AppScreen keyboardShouldPersistTaps="always" contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/welcome");
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <ArrowLeft color={colors.text} size={20} />
        </Pressable>

        <TelifierLogo size="sm" />
      </View>

      <Animated.View
        style={[
          styles.intro,
          {
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          },
        ]}
      >
        <AppText variant="overline" tone="primary">
          TELEFYA WORKSPACE
        </AppText>

        <AppText variant="display" style={styles.title}>
          Welcome back.
        </AppText>

        <AppText variant="body" tone="muted" style={styles.subtitle}>
          Sign in to manage secure meetings, rooms, and connections.
        </AppText>
      </Animated.View>

      <AppCard variant="default" elevated style={styles.formCard}>
        <View style={styles.trustRow}>
          <ShieldCheck color={colors.success} size={17} />
          <AppText variant="caption" tone="success">
            Secure workspace access
          </AppText>
        </View>

        <View style={styles.fields}>
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
            containerStyle={styles.inputContainer}
          />

          <AppTextInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            textContentType="password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearError();
            }}
            leftSlot={<LockKeyhole color={colors.textSoft} size={19} />}
            rightSlot={
              <Pressable
                onPress={() => setShowPassword((value) => !value)}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                hitSlop={8}
              >
                {showPassword ? (
                  <EyeOff color={colors.textSoft} size={19} />
                ) : (
                  <Eye color={colors.textSoft} size={19} />
                )}
              </Pressable>
            }
            containerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.metaRow}>
          <Pressable
            onPress={() => setRememberDevice((value) => !value)}
            style={styles.rememberRow}
          >
            <Checkbox
              checked={rememberDevice}
              onPress={() => setRememberDevice((value) => !value)}
            />
            <AppText variant="caption" tone="muted">
              Keep me signed in
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/auth/forget-password" as Href)}
            hitSlop={8}
          >
            <AppText variant="caption" tone="primary" style={styles.link}>
              Forgot password?
            </AppText>
          </Pressable>
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
            <AppText variant="caption" tone="danger">
              {error}
            </AppText>
          </View>
        ) : null}

        <AppButton
          title="Sign in"
          loading={isLoading}
          disabled={!email.trim() || !password || isLoading}
          onPress={handleLogin}
          containerStyle={styles.buttonContainer}
          style={styles.button}
        />
      </AppCard>

      <View style={styles.footer}>
        <AppText variant="caption" tone="muted">
          Don't have a Telefya account?
        </AppText>

        <Pressable
          onPress={() => router.push("/auth/register" as Href)}
          hitSlop={8}
        >
          <AppText variant="caption" tone="primary" style={styles.link}>
            Create one
          </AppText>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    gap: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },

  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  intro: {
    gap: Spacing.two,
  },

  title: {
    letterSpacing: -1,
  },

  subtitle: {
    maxWidth: 390,
    lineHeight: 23,
  },

  formCard: {
    gap: Spacing.four,
    borderRadius: 22,
  },

  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  fields: {
    gap: Spacing.three,
  },

  inputContainer: {
    borderRadius: 16,
    borderWidth: 0,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    flexWrap: "wrap",
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

  link: {
    fontWeight: "800",
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: Radius.small,
    padding: Spacing.three,
  },

  buttonContainer: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    marginTop: Spacing.one,
  },

  button: {
    minHeight: 54,
    borderRadius: 18,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
});