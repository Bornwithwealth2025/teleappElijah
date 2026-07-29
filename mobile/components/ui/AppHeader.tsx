// components/ui/AppHeader.tsx
import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Spacing } from "@/constants/theme";

import { AppText } from "./AppText";

type AppHeaderSize = "hero" | "page" | "compact";

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  size?: AppHeaderSize;
  style?: StyleProp<ViewStyle>;
};

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  leftSlot,
  rightSlot,
  size = "hero",
  style,
}: AppHeaderProps) {
  const titleVariant = {
    hero: "display",
    page: "title",
    compact: "sectionTitle",
  } as const;

  return (
    <View style={[styles.root, size === "compact" && styles.compactRoot, style]}>
      {leftSlot || rightSlot ? (
        <View style={styles.actionRow}>
          <View style={styles.leftSlot}>{leftSlot}</View>
          <View style={styles.rightSlot}>{rightSlot}</View>
        </View>
      ) : null}

      <View style={[styles.copyWrap, size === "compact" && styles.compactCopy]}>
        {eyebrow ? (
          <AppText variant="overline" tone="primary" style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        ) : null}

        <AppText
          variant={titleVariant[size]}
          numberOfLines={size === "compact" ? 1 : 2}
          style={styles.title}
        >
          {title}
        </AppText>

        {subtitle ? (
          <AppText
            variant={size === "compact" ? "caption" : "body"}
            tone="muted"
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: Spacing.four,
  },

  compactRoot: {
    gap: Spacing.three,
  },

  actionRow: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSlot: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginLeft: Spacing.three,
  },

  copyWrap: {
    width: "100%",
    maxWidth: 430,
  },

  compactCopy: {
    maxWidth: "100%",
  },

  eyebrow: {
    marginBottom: Spacing.two,
  },

  title: {
    maxWidth: 390,
  },

  subtitle: {
    maxWidth: 360,
    marginTop: Spacing.two,
  },
});