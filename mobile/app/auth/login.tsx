// app/auth/login.tsx
import React from "react";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { AppButton, BRAND_GRADIENT } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

// Same accent pairing used on the welcome screen, so "secure" language and
// links read as the same brand voice across every auth-adjacent screen.
const HIGHLIGHT = { dark: "#5EEAD4", light: "#0D9488" };
const LINK_COLOR = { dark: "#60A5FA", light: "#2563EB" };

function Checkbox({
  checked,
  onPress,
}: {
  checked: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  if (checked) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.checkboxBox}
        >
          <Check color="#FFFFFF" size={13} strokeWidth={3} />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.checkboxBox,
        { borderWidth: 1.5, borderColor: colors.border },
      ]}
    />
  );
}

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();

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

  const highlight = isDark ? HIGHLIGHT.dark : HIGHLIGHT.light;
  const linkColor = isDark ? LINK_COLOR.dark : LINK_COLOR.light;

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
            { backgroundColor: colors.glass, borderColor: colors.glassBorder },
          ]}
        >
          <ArrowLeft color={colors.text} size={20} />
        </Pressable>

        <TelifierLogo size="sm" />

        <View style={styles.topSpacer} />
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
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.glass, borderColor: colors.glassBorder },
          ]}
        >
          <Sparkles color={highlight} size={13} />
          <AppText style={[styles.badgeText, { color: colors.textMuted }]}>
            SECURE WORKSPACE ACCESS
          </AppText>
        </View>

        <AppText style={[styles.title, { color: colors.text }]}>
          Welcome back.
        </AppText>

        <AppText style={[styles.subtitle, { color: colors.textMuted }]}>
          Sign in to manage secure meetings, rooms, and connections.
        </AppText>
      </Animated.View>

      <Animated.View
        style={[
          styles.formPanel,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          },
        ]}
      >
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
            containerStyle={[
              styles.inputContainer,
              { backgroundColor: colors.surface },
            ]}
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
            containerStyle={[
              styles.inputContainer,
              { backgroundColor: colors.surface },
            ]}
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
            <AppText style={[styles.metaText, { color: colors.textMuted }]}>
              Keep me signed in
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/auth/forget-password" as Href)}
            hitSlop={8}
          >
            <AppText style={[styles.link, { color: linkColor }]}>
              Forgot password?
            </AppText>
          </Pressable>
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
            <AppText style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </AppText>
          </View>
        ) : null}

        <AppButton
          title="Sign in"
          variant="gradient"
          gradientColors={BRAND_GRADIENT}
          contentAlign="spaceBetween"
          leftIcon={<ShieldCheck color="#FFFFFF" size={18} />}
          rightIcon={<ArrowRight color="#FFFFFF" size={18} />}
          loading={isLoading}
          disabled={!email.trim() || !password || isLoading}
          onPress={handleLogin}
          accessibilityLabel="Sign in to Telefya"
        />
      </Animated.View>

      <View style={styles.footer}>
        <AppText style={[styles.footerText, { color: colors.textMuted }]}>
          Don&apos;t have a Telefya account?
        </AppText>

        <Pressable
          onPress={() => router.push("/auth/register" as Href)}
          hitSlop={8}
        >
          <AppText style={[styles.link, { color: linkColor }]}>
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
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topSpacer: { width: 44 },

  intro: { gap: Spacing.two },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 30,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },

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

  formPanel: {
    gap: Spacing.four,
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.four,
  },

  fields: { gap: Spacing.three },

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
    alignItems: "center",
    justifyContent: "center",
  },

  metaText: { fontSize: 12, fontWeight: "600" },

  link: { fontSize: 12, fontWeight: "800" },

  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },

  errorText: { fontSize: 12, fontWeight: "600" },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  footerText: { fontSize: 12, fontWeight: "600" },
});