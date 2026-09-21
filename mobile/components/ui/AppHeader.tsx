import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

import { AppText } from "./AppText";

type AppHeaderSize = "hero" | "page" | "compact";

type TitlePart = {
  text: string;
  color?: string;
};

type AppHeaderBadge = {
  icon?: ReactNode;
  label: string;
  highlightLabel?: string;
  highlightColor?: string;
};

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  titleParts?: TitlePart[];
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
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
  const { colors, isDark } = useAppTheme();

  const titleVariant = {
    hero: "display",
    page: "title",
    compact: "sectionTitle",
  } as const;

  return (
    <View
      style={[
        styles.root,
        size === "compact" && styles.compactRoot,
        style,
      ]}
    >
      {leftSlot || rightSlot ? (
        <View style={styles.actionRow}>
          <View style={styles.leftSlot}>{leftSlot}</View>

          {rightSlot ? (
            <View style={styles.rightSlot}>{rightSlot}</View>
          ) : null}
        </View>
      ) : null}

      {badge ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : colors.glass,
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : colors.glassBorder,
            },
          ]}
        >
          {badge.icon}

          <AppText style={styles.badgeText}>
            <AppText style={{ color: colors.text }}>
              {badge.label}
            </AppText>

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

      <View
        style={[
          styles.copyWrap,
          size === "compact" && styles.compactCopy,
        ]}
      >
        {eyebrow ? (
          <AppText
            variant="overline"
            tone="primary"
            style={styles.eyebrow}
          >
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
                key={`${part.text}-${index}`}
                style={{ color: part.color ?? colors.text }}
              >
                {part.text}
              </AppText>
            ))
          ) : (
            <AppText style={{ color: colors.text }}>
              {title}
            </AppText>
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
    gap: Spacing.two,
  },

  actionRow: {
    width: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSlot: {
    flex: 1,
    minWidth: 0,
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
    alignSelf: "flex-start",
    minHeight: 32,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  badgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.55,
  },

  copyWrap: {
    width: "100%",
    maxWidth: 440,
  },

  compactCopy: {
    maxWidth: "100%",
  },

  eyebrow: {
    marginBottom: Spacing.two,
  },

  title: {
    maxWidth: 410,
  },

  subtitle: {
    maxWidth: 380,
    marginTop: Spacing.two,
    lineHeight: 23,
  },
});