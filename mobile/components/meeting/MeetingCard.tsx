import { router } from "expo-router";
import { CalendarDays, Radio, RotateCcw } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ParticipantStack } from "./ParticipantStack";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, SCREEN, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type MeetingStatus = "live" | "scheduled" | "ended";

type MeetingCardProps = {
  id: string;
  title: string;
  time: string;
  participants: number;
  status: MeetingStatus;
};

export function MeetingCard({
  id,
  title,
  time,
  participants,
  status,
}: MeetingCardProps) {
  const { colors } = useAppTheme();

  const statusConfig = {
    live: {
      label: "Live",
      backgroundColor: colors.danger,
      color: "#FFFFFF",
      icon: <Radio color="#FFFFFF" size={13} />,
    },
    scheduled: {
      label: "Scheduled",
      backgroundColor: colors.primarySoft,
      color: colors.primary,
      icon: <CalendarDays color={colors.primary} size={13} />,
    },
    ended: {
      label: "Ended",
      backgroundColor: colors.surface,
      color: colors.textMuted,
      icon: <RotateCcw color={colors.textMuted} size={13} />,
    },
  }[status];

  function handlePress() {
    router.push(`/meeting/${id}`);
  }

  return (
    <TouchableOpacity activeOpacity={0.78} onPress={handlePress}>
      <AppCard elevated compact={SCREEN.isShortHeight} style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {title}
            </AppText>
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {time}
            </AppText>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.backgroundColor },
            ]}
          >
            {statusConfig.icon}
            <AppText
              variant="caption"
              numberOfLines={1}
              style={[styles.statusText, { color: statusConfig.color }]}
            >
              {statusConfig.label}
            </AppText>
          </View>
        </View>

        <ParticipantStack count={participants} />
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SCREEN.isShortHeight ? Spacing.three : Spacing.four,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  statusBadge: {
    minHeight: SCREEN.isSmallWidth ? 24 : 28,
    maxWidth: 116,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  statusText: {
    fontWeight: "800",
  },
});