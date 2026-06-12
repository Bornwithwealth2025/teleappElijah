import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, SCREEN, scaleSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type ParticipantStackProps = {
  count: number;
  initials?: string[];
  label?: string;
};

export function ParticipantStack({
  count,
  initials = ["E", "A", "M"],
  label,
}: ParticipantStackProps) {
  const { colors } = useAppTheme();
  const visibleInitials = initials.filter(Boolean).slice(0, SCREEN.isSmallWidth ? 2 : 3);
  const avatarSize = SCREEN.isSmallWidth ? scaleSize(26) : scaleSize(30);

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
                backgroundColor:
                  index === 0
                    ? colors.primary
                    : index === 1
                      ? colors.secondary
                      : colors.primarySoft,
                borderColor: colors.card,
              },
            ]}
          >
            <AppText
              variant="caption"
              numberOfLines={1}
              style={{
                color: index === 2 ? colors.primary : "#FFFFFF",
                fontWeight: "800",
              }}
            >
              {initial.slice(0, 1).toUpperCase()}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" tone="muted" numberOfLines={1} style={styles.label}>
        {label ?? `${count} joined`}
      </AppText>
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
  label: {
    flexShrink: 1,
  },
});