import { Dimensions, PixelRatio } from 'react-native';

import { Colors, type AppColorScheme } from './colors';

const { width, height } = Dimensions.get('window');

export const SCREEN = {
  width,
  height,
  isSmallWidth: width < 380,
  isShortHeight: height < 720,
};

export function scaleSize(size: number) {
  const baseWidth = 390;
  const scaled = (width / baseWidth) * size;
  const min = size * 0.88;
  const max = size * 1.08;

  return Math.round(PixelRatio.roundToNearestPixel(Math.min(Math.max(scaled, min), max)));
}

export function verticalScale(size: number) {
  const baseHeight = 844;
  const scaled = (height / baseHeight) * size;
  const min = size * 0.82;
  const max = size * 1.06;

  return Math.round(PixelRatio.roundToNearestPixel(Math.min(Math.max(scaled, min), max)));
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
  ten: scaleSize(40),
  twelve: scaleSize(48),
};

export const Radius = {
  small: scaleSize(8),
  medium: scaleSize(12),
  large: scaleSize(18),
  pill: 999,
};

export const FontSize = {
  xs: scaleSize(12),
  sm: scaleSize(13),
  md: scaleSize(15),
  lg: scaleSize(17),
  xl: scaleSize(20),
  xxl: scaleSize(25),
  display: SCREEN.isSmallWidth ? scaleSize(29) : scaleSize(32),
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Layout = {
  maxContentWidth: 520,
  bottomTabInset: 92,
  screenPadding: SCREEN.isSmallWidth ? Spacing.three : Spacing.four,
  screenTopPadding: SCREEN.isShortHeight ? Spacing.two : Spacing.four,
  screenBottomPadding: SCREEN.isShortHeight ? Spacing.six : Spacing.twelve,
  compactGap: SCREEN.isShortHeight ? Spacing.three : Spacing.five,
};

export function getAppTheme(mode: AppColorScheme) {
  const colors = Colors[mode];

  return {
    dark: mode === 'dark',
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  };
}