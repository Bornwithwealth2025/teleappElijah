import React from "react";
import {
  AppState,
  Platform,
} from "react-native";
import Constants from "expo-constants";

type PermissionStatus =
  | "idle"
  | "checking"
  | "granted"
  | "denied"
  | "unavailable";

type TrackLike = {
  stop?: () => void;
};

type StreamLike = {
  getTracks?: () => TrackLike[];
};

function stopStream(stream?: StreamLike | null) {
  stream?.getTracks?.().forEach((track) => {
    track.stop?.();
  });
}

function getPermissionFailure(error: unknown): {
  status: Extract<PermissionStatus, "denied" | "unavailable">;
  message: string;
} {
  const originalMessage =
    error instanceof Error && error.message
      ? error.message
      : "";

  const message = originalMessage.toLowerCase();

  if (
    message.includes("notallowed") ||
    message.includes("permission denied") ||
    message.includes("permission") ||
    message.includes("security")
  ) {
    return {
      status: "denied",
      message:
        "Camera or microphone permission was denied. Enable both permissions in your device settings and try again.",
    };
  }

  if (
    message.includes("notfound") ||
    message.includes("device not found") ||
    message.includes("no camera") ||
    message.includes("no microphone")
  ) {
    return {
      status: "unavailable",
      message:
        "No usable camera or microphone was found on this device. Check your emulator camera configuration or test with a physical device.",
    };
  }

  if (
    message.includes("notreadable") ||
    message.includes("could not start") ||
    message.includes("failed to allocate") ||
    message.includes("in use")
  ) {
    return {
      status: "unavailable",
      message:
        "The camera or microphone is currently unavailable. Close other apps using them, then try again.",
    };
  }

  if (
    message.includes("native module") ||
    message.includes("webrtc") ||
    message.includes("media capture")
  ) {
    return {
      status: "unavailable",
      message:
        "Native video capture is unavailable. Open Telefya using the installed development build, not Expo Go.",
    };
  }

  return {
    status: "unavailable",
    message:
      originalMessage ||
      "Camera and microphone are unavailable on this device.",
  };
}

export function useMeetingPermissions() {
  const [status, setStatus] =
    React.useState<PermissionStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const isExpoGo = Constants.appOwnership === "expo";

  const requestPermissions = React.useCallback(async () => {
    setStatus("checking");
    setError(null);

    try {
      if (Platform.OS === "web") {
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices?.getUserMedia
        ) {
          setStatus("unavailable");
          setError(
            "Camera and microphone are unavailable in this browser.",
          );
          return false;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        stopStream(stream);
        setStatus("granted");
        return true;
      }

      if (isExpoGo) {
        setStatus("unavailable");
        setError(
          "Live meeting video requires the installed Telefya development build. Expo Go cannot load Telefya’s native WebRTC camera.",
        );
        return false;
      }

      const webrtc = await import(
        "@stream-io/react-native-webrtc"
      );
      const mediaDevices = webrtc.mediaDevices;

      if (!mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        setError(
          "Native camera capture is unavailable. Rebuild and open the Telefya development build.",
        );
        return false;
      }

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // This hook verifies access only. The meeting screen starts the
      // retained stream used by the pre-join camera preview.
      stopStream(stream);
      setStatus("granted");
      return true;
    } catch (requestError) {
      const failure = getPermissionFailure(requestError);

      setStatus(failure.status);
      setError(failure.message);
      return false;
    }
  }, [isExpoGo]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (
          nextState === "active" &&
          (status === "denied" || status === "unavailable")
        ) {
          // Returning from Settings should allow the gate to request again.
          setStatus("idle");
          setError(null);
        }
      },
    );

    return () => subscription.remove();
  }, [status]);

  return {
    status,
    error,
    granted: status === "granted",
    isUnavailable: status === "unavailable",
    requestPermissions,
  };
}