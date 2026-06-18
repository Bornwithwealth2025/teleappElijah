export const LightColors = {
  background: "#FFFFFF",
  surface: "#F7F7FB",
  surfaceStrong: "#EFEAFD",
  card: "#FFFFFF",

  primary: "#6D28D9",
  primarySoft: "#EDE9FE",
  primaryDeep: "#4C1D95",

  secondary: "#38BDF8",
  secondarySoft: "#E0F2FE",

  text: "#111827",
  textMuted: "#6B7280",
  textSoft: "#9CA3AF",

  border: "#E5E7EB",
  divider: "#F1F5F9",

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",

  tabInactive: "#8A8FA3",

  glass: "rgba(255, 255, 255, 0.72)",
  glassStrong: "rgba(255, 255, 255, 0.86)",
  glassBorder: "rgba(109, 40, 217, 0.14)",
  glassHighlight: "rgba(255, 255, 255, 0.92)",
};

export const DarkColors = {
  background: "#080B10",
  surface: "#10151F",
  surfaceStrong: "#171E2B",
  card: "#111827",

  primary: "#7C3AED",
  primarySoft: "#211A35",
  primaryDeep: "#6D28D9",

  secondary: "#0EA5E9",
  secondarySoft: "#082F49",

  text: "#F9FAFB",
  textMuted: "#A7B0C0",
  textSoft: "#747F91",

  border: "#242C3A",
  divider: "#1B2230",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  tabInactive: "#747F91",

  glass: "rgba(17, 24, 39, 0.74)",
  glassStrong: "rgba(17, 24, 39, 0.9)",
  glassBorder: "rgba(124, 58, 237, 0.16)",
  glassHighlight: "rgba(255, 255, 255, 0.055)",
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

export type AppColorScheme = keyof typeof Colors;
export type AppColors = typeof LightColors;
