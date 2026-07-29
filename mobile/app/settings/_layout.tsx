import React from "react";
import { Stack } from "expo-router";

import { useAppTheme } from "@/hooks/use-app-themes";

export default function SettingsLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 260,
        contentStyle: {
          backgroundColor: colors.background,
        },
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
        }}
      />

      <Stack.Screen
        name="account"
        options={{
          title: "Account settings",
        }}
      />

      <Stack.Screen
        name="meeting-default"
        options={{
          title: "Meeting defaults",
        }}
      />

      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />

      <Stack.Screen
        name="security"
        options={{
          title: "Security",
        }}
      />
    </Stack>
  );
}