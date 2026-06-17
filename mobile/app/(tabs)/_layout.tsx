// (tabs) layout.tsx 
import { Redirect, Tabs } from "expo-router";
import useAuthStore from "@/store/authStore";
import { CalendarDays, Home, UserRound, Video } from "lucide-react-native";

import { SCREEN, Spacing, verticalScale } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  const iconSize = SCREEN.isSmallWidth ? 19 : 21;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: SCREEN.isShortHeight ? verticalScale(78) : verticalScale(82),
          paddingTop: Spacing.two,
          paddingBottom: SCREEN.isShortHeight ? Spacing.three : Spacing.four,
        },
        tabBarItemStyle: {
          minHeight: 58,
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarLabelStyle: {
          fontSize: SCREEN.isSmallWidth ? 11 : 12,
          lineHeight: 15,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={iconSize} />,
        }}
      />

      <Tabs.Screen
        name="meetings"
        options={{
          title: "Meetings",
          tabBarIcon: ({ color }) => <Video color={color} size={iconSize} />,
        }}
      />

      <Tabs.Screen
        name="scheduler"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <CalendarDays color={color} size={iconSize} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <UserRound color={color} size={iconSize} />
          ),
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
