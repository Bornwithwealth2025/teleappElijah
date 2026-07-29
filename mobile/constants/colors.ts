// constants/colors.ts
export type AppColorTokens = {
  background: string;
  surface: string;
  surfaceStrong: string;
  surfaceHover: string;
  card: string;

  primary: string;
  primarySoft: string;
  primaryDeep: string;

  secondary: string;
  secondarySoft: string;
  accent: string;

  text: string;
  textMuted: string;
  textSoft: string;

  border: string;
  borderStrong: string;
  divider: string;

  success: string;
  warning: string;
  danger: string;

  tabInactive: string;

  overlay: string;
  focusRing: string;

  glass: string;
  glassStrong: string;
  glassBorder: string;
  glassHighlight: string;
};

export const LightColors: AppColorTokens = {
  background: "#FFFFFF",
  surface: "#FAFBFD",
  surfaceStrong: "#F2F4F8",
  surfaceHover: "#ECEFF4",
  card: "#FFFFFF",

  primary: "#0F6BFF",
  primarySoft: "#EAF1FF",
  primaryDeep: "#0757D7",

  secondary: "#6426FF",
  secondarySoft: "#F0EAFF",
  accent: "#8B22FF",

  text: "#071633",
  textMuted: "#5B6B85",
  textSoft: "#8996AC",

  border: "#E5E9F0",
  borderStrong: "#D5DCE7",
  divider: "#EEF1F5",

  success: "#22D386",
  warning: "#FFB21C",
  danger: "#FF4B3E",

  tabInactive: "#8A96AC",

  overlay: "rgba(7, 22, 51, 0.4)",
  focusRing: "rgba(15, 107, 255, 0.35)",

  glass: "rgba(255, 255, 255, 0.86)",
  glassStrong: "rgba(255, 255, 255, 0.97)",
  glassBorder: "rgba(15, 23, 42, 0.06)",
  glassHighlight: "rgba(255, 255, 255, 0.98)",
};

export const DarkColors: AppColorTokens = {
  background: "#0A1428",
  surface: "#0F1D3A",
  surfaceStrong: "#142542",
  surfaceHover: "#1A2C4C",
  card: "#0F1D3A",

  primary: "#4A8DFF",
  primarySoft: "#142D5D",
  primaryDeep: "#A9C8FF",

  secondary: "#9B75FF",
  secondarySoft: "#2B1D56",
  accent: "#C18CFF",

  text: "#F5F8FF",
  textMuted: "#A7B4CC",
  textSoft: "#7C8AA6",

  border: "#223154",
  borderStrong: "#2D3F66",
  divider: "#172848",

  success: "#42E5A0",
  warning: "#FFC553",
  danger: "#FF756B",

  tabInactive: "#8291AB",

  overlay: "rgba(2, 6, 16, 0.6)",
  focusRing: "rgba(74, 141, 255, 0.4)",

  glass: "rgba(10, 20, 40, 0.82)",
  glassStrong: "rgba(15, 29, 58, 0.96)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  glassHighlight: "rgba(255, 255, 255, 0.04)",
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

// Use "primary" for buttons/accents/small UI surfaces only.
// Use "logo" strictly for the Telefya logo mark — never as a UI background or button fill.
export const TelefyaGradients = {
  primary: ["#0F6BFF", "#6426FF"] as const,
  logo: ["#0F6BFF", "#FF4B3E", "#FFB21C", "#22D386", "#8B22FF"] as const,
  aurora: ["#F4F8FF", "#F8F3FF", "#F3FFF9"] as const,
};

export type AppColorScheme = keyof typeof Colors;
export type AppColors = AppColorTokens;