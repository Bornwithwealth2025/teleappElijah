import { router } from "expo-router";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MessageCircle, ShieldCheck, UsersRound, Video } from "lucide-react-native";

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
  const logoSize = Math.min(width * 0.76, compact ? 270 : 340);

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#080B18" : "#FFFFFF" }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <LinearGradient
        colors={isDark ? ["#0A1024", "#111936", "#080B18"] : ["#FFFFFF", "#F8FBFF", "#FFFFFF"]}
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
                  <Icon color={item.color} size={compact ? 20 : 23} />
                  <AppText style={[styles.featureLabel, { color: colors.text }]}>
                    {item.label}
                  </AppText>
                  {index < features.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
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
          <AppText variant="display" style={[styles.heading, { color: colors.text }]}>
            Your meeting workspace
          </AppText>

          <AppText variant="body" style={[styles.subtitle, { color: colors.textMuted }]}>
            Chat, meet, secure conversations, and connect with people from one polished workspace.
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
    justifyContent: "space-between",
  },
  brandArea: {
    alignItems: "center",
    gap: Spacing.three,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  brandName: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: "900",
    textAlign: "center",
  },
  blue: {
    color: "#1274F6",
  },
  red: {
    color: "#FF3B3B",
  },
  yellow: {
    color: "#FFB51F",
  },
  green: {
    color: "#23C878",
  },
  purple: {
    color: "#6D35E8",
  },
  featureRow: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.one,
  },
  featureItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
    marginTop: Spacing.two,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  copy: {
    alignItems: "center",
    gap: Spacing.two,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 350,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.three,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 999,
  },
});