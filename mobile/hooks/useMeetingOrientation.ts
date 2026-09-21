import { useEffect } from "react";
import { Platform } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";

export function useMeetingOrientation(enabled: boolean) {
  useEffect(() => {
    if (!enabled || Platform.OS === "web") {
      return;
    }

    // Do not force landscape. The meeting follows normal device rotation.
    void ScreenOrientation.unlockAsync().catch(() => undefined);
  }, [enabled]);
}