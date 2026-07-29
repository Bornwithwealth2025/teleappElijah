// app layout
import "@/styles/global.css";

import React, { useEffect, useLayoutEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { Platform, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FeedbackProvider } from "@/contexts/feedback-context";
import { ThemeModeProvider } from "@/contexts/theme-mode-context";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

async function applySystemBars(
  backgroundColor: string,
  isDark: boolean,
) {
  try {
    await SystemUI.setBackgroundColorAsync(backgroundColor);
  } catch {}

  if (Platform.OS !== "android") return;

  try {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setBarStyle(
      isDark ? "light-content" : "dark-content",
    );

    const navigationBar = NavigationBar as any;

    await navigationBar.setPositionAsync?.("relative");
    await navigationBar.setBackgroundColorAsync?.(backgroundColor);
    await navigationBar.setButtonStyleAsync?.(
      isDark ? "light" : "dark",
    );
  } catch {}
}

function AppNavigator() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const { mode, colors, isDark } = useAppTheme();

  useLayoutEffect(() => {
    void applySystemBars(colors.background, isDark);
  }, [colors.background, isDark]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void applySystemBars(colors.background, isDark);
    }, 250);

    return () => clearTimeout(timer);
  }, [colors.background, isDark]);

  const baseTheme =
    mode === "dark" ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeModeProvider>
          <FeedbackProvider>
            <AppNavigator />
          </FeedbackProvider>
        </ThemeModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});