import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Layout } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  immersive?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaStyle?: StyleProp<ViewStyle>;
  tone?: "aurora" | "plain";
} & Pick<
  ScrollViewProps,
  | "keyboardShouldPersistTaps"
  | "keyboardDismissMode"
  | "refreshControl"
>;

export function AppScreen({
  children,
  scroll = true,
  immersive = false,
  contentStyle,
  safeAreaStyle,
  tone = "plain",
  keyboardShouldPersistTaps = "always",
  keyboardDismissMode = "none",
  refreshControl,
}: AppScreenProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const topInset =
    Platform.OS === "android"
      ? StatusBar.currentHeight ?? insets.top
      : insets.top;

  const contentInsets = immersive
    ? {
        paddingTop: topInset,
        paddingBottom: insets.bottom,
      }
    : {
        paddingTop: topInset + Layout.screenTopPadding,
        paddingBottom: insets.bottom + Layout.screenBottomPadding,
      };

  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
      contentContainerStyle={[
        styles.content,
        immersive && styles.immersiveContent,
        contentInsets,
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        styles.staticContent,
        immersive && styles.immersiveContent,
        contentInsets,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const background =
    tone === "plain" ? (
      <View
        style={[
          styles.background,
          { backgroundColor: colors.background },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios" ? "padding" : "height"
          }
        >
          {content}
        </KeyboardAvoidingView>
      </View>
    ) : (
      <LinearGradient
        colors={[colors.primarySoft, colors.background]}
        locations={[0, 0.35]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios" ? "padding" : "height"
          }
        >
          {content}
        </KeyboardAvoidingView>
      </LinearGradient>
    );

  return (
    <View style={[styles.root, safeAreaStyle]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {background}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },

  background: {
    flex: 1,
    width: "100%",
  },

  keyboard: {
    flex: 1,
    width: "100%",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  content: {
    width: "100%",
    maxWidth: Layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    gap: Layout.compactGap,
  },

  immersiveContent: {
    flex: 1,
    maxWidth: undefined,
    paddingHorizontal: 0,
    gap: 0,
  },

  staticContent: {
    flex: 1,
  },
});