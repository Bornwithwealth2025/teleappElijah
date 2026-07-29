import {
  Dimensions,
  Easing,
  PixelRatio,
  Platform,
} from "react-native";

import {
  Colors,
  type AppColorScheme,
} from "./colors";

const { width, height } = Dimensions.get("window");

export const SCREEN = {
  width,
  height,
  isSmallWidth: width < 380,
  isShortHeight: height < 720,
  isTablet: width >= 768,
};

export function scaleSize(size: number) {
  const scaled = (width / 390) * size;
  const min = size * 0.88;
  const max = size * 1.08;

  return Math.round(
    PixelRatio.roundToNearestPixel(
      Math.min(Math.max(scaled, min), max),
    ),
  );
}

export function verticalScale(size: number) {
  const scaled = (height / 844) * size;
  const min = size * 0.82;
  const max = size * 1.06;

  return Math.round(
    PixelRatio.roundToNearestPixel(
      Math.min(Math.max(scaled, min), max),
    ),
  );
}

export const Spacing = {
  one: scaleSize(4),
  two: scaleSize(8),
  three: scaleSize(12),
  four: scaleSize(16),
  five: scaleSize(20),
  six: scaleSize(24),
  seven: scaleSize(28),
  eight: scaleSize(32),
  nine: scaleSize(36),
  ten: scaleSize(40),
  twelve: scaleSize(48),
  fourteen: scaleSize(56),
  sixteen: scaleSize(64),
};

export const Radius = {
  small: scaleSize(10),
  medium: scaleSize(16),
  large: scaleSize(22),
  xLarge: scaleSize(28),
  card: scaleSize(24),
  pill: 999,
};

export const FontSize = {
  caption: scaleSize(12),
  xs: scaleSize(13),
  sm: scaleSize(14),
  md: scaleSize(16),
  lg: scaleSize(18),
  xl: scaleSize(22),
  xxl: scaleSize(28),
  title: SCREEN.isSmallWidth
    ? scaleSize(30)
    : scaleSize(34),
  display: SCREEN.isSmallWidth
    ? scaleSize(36)
    : scaleSize(42),
};

export const FontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
} as const;

export const FontFamily = {
  regular: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
  medium: Platform.select({
    ios: "System",
    android: "sans-serif-medium",
    default: "System",
  }),
  bold: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

export const Typography = {
  display: {
    fontSize: FontSize.display,
    lineHeight: scaleSize(48),
    fontWeight: FontWeight.black,
    letterSpacing: -1.2,
  },
  title: {
    fontSize: FontSize.title,
    lineHeight: scaleSize(42),
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: FontSize.xxl,
    lineHeight: scaleSize(34),
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: scaleSize(24),
    fontWeight: FontWeight.regular,
  },
  bodyStrong: {
    fontSize: FontSize.md,
    lineHeight: scaleSize(24),
    fontWeight: FontWeight.semibold,
  },
  caption: {
    fontSize: FontSize.sm,
    lineHeight: scaleSize(20),
    fontWeight: FontWeight.medium,
  },
  overline: {
    fontSize: FontSize.caption,
    lineHeight: scaleSize(16),
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1.1,
    textTransform: "uppercase" as const,
  },
};

export const Shadows = {
  soft: {
    shadowColor: "#10213F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  card: {
    shadowColor: "#10213F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  enterprise: {
    shadowColor: "#10213F",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 34,
    elevation: 8,
  },
  floating: {
    shadowColor: "#0F6BFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const Motion = {
  fast: 140,
  normal: 220,
  emphasis: 320,
  slow: 480,

  spring: {
    damping: 16,
    stiffness: 180,
    mass: 0.8,
  },

  easing: Easing.out(Easing.cubic),

  enter: {
    duration: 320,
    easing: Easing.out(Easing.cubic),
  },

  exit: {
    duration: 180,
    easing: Easing.in(Easing.cubic),
  },
};

export const Layout = {
  maxContentWidth: SCREEN.isTablet ? 720 : 620,
  bottomTabInset: 100,

  screenPadding: SCREEN.isSmallWidth
    ? Spacing.three
    : Spacing.four,

  screenTopPadding: SCREEN.isShortHeight
    ? Spacing.three
    : Spacing.five,

  screenBottomPadding: SCREEN.isShortHeight
    ? Spacing.six
    : Spacing.twelve,

  compactGap: SCREEN.isShortHeight
    ? Spacing.three
    : Spacing.four,

  sectionGap: Spacing.six,

  cardPadding: SCREEN.isSmallWidth
    ? Spacing.four
    : Spacing.five,
};

export function getAppTheme(mode: AppColorScheme) {
  const colors = Colors[mode];

  return {
    dark: mode === "dark",
    colors: {
      ...colors,
      notification: colors.primary,
    },
    typography: Typography,
    spacing: Spacing,
    radius: Radius,
    shadows: Shadows,
    motion: Motion,
  };
}