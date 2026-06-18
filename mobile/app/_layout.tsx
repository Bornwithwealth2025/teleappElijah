import "@/styles/global.css";

import React, { useEffect, useLayoutEffect } from "react";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, StatusBar } from "react-native";

import { FeedbackProvider } from "@/contexts/feedback-context";
import { ThemeModeProvider } from "@/contexts/theme-mode-context";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

const FALLBACK_DARK_BACKGROUND = "#070A12";
const FALLBACK_LIGHT_BACKGROUND = "#FFFFFF";

async function applySystemBars(backgroundColor: string, isDark: boolean) {
  if (Platform.OS !== "android") return;

  const nav = NavigationBar as any;

  try {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");

    if (nav.setPositionAsync) {
      await nav.setPositionAsync("relative");
    }

    if (nav.setBackgroundColorAsync) {
      await nav.setBackgroundColorAsync(backgroundColor);
    }

    if (nav.setButtonStyleAsync) {
      await nav.setButtonStyleAsync(isDark ? "light" : "dark");
    }
  } catch {}
}

function AppNavigator() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const { mode, colors, isDark } = useAppTheme();

  useLayoutEffect(() => {
    void applySystemBars(
      isDark ? FALLBACK_DARK_BACKGROUND : FALLBACK_LIGHT_BACKGROUND,
      isDark,
    );
  }, [isDark]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    void applySystemBars(colors.background, isDark);

    const timer = setTimeout(() => {
      void applySystemBars(colors.background, isDark);
    }, 350);

    return () => clearTimeout(timer);
  }, [colors.background, isDark]);

  const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme;

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
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <Stack
        screenOptions={{
          headerShown: false,
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
    <ThemeModeProvider>
      <FeedbackProvider>
        <AppNavigator />
      </FeedbackProvider>
    </ThemeModeProvider>
  );
}