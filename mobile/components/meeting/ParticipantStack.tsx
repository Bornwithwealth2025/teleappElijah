import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, SCREEN, scaleSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type ParticipantStackProps = {
  count: number;
  initials?: string[];
  label?: string;
  showLabel?: boolean;
};

export function ParticipantStack({
  count,
  initials = ["E", "A", "M"],
  label,
  showLabel = true,
}: ParticipantStackProps) {
  const { colors } = useAppTheme();

  const maxVisible = SCREEN.isSmallWidth ? 2 : 3;
  const visibleInitials = initials
    .filter(Boolean)
    .slice(0, Math.min(maxVisible, Math.max(count, 0)));

  const remainingCount = Math.max(count - visibleInitials.length, 0);
  const avatarSize = SCREEN.isSmallWidth ? scaleSize(27) : scaleSize(31);

  const avatarColors = [
    colors.primary,
    colors.secondary,
    colors.success,
  ];

  if (count <= 0) {
    return showLabel ? (
      <AppText variant="caption" tone="muted">
        {label ?? "No attendees yet"}
      </AppText>
    ) : null;
  }

  return (
    <View style={styles.root}>
      <View style={styles.stack}>
        {visibleInitials.map((initial, index) => (
          <View
            key={`${initial}-${index}`}
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                marginLeft: index === 0 ? 0 : -Spacing.two,
                backgroundColor: avatarColors[index],
                borderColor: colors.card,
              },
            ]}
          >
            <AppText
              variant="caption"
              numberOfLines={1}
              style={styles.avatarText}
            >
              {initial.slice(0, 1).toUpperCase()}
            </AppText>
          </View>
        ))}

        {remainingCount > 0 ? (
          <View
            style={[
              styles.avatar,
              styles.remainingAvatar,
              {
                width: avatarSize,
                height: avatarSize,
                marginLeft: -Spacing.two,
                backgroundColor: colors.surface,
                borderColor: colors.card,
              },
            ]}
          >
            <AppText variant="caption" tone="primary" style={styles.remainingText}>
              +{remainingCount}
            </AppText>
          </View>
        ) : null}
      </View>

      {showLabel ? (
        <AppText
          variant="caption"
          tone="muted"
          numberOfLines={1}
          style={styles.label}
        >
          {label ?? `${count} ${count === 1 ? "attendee" : "attendees"}`}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  stack: {
    flexDirection: "row",
    marginRight: Spacing.two,
  },

  avatar: {
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  remainingAvatar: {
    borderWidth: 2,
  },

  remainingText: {
    fontWeight: "800",
  },

  label: {
    flexShrink: 1,
  },
});