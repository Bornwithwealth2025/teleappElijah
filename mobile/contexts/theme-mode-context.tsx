import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform, useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { AppColorScheme } from "@/constants/colors";

export type ThemePreference = "system" | AppColorScheme;

type ThemeModeContextValue = {
  mode: AppColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleMode: () => void;
};

const STORAGE_KEY = "telefya_theme_preference";

const ThemeModeContext =
  createContext<ThemeModeContextValue | null>(null);

async function readPreference(): Promise<ThemePreference | null> {
  try {
    const value =
      Platform.OS === "web"
        ? typeof localStorage !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null
        : await SecureStore.getItemAsync(STORAGE_KEY);

    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {}

  return null;
}

async function savePreference(preference: ThemePreference) {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, preference);
      }
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEY, preference);
  } catch {}
}

export function ThemeModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemScheme = useColorScheme();
  const systemMode: AppColorScheme =
    systemScheme === "dark" ? "dark" : "light";

  const [preference, setPreferenceState] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;

    void readPreference().then((storedPreference) => {
      if (mounted && storedPreference) {
        setPreferenceState(storedPreference);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback(
    (nextPreference: ThemePreference) => {
      setPreferenceState(nextPreference);
      void savePreference(nextPreference);
    },
    [],
  );

  const mode: AppColorScheme =
    preference === "system" ? systemMode : preference;

  const toggleMode = useCallback(() => {
    setPreference(mode === "dark" ? "light" : "dark");
  }, [mode, setPreference]);

  const value = useMemo(
    () => ({
      mode,
      preference,
      setPreference,
      toggleMode,
    }),
    [mode, preference, setPreference, toggleMode],
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
    throw new Error(
      "useThemeMode must be used inside ThemeModeProvider",
    );
  }

  return context;
}