import React from "react";
import {
  AppState,
  type AppStateStatus,
} from "react-native";

import {
  authStorage,
  STORAGE_KEYS,
} from "@/api/client";
import useAuthStore from "@/store/authStore";

const SESSION_EXPIRY_MS = 15 * 60 * 1000;

export function SessionExpiryBootstrap() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const logout = useAuthStore((state) => state.logout);

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let appState = AppState.currentState;
    let handling = false;

    async function expireIfNeeded() {
      if (handling) return;

      const storedAt = await authStorage.getItem(
        STORAGE_KEYS.SESSION_BACKGROUND_AT,
      );

      const backgroundAt = Number(storedAt);

      if (
        !Number.isFinite(backgroundAt) ||
        Date.now() - backgroundAt < SESSION_EXPIRY_MS
      ) {
        return;
      }

      handling = true;

      try {
        await logout();
      } finally {
        handling = false;
      }
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const wasActive = appState === "active";
        const isBackground =
          nextState === "background" || nextState === "inactive";

        if (wasActive && isBackground) {
          void authStorage.setItem(
            STORAGE_KEYS.SESSION_BACKGROUND_AT,
            String(Date.now()),
          );
        }

        if (
          (appState === "background" || appState === "inactive") &&
          nextState === "active"
        ) {
          void expireIfNeeded();
        }

        appState = nextState;
      },
    );

    return () => subscription.remove();
  }, [isAuthenticated, logout]);

  return null;
}