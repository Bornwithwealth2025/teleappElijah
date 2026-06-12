import { Colors } from '@/constants/colors';
import { useThemeMode } from '@/contexts/theme-mode-context';

export function useAppTheme() {
  const { mode, preference, setPreference, toggleMode } = useThemeMode();

  return {
    mode,
    preference,
    isDark: mode === 'dark',
    colors: Colors[mode],
    setPreference,
    toggleMode,
  };
}