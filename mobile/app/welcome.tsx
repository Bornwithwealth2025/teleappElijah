import React from "react";
import { router } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, LogIn, Sparkles, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

const GLOBE_IMAGE_LIGHT = require("@/assets/images/telefya-globe.png");
const GLOBE_IMAGE_DARK = require("@/assets/images/telefya-globe-dark.png");
const GLOBE_ASPECT_RATIO = 785 / 660;

const HIGHLIGHT = { dark: "#5EEAD4", light: "#0D9488" };
const LINK_COLOR = { dark: "#60A5FA", light: "#2563EB" };

const BRAND_LETTERS = [
  { char: "T", color: "#0B62FB" },
  { char: "e", color: "#0B62FB" },
  { char: "l", color: "#FE5C43" },
  { char: "e", color: "#FFA500" },
  { char: "f", color: "#24D68D" },
  { char: "y", color: "#6C4FE0" },
  { char: "a", color: "#7B1CFF" },
];

const HERO_ANIMATION_DURATION = 440;
const BODY_ANIMATION_DURATION = 300;
const BREATHE_DURATION = 3400;

export default function WelcomeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const compact = height < 720;
  const heroWidth = Math.min(width * 0.92, compact ? 300 : 360);
  const heroHeight = heroWidth / GLOBE_ASPECT_RATIO;

  const [reduceMotion, setReduceMotion] = React.useState(false);

  const heroOpacity = React.useRef(new Animated.Value(0)).current;
  const heroScale = React.useRef(new Animated.Value(0.92)).current;
  const bodyOpacity = React.useRef(new Animated.Value(0)).current;
  const bodyTranslateY = React.useRef(new Animated.Value(18)).current;
  const breathe = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (reduceMotion) {
      heroOpacity.setValue(1);
      heroScale.setValue(1);
      bodyOpacity.setValue(1);
      bodyTranslateY.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: HERO_ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(heroScale, {
          toValue: 1,
          damping: 16,
          stiffness: 130,
          mass: 0.85,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bodyOpacity, {
          toValue: 1,
          duration: BODY_ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(bodyTranslateY, {
          toValue: 0,
          damping: 16,
          stiffness: 145,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [bodyOpacity, bodyTranslateY, heroOpacity, heroScale, reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.018,
          duration: BREATHE_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: BREATHE_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [breathe, reduceMotion]);

  React.useEffect(() => {
    async function configureSystemBars() {
      if (Platform.OS !== "android") return;

      try {
        const navigationBar = NavigationBar as any;
        await navigationBar.setPositionAsync?.("absolute");
        await navigationBar.setBackgroundColorAsync?.("transparent");
        await navigationBar.setButtonStyleAsync?.(isDark ? "light" : "dark");
        await navigationBar.setBehaviorAsync?.("overlay-swipe");
      } catch {}
    }

    void configureSystemBars();
  }, [isDark]);

  const highlight = isDark ? HIGHLIGHT.dark : HIGHLIGHT.light;
  const linkColor = isDark ? LINK_COLOR.dark : LINK_COLOR.light;
  const globeImage = isDark ? GLOBE_IMAGE_DARK : GLOBE_IMAGE_LIGHT;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + Spacing.two, Spacing.four),
            paddingBottom: Math.max(insets.bottom + Spacing.two, Spacing.four),
          },
        ]}
      >
        <View style={styles.topArea}>
          <Image
            source={require("@/assets/images/telefya-logo.png")}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Telefya"
            style={styles.logo}
          />
        </View>

        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.hero,
              {
                width: heroWidth,
                height: heroHeight,
                opacity: heroOpacity,
                transform: [{ scale: heroScale }, { scale: breathe }],
              },
            ]}
          >
            <Image
              source={globeImage}
              resizeMode="contain"
              style={styles.globeImage}
              accessibilityRole="image"
              accessibilityLabel="Telefya's global network of connected users"
            />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.bottomContent,
            { opacity: bodyOpacity, transform: [{ translateY: bodyTranslateY }] },
          ]}
        >
          <View
            style={[
              styles.connectionPill,
              {
                backgroundColor: isDark
                  ? "rgba(5, 17, 40, 0.78)"
                  : "rgba(255, 255, 255, 0.88)",
                borderColor: isDark
                  ? "rgba(22, 119, 255, 0.58)"
                  : "rgba(22, 119, 255, 0.42)",
              },
            ]}
          >
            <Sparkles color={colors.primary} size={15} />

            <AppText style={styles.connectionText}>
              <AppText
                style={[
                  styles.connectionText,
                  { color: isDark ? "#FFFFFF" : "#15213D" },
                ]}
              >
                ONE APP.{" "}
              </AppText>

              <AppText style={[styles.connectionText, styles.allText]}>
                ALL{" "}
              </AppText>

              <AppText style={[styles.connectionText, styles.connectionsText]}>
                CONNECTIONS.
              </AppText>
            </AppText>
          </View>

          <View style={styles.copy}>
            <AppText
              variant="display"
              style={[
                styles.title,
                {
                  color: isDark ? "#FFFFFF" : "#071633",
                },
              ]}
            >
              Welcome to{" "}
              {BRAND_LETTERS.map((letter, index) => (
                <AppText
                  key={index}
                  variant="display"
                  style={[styles.telefyaWord, { color: letter.color }]}
                >
                  {letter.char}
                </AppText>
              ))}
            </AppText>

            <AppText
              variant="body"
              style={[
                styles.subtitle,
                {
                  color: isDark
                    ? "rgba(224, 232, 250, 0.68)"
                    : colors.textMuted,
                },
              ]}
            >
              High-quality meetings. Crystal-clear voice.{"\n"}
              Instant collaboration.
            </AppText>
          </View>

          <View style={styles.actions}>
            {/* Shadow lives on this OUTER view (no overflow:hidden here).
               On Android, putting elevation + overflow:"hidden" on the
               SAME view clips/collapses the children (that's what was
               happening — buttons rendering as a thin sliver). Splitting
               the shadow wrapper from the clipped gradient wrapper fixes it. */}
            <View style={styles.createButtonShadow}>
              <LinearGradient
                colors={["#7B1CFF", "#0F6BFF", "#12D8B0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButton}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Create a Telefya account"
                  onPress={() => router.push("/auth/register")}
                  style={({ pressed }) => [
                    styles.welcomeButtonPressable,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <View style={styles.welcomeButtonContent}>
                    <View style={styles.buttonIconSlot}>
                      <Users color="#FFFFFF" size={20} strokeWidth={2} />
                    </View>

                    <AppText style={styles.createButtonText}>
                      Create Account
                    </AppText>

                    <View style={styles.buttonIconSlot}>
                      <ArrowRight color="#FFFFFF" size={20} strokeWidth={2} />
                    </View>
                  </View>
                </Pressable>
              </LinearGradient>
            </View>

            {/* Gradient border, done as stacked absolute-fill layers instead of
               the padding trick: gradient paints the full rect, a solid
               "colors.background" layer sits on top inset by the border
               width (so it always matches the page and reads as
               transparent), and the pressable/content sit on top of that.
               This can't ever show the gradient bleeding through the middle. */}
            <View style={styles.signInBorderWrap}>
              <LinearGradient
                colors={["#8B22FF", "#0F6BFF", "#12D8B0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />

              <View
                pointerEvents="none"
                style={[
                  styles.signInInnerFill,
                  { backgroundColor: colors.background },
                ]}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in to Telefya"
                onPress={() => router.push("/auth/login")}
                style={({ pressed }) => [
                  styles.signInPressable,
                  pressed && styles.buttonPressed,
                ]}
              >
                <View style={styles.welcomeButtonContent}>
                  <View style={styles.buttonIconSlot}>
                    <LogIn color={isDark ? "#FFFFFF" : "#071633"} size={20} strokeWidth={2} />
                  </View>

                  <AppText
                    style={[
                      styles.signInButtonText,
                      { color: isDark ? "#FFFFFF" : "#071633" },
                    ]}
                  >
                    Sign In
                  </AppText>

                  <View style={styles.buttonIconSlot}>
                    <ArrowRight
                      color={isDark ? "#FFFFFF" : "#071633"}
                      size={20}
                      strokeWidth={2}
                    />
                  </View>
                </View>
              </Pressable>
            </View>
          </View>

          <AppText style={[styles.legal, { color: colors.textSoft }]}>
            By continuing, you agree to our{" "}
            <AppText style={[styles.legalLink, { color: linkColor }]}>
              Terms of Service
            </AppText>{" "}
            and{" "}
            <AppText style={[styles.legalLink, { color: linkColor }]}>
              Privacy Policy
            </AppText>
            .
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  topArea: { minHeight: 52, alignItems: "center", justifyContent: "center" },
  logo: { width: 168, height: 54 },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  hero: { alignItems: "center", justifyContent: "center" },
  globeImage: { width: "100%", height: "100%" },
  bottomContent: { width: "100%", alignItems: "center", gap: Spacing.three },
  connectionPill: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    marginTop: -Spacing.three,
  },

  connectionText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  allText: {
    color: "#12BFC6",
  },

  connectionsText: {
    color: "#386CFF",
  },

  copy: {
    width: "100%",
    alignItems: "center",
    marginTop: Spacing.four,
    gap: Spacing.two,
  },

  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },

  telefyaWord: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  actions: {
    width: "100%",
    gap: Spacing.three,
    marginTop: Spacing.three,
  },

  // Shadow lives here, on a plain view with NO overflow/borderRadius clipping.
  // (Android bug: elevation + overflow:"hidden" on the same view collapses
  // the children into a sliver — that was the "buttons not loading" issue.)
  createButtonShadow: {
    width: "100%",
    height: 62,
    borderRadius: Radius.medium,
    shadowColor: "#0F6BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 7,
  },

  createButton: {
    width: "100%",
    height: 62,
    borderRadius: Radius.medium,
    overflow: "hidden",
  },

  signInBorderWrap: {
    width: "100%",
    height: 62,
    borderRadius: Radius.medium,
    overflow: "hidden",
  },

  // Inset by the border width so the gradient behind it stays visible only
  // as a thin ring. Using colors.background (not a hardcoded white/black)
  // means it always matches the page and reads as "transparent".
  signInInnerFill: {
    position: "absolute",
    top: 1.5,
    left: 1.5,
    right: 1.5,
    bottom: 1.5,
    borderRadius: Radius.medium - 1.5,
  },

  signInPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
  },

  // height: "100%" instead of flex: 1 — explicit heights at every level
  // render reliably on Android; a flex chain through 3 nested views is
  // what was collapsing.
  welcomeButtonPressable: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.medium - 1.5,
    justifyContent: "center",
  },

  welcomeButtonContent: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },

  buttonIconSlot: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  createButtonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  signInButtonText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  buttonPressed: {
    opacity: 0.84,
  },

  legal: { maxWidth: 300, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: Spacing.one },
  legalLink: { fontSize: 10, lineHeight: 15, fontWeight: "700" },
});