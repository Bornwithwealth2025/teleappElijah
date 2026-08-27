import React from "react";
import { StyleSheet, View, type ColorValue } from "react-native";
import { Redirect, Tabs } from "expo-router";
import {
  CalendarDays,
  Home,
  UserRound,
  Video,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SCREEN,
  Spacing,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isHydrated = useAuthStore(
    (state) => state.isHydrated,
  );

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  const iconSize = SCREEN.isSmallWidth ? 19 : 21;
  const tabBarHeight = 64 + insets.bottom;

  const renderTabIcon = (
    Icon: React.ComponentType<any>,
    focused: boolean,
    color: ColorValue,
  ) => (
    <View
      style={[
        styles.iconWrap,
        focused && {
          backgroundColor: colors.primarySoft,
        },
      ]}
    >
      <Icon
        color={color}
        size={iconSize}
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBarHeight,
          paddingTop: Spacing.one,
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          paddingHorizontal: Spacing.two,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.card,
          shadowColor: "#071633",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: {
            width: 0,
            height: -5,
          },
          elevation: 14,
        },
        tabBarItemStyle: {
          minHeight: 52,
          borderRadius: 16,
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 12,
          fontWeight: "700",
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(Home, focused, color),
        }}
      />

      <Tabs.Screen
        name="meetings"
        options={{
          title: "Meetings",
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(Video, focused, color),
        }}
      />

      <Tabs.Screen
        name="scheduler"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(CalendarDays, focused, color),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(UserRound, focused, color),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 34,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});