import React, { useRef } from "react";
import { router, Redirect, Tabs } from "expo-router";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
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

import { Radius, SCREEN, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

type QuietTabButtonProps = Omit<
  BottomTabBarButtonProps,
  "pressColor" | "pressOpacity" | "hoverEffect"
> & {
  pressColor?: ColorValue;
  pressOpacity?: number;
  hoverEffect?: unknown;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function QuietTabButton({
  children,
  style,
  onPressIn,
  onPressOut,
  pressColor: _pressColor,
  pressOpacity: _pressOpacity,
  hoverEffect: _hoverEffect,
  ...props
}: QuietTabButtonProps) {
  const { colors } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const focused = Boolean(
    (props as { accessibilityState?: { selected?: boolean } })
      .accessibilityState?.selected,
  );

  function animate(toValue: number, toOpacity: number) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        stiffness: 280,
        damping: 22,
        mass: 0.7,
      }),
      Animated.timing(opacity, {
        toValue: toOpacity,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <AnimatedPressable
      {...(props as React.ComponentProps<typeof Pressable>)}
      android_ripple={{ color: "transparent" }}
      onPressIn={(event) => {
        animate(0.96, 0.78);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1, 1);
        onPressOut?.(event);
      }}
      style={[
        style,
        styles.tabPressable,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.tabInner,
          focused && {
            backgroundColor: `${colors.primary}22`,
            borderColor: `${colors.primary}44`,
          },
        ]}
      >
        {children}
      </View>
    </AnimatedPressable>
  );
}

function QuickCreateButton() {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  function animate(active: boolean) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: active ? 0.92 : 1,
        useNativeDriver: true,
        stiffness: 300,
        damping: 20,
        mass: 0.7,
      }),
      Animated.spring(lift, {
        toValue: active ? 2 : 0,
        useNativeDriver: true,
        stiffness: 300,
        damping: 20,
        mass: 0.7,
      }),
    ]).start();
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Create a meeting"
      android_ripple={{ color: "transparent" }}
      onPress={() => router.push("/(tabs)/create")}
      onPressIn={() => animate(true)}
      onPressOut={() => animate(false)}
      style={[
        styles.quickCreateWrap,
        {
          transform: [{ translateY: lift }, { scale }],
        },
      ]}
    >
      <View style={styles.quickCreateGlow}>
        <View style={styles.quickCreateOuterRing}>
          <LinearGradient
            colors={["#7B1CFF", "#0F6BFF", "#12D8B0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickCreateButton}
          >
            <View style={styles.quickCreateHighlight} />
            <Plus color="#FFFFFF" size={28} strokeWidth={2.7} />
          </LinearGradient>
        </View>
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

  const iconSize = SCREEN.isSmallWidth ? 20 : 22;
  const dockBottom = Math.max(insets.bottom, Spacing.two);
  const tabBarHeight = 72;

  const renderTabIcon = (
    Icon: React.ComponentType<any>,
    focused: boolean,
    color: ColorValue,
  ) => (
    <View style={styles.iconWrap}>
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
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarButton: (props) => <QuietTabButton {...props} />,
        tabBarBackground: () => (
          <View style={styles.dockShell}>
            <LinearGradient
              colors={[
                "rgba(8, 32, 68, 0.98)",
                "rgba(2, 16, 40, 0.99)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dockGradient}
            />
            <View style={styles.dockHighlight} />
          </View>
        ),
        tabBarStyle: {
          position: "absolute",
          left: Spacing.three,
          right: Spacing.three,
          bottom: dockBottom,
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: Spacing.two,
          overflow: "visible",
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: "rgba(125, 168, 255, 0.22)",
          borderRadius: Radius.xLarge,
          backgroundColor: "transparent",
          shadowColor: "#020817",
          shadowOpacity: 0.42,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 18,
        },
        tabBarItemStyle: {
          height: tabBarHeight - 2,
          paddingVertical: 8,
          paddingHorizontal: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: "800",
          marginTop: 2,
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
  dockShell: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.xLarge,
    overflow: "hidden",
  },

  dockGradient: {
    ...StyleSheet.absoluteFill,
  },

  dockHighlight: {
    position: "absolute",
    top: 0,
    left: 32,
    right: 32,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },

  tabPressable: {
    borderRadius: Radius.large,
  },

  tabInner: {
    flex: 1,
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrap: {
    width: 38,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  quickCreateWrap: {
    width: 78,
    height: 84,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -28,
  },

  quickCreateGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    shadowColor: "#0F6BFF",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  quickCreateOuterRing: {
    width: 68,
    height: 68,
    padding: 4,
    borderRadius: 34,
    backgroundColor: "#061A3A",
    borderWidth: 1,
    borderColor: "rgba(181, 210, 255, 0.55)",
  },

  quickCreateButton: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  quickCreateHighlight: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});