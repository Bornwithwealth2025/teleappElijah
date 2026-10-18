import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarDays,
  CalendarPlus,
  Copy,
  Play,
  Share2,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Tap } from "@/components/ui/Tap";
import { TelefyaGradients } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type ScheduleCardProps = {
  title: string;
  date: string;
  time: string;
  guests: number;
  status?: string;
  onStart: () => void;
  onCopy: () => void;
  onShare: () => void;
  onInvite: () => void;
  onAddToCalendar: () => void;
  onDelete?: () => void;
};

function ActionTab({
  icon,
  label,
  onPress,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "accent";
}) {
  const { colors, isDark } = useAppTheme();

  const iconColor =
    tone === "secondary"
      ? colors.secondary
      : tone === "accent"
        ? colors.accent
        : colors.primary;

  return (
    <Tap label={label} onPress={onPress} style={styles.actionPressable}>
      <View
        style={[
          styles.actionTab,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.045)"
              : colors.surface,
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.actionIcon,
            { backgroundColor: `${iconColor}22` },
          ]}
        >
          {icon}
        </View>

        <AppText
          numberOfLines={1}
          style={[styles.actionLabel, { color: colors.text }]}
        >
          {label}
        </AppText>
      </View>
    </Tap>
  );
}

export function ScheduleCard({
  title,
  date,
  time,
  guests,
  status,
  onStart,
  onCopy,
  onShare,
  onInvite,
  onAddToCalendar,
  onDelete,
}: ScheduleCardProps) {
  const { colors } = useAppTheme();

  const safeGuests = Math.max(0, Number(guests) || 0);
  const isLive = status === "live";

  return (
    <AppCard elevated style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dateBlock, { backgroundColor: colors.primary }]}>
          <CalendarDays color="#FFFFFF" size={19} />

          <AppText style={styles.dateText}>{date}</AppText>

          <AppText style={styles.timeText}>{time}</AppText>
        </View>

        <View style={styles.copy}>
          <AppText
            numberOfLines={2}
            style={[styles.title, { color: colors.text }]}
          >
            {title}
          </AppText>

          <View style={styles.metaRow}>
            <UsersRound color={colors.textSoft} size={15} />
            <AppText style={[styles.meta, { color: colors.textMuted }]}>
              {safeGuests} invited
            </AppText>
          </View>
        </View>

        {isLive ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <AppText style={styles.liveText}>LIVE</AppText>
          </View>
        ) : null}
      </View>

      <Tap
        label={isLive ? "Open live meeting" : "Start meeting"}
        onPress={onStart}
        style={styles.fullWidth}
      >
        <LinearGradient
          colors={TelefyaGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButton}
        >
          <Play color="#FFFFFF" size={17} fill="#FFFFFF" />

          <AppText style={styles.startText}>
            {isLive ? "Open live meeting" : "Start meeting"}
          </AppText>
        </LinearGradient>
      </Tap>

      <View style={styles.actionGrid}>
        <ActionTab
          icon={<CalendarPlus color={colors.primary} size={18} />}
          label="Calendar"
          onPress={onAddToCalendar}
        />

        <ActionTab
          icon={<UserPlus color={colors.accent} size={18} />}
          label="Invite"
          tone="accent"
          onPress={onInvite}
        />

        <ActionTab
          icon={<Copy color={colors.primary} size={18} />}
          label="Copy link"
          onPress={onCopy}
        />

        <ActionTab
          icon={<Share2 color={colors.secondary} size={18} />}
          label="Share"
          tone="secondary"
          onPress={onShare}
        />
      </View>

      {onDelete ? (
        <Tap
          label="Cancel scheduled meeting"
          onPress={onDelete}
          style={styles.cancelPressable}
        >
          <View style={styles.cancelAction}>
            <Trash2 color={colors.danger} size={15} />
            <AppText style={[styles.cancelText, { color: colors.danger }]}>
              Cancel meeting
            </AppText>
          </View>
        </Tap>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  fullWidth: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  dateBlock: {
    width: 78,
    minHeight: 76,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  timeText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  livePill: {
    height: 30,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(18,216,176,0.14)",
    borderWidth: 1,
    borderColor: "rgba(18,216,176,0.42)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
  },
  liveText: {
    color: "#12D8B0",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  startButton: {
    width: "100%",
    height: 54,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  actionGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.two,
  },
  actionPressable: {
    width: "48.5%",
  },
  actionTab: {
    height: 54,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  cancelPressable: {
    alignSelf: "center",
  },
  cancelAction: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cancelText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
});