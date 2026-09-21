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
  background: "#F7F9FF",
  surface: "#FBFCFF",
  surfaceStrong: "#F0F5FF",
  surfaceHover: "#E8F0FF",
  card: "#FFFFFF",

  primary: "#176BFF",
  primarySoft: "#E9F1FF",
  primaryDeep: "#0757D7",

  secondary: "#7357FF",
  secondarySoft: "#F0EDFF",
  accent: "#12BFA8",

  text: "#071633",
  textMuted: "#5D6F8C",
  textSoft: "#8A98B1",

  border: "#DCE6F5",
  borderStrong: "#C6D5EA",
  divider: "#EAF0F8",

  success: "#18BD7A",
  warning: "#F4A51C",
  danger: "#F04F4A",

  tabInactive: "#8190AA",

  overlay: "rgba(7, 22, 51, 0.42)",
  focusRing: "rgba(23, 107, 255, 0.28)",

  glass: "rgba(255, 255, 255, 0.88)",
  glassStrong: "rgba(255, 255, 255, 0.98)",
  glassBorder: "rgba(23, 107, 255, 0.10)",
  glassHighlight: "rgba(255, 255, 255, 0.98)",
};

export const DarkColors: AppColorTokens = {

  background: "#030817",
  surface: "#071A37",
  surfaceStrong: "#0A2348",
  surfaceHover: "#0D2B57",
  card: "#082040",

  primary: "#428BFF",
  primarySoft: "#12396F",
  primaryDeep: "#A8C8FF",

  secondary: "#8B70FF",
  secondarySoft: "#282060",
  accent: "#19D1B5",

  text: "#F5F8FF",
  textMuted: "#ADBCD5",
  textSoft: "#8394B2",

  border: "#1D416B",
  borderStrong: "#28547F",
  divider: "#14345B",

  success: "#3FE0A1",
  warning: "#FFC857",
  danger: "#FF7A73",

  tabInactive: "#8A9AB4",

  overlay: "rgba(1, 5, 15, 0.68)",
  focusRing: "rgba(66, 139, 255, 0.35)",

  glass: "rgba(7, 26, 55, 0.84)",
  glassStrong: "rgba(8, 32, 64, 0.97)",
  glassBorder: "rgba(120, 171, 255, 0.14)",
  glassHighlight: "rgba(255, 255, 255, 0.05)",
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

export const TelefyaGradients = {
  primary: ["#7B1CFF", "#0F6BFF", "#12D8B0"] as const,
  logo: ["#0F6BFF", "#FF4B3E", "#FFB21C", "#22D386", "#8B22FF"] as const,
  aurora: ["#F4F8FF", "#F8F3FF", "#F2FFFB"] as const,
};

export type AppColorScheme = keyof typeof Colors;
export type AppColors = AppColorTokens;