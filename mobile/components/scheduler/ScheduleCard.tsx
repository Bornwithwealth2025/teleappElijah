import { Copy, Trash2 } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type ScheduleCardProps = {
  title: string;
  date: string;
  time: string;
  guests: number;
  onCopy?: () => void;
  onDelete?: () => void;
};

export function ScheduleCard({
  title,
  date,
  time,
  guests,
  onCopy,
  onDelete,
}: ScheduleCardProps) {
  const { colors } = useAppTheme();

  return (
    <AppCard elevated style={styles.card}>
      <View style={[styles.dateBlock, { backgroundColor: colors.primarySoft }]}>
        <AppText variant="label" tone="primary" numberOfLines={1}>
          {date}
        </AppText>
        <AppText
          variant="caption"
          tone="primary"
          style={styles.dateTime}
          numberOfLines={1}
        >
          {time}
        </AppText>
      </View>

      <View style={styles.copy}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {guests} guest{guests === 1 ? "" : "s"} invited
        </AppText>
      </View>

      <View style={styles.actions}>
        {onCopy ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onCopy}
            style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}
          >
            <Copy color={colors.primary} size={16} />
          </TouchableOpacity>
        ) : null}

        {onDelete ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onDelete}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <Trash2 color={colors.danger} size={16} />
          </TouchableOpacity>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  dateBlock: {
    width: 76,
    minHeight: 58,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  dateTime: {
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
});