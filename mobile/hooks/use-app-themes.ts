// hooks/use-app-themes.ts
import { Colors } from "@/constants/colors";
import {
  Radius,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useThemeMode } from "@/contexts/theme-mode-context";

export function useAppTheme() {
  const {
    mode,
    preference,
    setPreference,
    toggleMode,
  } = useThemeMode();

  const isDark = mode === "dark";
  const colors = Colors[mode];

  return {
    mode,
    preference,
    isDark,
    isLight: !isDark,
    colors,
    spacing: Spacing,
    radius: Radius,
    shadows: Shadows,

    statusBarStyle: isDark
      ? ("light-content" as const)
      : ("dark-content" as const),

    navigationBarStyle: isDark
      ? ("light" as const)
      : ("dark" as const),

    setPreference,
    toggleMode,
  };
}