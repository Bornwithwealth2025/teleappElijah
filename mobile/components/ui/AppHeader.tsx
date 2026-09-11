// components/ui/AppHeader.tsx
import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

import { AppText } from "./AppText";

type AppHeaderSize = "hero" | "page" | "compact";

type TitlePart = {
  text: string;
  color?: string;
};

type AppHeaderBadge = {
  icon?: ReactNode;
  /** Plain-colored lead text, e.g. "ONE APP." */
  label: string;
  /** Accent-colored trailing text, e.g. "ALL CONNECTIONS." */
  highlightLabel?: string;
  highlightColor?: string;
};

type AppHeaderProps = {
  eyebrow?: string;
  /**
   * Plain title text. Ignored if `titleParts` is provided — use whichever
   * fits: a single string for ordinary pages, `titleParts` when a screen
   * needs a brand wordmark mixed into the title (e.g. "Welcome to Telefya"
   * with each brand letter individually colored).
   */
  title: string;
  titleParts?: TitlePart[];
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  /** Small pill above the title — matches the welcome screen's badge. */
  badge?: AppHeaderBadge;
  size?: AppHeaderSize;
  style?: StyleProp<ViewStyle>;
};

export function AppHeader({
  eyebrow,
  title,
  titleParts,
  subtitle,
  leftSlot,
  rightSlot,
  badge,
  size = "hero",
  style,
}: AppHeaderProps) {
  const { colors } = useAppTheme();

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

      {badge ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          {badge.icon}

          <AppText style={styles.badgeText}>
            <AppText style={{ color: colors.text }}>{badge.label}</AppText>
            {badge.highlightLabel ? (
              <AppText
                style={{
                  color: badge.highlightColor ?? colors.primary,
                }}
              >
                {" "}
                {badge.highlightLabel}
              </AppText>
            ) : null}
          </AppText>
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
          {titleParts ? (
            titleParts.map((part, index) => (
              <AppText
                key={index}
                style={{ color: part.color ?? colors.text }}
              >
                {part.text}
              </AppText>
            ))
          ) : (
            <AppText style={{ color: colors.text }}>{title}</AppText>
          )}
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

  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
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