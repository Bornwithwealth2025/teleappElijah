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

import { cn } from "@/lib/cn";
import { Layout } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  immersive?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaStyle?: StyleProp<ViewStyle>;
  className?: string;
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
  className,
  tone = "plain",
  keyboardShouldPersistTaps = "handled",
  keyboardDismissMode = "on-drag",
  refreshControl,
}: AppScreenProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const topInset =
    Platform.OS === "android"
      ? StatusBar.currentHeight ?? insets.top
      : insets.top;

  // Immersive meeting/video screens must reach edge-to-edge. Their overlays
  // position themselves using useSafeAreaInsets.
  const contentInsets = immersive
    ? {
        paddingTop: 0,
        paddingBottom: 0,
      }
    : {
        paddingTop: topInset + Layout.screenTopPadding,
        paddingBottom: insets.bottom + Layout.bottomTabInset,
      };

  const screenContent = scroll ? (
    <ScrollView
      className="flex-1 w-full"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
      contentContainerStyle={[
        styles.content,
        immersive && styles.immersiveContent,
        contentStyle,
        contentInsets,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className="flex-1 w-full"
      style={[
        styles.content,
        styles.staticContent,
        immersive && styles.immersiveContent,
        contentStyle,
        contentInsets,
      ]}
    >
      {children}
    </View>
  );

  const keyboardBehavior = immersive
    ? undefined
    : Platform.OS === "ios"
      ? "padding"
      : "height";

  const statusBarStyle = immersive
    ? "light-content"
    : isDark
      ? "light-content"
      : "dark-content";

  return (
    <View
      className={cn("flex-1 w-full", className)}
      style={[
        styles.root,
        { backgroundColor: colors.background },
        safeAreaStyle,
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      {tone === "aurora" ? (
        <LinearGradient
          colors={[
            colors.primarySoft,
            colors.background,
            colors.background,
          ]}
          locations={[0, 0.38, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            className="flex-1 w-full"
            behavior={keyboardBehavior}
          >
            {screenContent}
          </KeyboardAvoidingView>
        </LinearGradient>
      ) : (
        <KeyboardAvoidingView
          className="flex-1 w-full"
          behavior={keyboardBehavior}
        >
          {screenContent}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },

  gradient: {
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