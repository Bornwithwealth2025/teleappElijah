import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import type { AppColorScheme } from '@/constants/colors';

type ThemePreference = 'system' | AppColorScheme;

type ThemeModeContextValue = {
  mode: AppColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const systemMode: AppColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const [preference, setPreference] = useState<ThemePreference>('system');

  const mode: AppColorScheme = preference === 'system' ? systemMode : preference;

  const value = useMemo(
    () => ({
      mode,
      preference,
      setPreference,
      toggleMode: () => {
        setPreference(mode === 'dark' ? 'light' : 'dark');
      },
    }),
    [mode, preference]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider');
  }

  return context;
}