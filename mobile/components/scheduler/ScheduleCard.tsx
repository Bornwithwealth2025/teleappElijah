import React from "react";
import {
  CalendarDays,
  Copy,
  Play,
  Share2,
  UserPlus,
  UsersRound,
} from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
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
  onDelete?: () => void;
};

function UtilityAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.utility,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon}
      <AppText style={[styles.utilityText, { color: colors.text }]}>
        {label}
      </AppText>
    </Pressable>
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
}: ScheduleCardProps) {
  const { colors } = useAppTheme();
  const safeGuests = Math.max(0, Number(guests) || 0);
  const isLive = status === "live";

  return (
    <AppCard elevated style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.dateBlock,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}28`,
            },
          ]}
        >
          <CalendarDays color={colors.primary} size={18} />
          <AppText style={[styles.dateText, { color: colors.primary }]}>
            {date}
          </AppText>
          <AppText variant="caption" style={{ color: colors.primary }}>
            {time}
          </AppText>
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {title}
            </AppText>

            {isLive ? (
              <View
                style={[
                  styles.livePill,
                  { backgroundColor: `${colors.success}18` },
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <AppText style={[styles.liveText, { color: colors.success }]}>
                  LIVE
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <UsersRound color={colors.textSoft} size={14} />
            <AppText variant="caption" tone="muted">
              {safeGuests} invited
            </AppText>
          </View>
        </View>
      </View>

      <AppButton
        title={isLive ? "Open live meeting" : "Start meeting"}
        variant="gradient"
        size="md"
        leftIcon={<Play color="#FFFFFF" size={17} fill="#FFFFFF" />}
        onPress={onStart}
      />

      <View style={styles.utilities}>
        <UtilityAction
          icon={<Copy color={colors.primary} size={16} />}
          label="Copy link"
          onPress={onCopy}
        />

        <UtilityAction
          icon={<Share2 color={colors.secondary} size={16} />}
          label="Share"
          onPress={onShare}
        />

        <UtilityAction
          icon={<UserPlus color={colors.accent} size={16} />}
          label="Invite"
          onPress={onInvite}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  dateBlock: {
    width: 74,
    minHeight: 70,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dateText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  livePill: {
    minHeight: 22,
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
  liveText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  utilities: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  utility: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  utilityText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
});