import React, { useRef } from "react";
import { router, Redirect, Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarDays,
  Home,
  Plus,
  UserRound,
  Video,
} from "lucide-react-native";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SCREEN, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function QuietTabButton({
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: any) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 32,
      bounciness: 2,
    }).start();
  }

  return (
    <AnimatedPressable
      {...props}
      android_ripple={{ color: "transparent" }}
      onPressIn={(event) => {
        animate(0.96);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

function QuickCreateButton() {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  function animate(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 3,
    }).start();
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Create a meeting"
      android_ripple={{ color: "transparent" }}
      onPress={() => router.push("/(tabs)/create")}
      onPressIn={() => animate(0.92)}
      onPressOut={() => animate(1)}
      style={[
        styles.quickCreateWrap,
        { transform: [{ scale }] },
      ]}
    >
      <View
        style={[
          styles.quickCreateRing,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <LinearGradient
          colors={["#7B1CFF", "#0F6BFF", "#12D8B0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.quickCreateButton}
        >
          <Plus color="#FFFFFF" size={25} strokeWidth={2.7} />
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
}

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

  const iconSize = SCREEN.isSmallWidth ? 19 : 20;
  const tabBarHeight = 72 + insets.bottom;

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
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarButton: (props) => <QuietTabButton {...props} />,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBarHeight,
          paddingTop: Spacing.two,
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          paddingHorizontal: Spacing.two,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: colors.card,
          shadowColor: "#020817",
          shadowOpacity: 0.22,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -5 },
          elevation: 14,
        },
        tabBarItemStyle: {
          minHeight: 52,
          borderRadius: 14,
          paddingTop: 0,
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
        name="create"
        options={{
          title: "",
          tabBarButton: () => <QuickCreateButton />,
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

  quickCreateWrap: {
    width: 64,
    height: 72,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -12,
  },

  quickCreateRing: {
    width: 58,
    height: 58,
    padding: 3,
    borderRadius: 29,
    borderWidth: 2,
    shadowColor: "#0F6BFF",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },

  quickCreateButton: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});