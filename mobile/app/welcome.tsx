import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as NavigationBar from "expo-navigation-bar";
import {
  Animated,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  MessageCircle,
  ShieldCheck,
  UsersRound,
  Video,
} from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

const features = [
  { label: "Chat", icon: MessageCircle, color: "#0F6BFF" },
  { label: "Meet", icon: Video, color: "#FF4B3E" },
  { label: "Secure", icon: ShieldCheck, color: "#22D386" },
  { label: "Connect", icon: UsersRound, color: "#6426FF" },
];

// Reuses the same brand blue already used for the "Chat" feature icon,
// so no new colors are introduced — just applied to the hero backdrop.
const BRAND_BLUE = features[0].color;

export default function WelcomeScreen() {
  const { colors, isDark } = useAppTheme();
  const { width, height } = useWindowDimensions();

  const compact = height < 720;
  const background = isDark ? "#071633" : "#FFFFFF";
  const logoSize = Math.min(width * 0.56, compact ? 190 : 220);
  const haloSize = logoSize * 1.9;

  const logoOpacity = React.useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = React.useRef(
    new Animated.Value(0.88),
  ).current;

  const contentOpacity = React.useRef(
    new Animated.Value(0),
  ).current;

  const contentTranslateY = React.useRef(
    new Animated.Value(24),
  ).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 14,
          stiffness: 130,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          damping: 16,
          stiffness: 145,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    logoOpacity,
    logoScale,
    contentOpacity,
    contentTranslateY,
  ]);

  React.useEffect(() => {
    async function configureSystemBars() {
      if (Platform.OS !== "android") return;

      const nav = NavigationBar as any;

      try {
        if (nav.setPositionAsync) {
          await nav.setPositionAsync("absolute");
        }

        if (nav.setBackgroundColorAsync) {
          await nav.setBackgroundColorAsync("transparent");
        }

        if (nav.setButtonStyleAsync) {
          await nav.setButtonStyleAsync(isDark ? "light" : "dark");
        }

        if (nav.setBehaviorAsync) {
          await nav.setBehaviorAsync("overlay-swipe");
        }
      } catch {}
    }

    void configureSystemBars();
  }, [isDark]);

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Hero backdrop: radial-style blue glow fading into the base background,
          built from the same brand blue already used for the "Chat" feature. */}
      <LinearGradient
        colors={
          isDark
            ? ["#071633", "#10244D", "#071633"]
            : [BRAND_BLUE, BRAND_BLUE, "#FFFFFF"]
        }
        locations={isDark ? [0, 0.52, 1] : [0, 0.3, 0.62]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.heroArea,
            { height: compact ? height * 0.42 : height * 0.46 },
          ]}
        >
          <View
            style={[
              styles.halo,
              {
                width: haloSize,
                height: haloSize,
                borderRadius: haloSize / 2,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.22)",
              },
            ]}
          />
          <View
            style={[
              styles.haloInner,
              {
                width: haloSize * 0.66,
                height: haloSize * 0.66,
                borderRadius: (haloSize * 0.66) / 2,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.32)",
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoWrap,
              {
                width: logoSize,
                height: logoSize,
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require("@/assets/images/telefya-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.lowerArea,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <View style={styles.brandCopy}>
            <View style={styles.featureRow}>
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <View key={item.label} style={styles.featureItem}>
                    <Icon color={item.color} size={compact ? 19 : 22} />

                    <AppText
                      numberOfLines={1}
                      style={[styles.featureLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </AppText>

                    {index < features.length - 1 ? (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>

            <AppText style={styles.tagline}>
              <AppText style={styles.blue}>O N E </AppText>
              <AppText style={styles.purple}> A P P. </AppText>
              <AppText style={styles.red}> A L L </AppText>
              <AppText style={styles.green}> C O N N E C T I O N S.</AppText>
            </AppText>
          </View>

          <View style={styles.copy}>
            <AppText
              variant="display"
              style={[styles.heading, { color: colors.text }]}
            >
              Your meeting workspace
            </AppText>

            <AppText
              variant="body"
              style={[styles.subtitle, { color: colors.textMuted }]}
            >
              Chat, meet, secure conversations, and connect with people from one
              polished workspace.
            </AppText>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Create account"
              accessibilityLabel="Create a Telefya account"
              onPress={() => router.push("/auth/register")}
              style={[
                styles.primaryButton,
                {
                  shadowColor: BRAND_BLUE,
                },
              ]}
            />

            <AppButton
              title="Sign in"
              accessibilityLabel="Sign in to Telefya"
              variant="secondary"
              onPress={() => router.push("/auth/login")}
              style={styles.secondaryButton}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  heroArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    alignSelf: "center",
  },
  haloInner: {
    position: "absolute",
    alignSelf: "center",
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  lowerArea: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingBottom: Platform.OS === "android" ? Spacing.six : Spacing.five,
    justifyContent: "space-between",
    gap: Spacing.four,
  },
  brandCopy: {
    alignItems: "center",
    gap: Spacing.three,
  },
  featureRow: {
    width: "100%",
    maxWidth: 460,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  featureItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  divider: {
    position: "absolute",
    right: 0,
    width: StyleSheet.hairlineWidth,
    height: 26,
  },
  tagline: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  blue: {
    color: "#0F6BFF",
  },
  red: {
    color: "#FF4B3E",
  },
  green: {
    color: "#22D386",
  },
  purple: {
    color: "#6426FF",
  },
  copy: {
    alignItems: "center",
    gap: Spacing.two,
  },
  heading: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 380,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    width: "100%",
    gap: Spacing.three,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 999,
  },
});