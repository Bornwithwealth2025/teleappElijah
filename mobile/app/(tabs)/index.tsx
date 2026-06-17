// (tabs) index.tsx
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { UserRound } from "lucide-react-native";

import { MeetingActionPanel } from "@/components/meeting/MeetingActionPanel";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { SCREEN, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

const upcomingMeetings = [
  {
    id: "telefya-product-sync",
    title: "Product Sync",
    time: "Today, 3:00 PM",
    participants: 8,
    status: "scheduled" as const,
  },
  {
    id: "telefya-investor-call",
    title: "Investor Call",
    time: "Tomorrow, 10:30 AM",
    participants: 5,
    status: "scheduled" as const,
  },
];

export default function HomeScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        leftSlot={<TelifierLogo size={SCREEN.isSmallWidth ? "sm" : "md"} />}
        eyebrow="MEETING WORKSPACE"
        title="Meetings that move fast."
        subtitle="Plan, start, and share secure meeting rooms from one clean workspace."
        rightSlot={
          <>
            <ThemeToggle />
            <IconButton
              icon={<UserRound color={colors.primary} size={18} />}
              variant="soft"
              size={SCREEN.isSmallWidth ? 40 : 44}
              onPress={() => router.push("/(tabs)/profile")}
            />
          </>
        }
      />

      <MeetingActionPanel />

      <SectionHeader
        title="Upcoming"
        rightSlot={
          <Pressable onPress={() => router.push("/(tabs)/meetings")}>
            <AppText variant="bodyStrong" tone="primary">
              View all
            </AppText>
          </Pressable>
        }
      />

      <View style={styles.meetingList}>
        {upcomingMeetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            id={meeting.id}
            title={meeting.title}
            time={meeting.time}
            participants={meeting.participants}
            status={meeting.status}
          />
        ))}
      </View>

      <Pressable onPress={() => router.push("/(tabs)/scheduler")}>
        <AppCard compact style={{ backgroundColor: colors.surface }}>
          <AppText variant="bodyStrong">Create meetup link</AppText>
          <AppText variant="caption" tone="muted" style={styles.linkCopy}>
            Generate a Telefya room and share it with anyone.
          </AppText>
        </AppCard>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SCREEN.isShortHeight ? Spacing.three : Spacing.five,
  },
  meetingList: {
    gap: Spacing.three,
  },
  linkCopy: {
    marginTop: Spacing.one,
  },
});