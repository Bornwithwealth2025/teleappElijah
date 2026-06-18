import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as NavigationBar from "expo-navigation-bar";
import {
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
  { label: "Chat", icon: MessageCircle, color: "#1274F6" },
  { label: "Meet", icon: Video, color: "#FF3B3B" },
  { label: "Secure", icon: ShieldCheck, color: "#18B96E" },
  { label: "Connect", icon: UsersRound, color: "#6D35E8" },
];

export default function WelcomeScreen() {
  const { colors, isDark } = useAppTheme();
  const { width, height } = useWindowDimensions();

  const compact = height < 720;
  const background = isDark ? "#070A12" : "#FFFFFF";
  const logoSize = Math.min(width * 0.92, compact ? 310 : 410);

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
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={
          isDark
            ? ["#070A12", "#0E1320", "#070A12"]
            : ["#FFFFFF", "#F7FBFF", "#FFFFFF"]
        }
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.brandArea}>
          <View style={[styles.logoWrap, { width: logoSize, height: logoSize }]}>
            <Image
              source={require("@/assets/images/telefya.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

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

        <View style={styles.bottomArea}>
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
              onPress={() => router.push("/auth/register")}
              style={styles.primaryButton}
            />

            <AppButton
              title="Sign in"
              variant="secondary"
              onPress={() => router.push("/auth/login")}
              style={styles.secondaryButton}
            />
          </View>
        </View>
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
    paddingHorizontal: Spacing.four,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 0) + Spacing.two
        : Spacing.five,
    paddingBottom: Platform.OS === "android" ? Spacing.six : Spacing.five,
    justifyContent: "space-between",
  },
  brandArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -Spacing.three,
  },
  logo: {
    width: "100%",
    height: "100%",
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
    marginTop: Spacing.one,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  blue: {
    color: "#1274F6",
  },
  red: {
    color: "#FF3B3B",
  },
  green: {
    color: "#23C878",
  },
  purple: {
    color: "#6D35E8",
  },
  bottomArea: {
    width: "100%",
    gap: Spacing.four,
  },
  copy: {
    alignItems: "center",
    gap: Spacing.two,
  },
  heading: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
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
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 999,
  },
});