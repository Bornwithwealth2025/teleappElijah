// app/_layout.tsx
import "@/styles/global.css";

import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";

import { FeedbackProvider } from "@/contexts/feedback-context";
import { ThemeModeProvider } from "@/contexts/theme-mode-context";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

function AppNavigator() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const { mode, colors } = useAppTheme();

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

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