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
  background: "#160A2E",
  surface: "#21103F",
  surfaceStrong: "#2F1758",
  card: "#241044",

  primary: "#A78BFA",
  primarySoft: "#3B1F6D",
  primaryDeep: "#7C3AED",

  secondary: "#67E8F9",
  secondarySoft: "#143A4A",

  text: "#FFFFFF",
  textMuted: "#C7BFEA",
  textSoft: "#9A8CC7",

  border: "#3D246B",
  divider: "#301B55",

  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",

  tabInactive: "#9A8CC7",

  glass: "rgba(47, 23, 88, 0.58)",
  glassStrong: "rgba(47, 23, 88, 0.76)",
  glassBorder: "rgba(167, 139, 250, 0.22)",
  glassHighlight: "rgba(255, 255, 255, 0.08)",
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

export type AppColorScheme = keyof typeof Colors;
export type AppColors = typeof LightColors;
