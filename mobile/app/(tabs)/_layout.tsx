// tabs layout
import React from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
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
  verticalScale,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
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

  // A fixed bottom inset keeps the bar's gap from the edge consistent
  // across devices instead of letting a tiny safe-area collapse it.
  const bottomInset = Math.max(insets.bottom, Spacing.three);

  const renderTabIcon = (
    Icon: React.ComponentType<any>,
    focused: boolean,
    color: string,
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

        tabBarBackground: () => (
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={90}
            style={StyleSheet.absoluteFill}
          />
        ),

        tabBarStyle: {
          position: "absolute",
          left: Spacing.four,
          right: Spacing.four,
          bottom: bottomInset,
          height: SCREEN.isShortHeight
            ? verticalScale(66)
            : verticalScale(72),
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Spacing.two,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderRadius: 26,
          backgroundColor: colors.glass,
          overflow: "hidden",
          shadowColor: "#071633",
          shadowOpacity: isDark ? 0.22 : 0.1,
          shadowRadius: 22,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          elevation: 8,
        },

        tabBarItemStyle: {
          height: "100%",
          borderRadius: 20,
          marginHorizontal: 2,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 0,
          paddingBottom: 0,
        },

        tabBarIconStyle: {
          marginBottom: 0,
        },

        tabBarLabelStyle: {
          fontSize: SCREEN.isSmallWidth ? 10 : 11,
          lineHeight: 13,
          fontWeight: "700",
          marginTop: 3,
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

      {/* Registered with href:null so it doesn't appear as a tab.
          Nothing in the app currently navigates to it — confirm this
          file is still needed, or it can likely be removed. */}
      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});