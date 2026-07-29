import React from "react";
import {
  AppState,
  Platform,
} from "react-native";

type PermissionStatus =
  | "idle"
  | "checking"
  | "granted"
  | "denied"
  | "unavailable";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Camera and microphone permission is required.";
}

export function useMeetingPermissions() {
  const [status, setStatus] =
    React.useState<PermissionStatus>("idle");
  const [error, setError] =
    React.useState<string | null>(null);

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

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        setStatus("granted");
        return true;
      }

      const webrtc = await import("react-native-webrtc");
      const mediaDevices = webrtc.mediaDevices;

      if (!mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        setError(
          "Native media capture is unavailable. Rebuild the development client.",
        );
        return false;
      }

      const stream =
        await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

      stream.getTracks().forEach((track: any) => {
        track.stop?.();
      });

      setStatus("granted");
      return true;
    } catch (permissionError) {
      setStatus("denied");
      setError(getErrorMessage(permissionError));
      return false;
    }
  }, []);

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (
          nextState === "active" &&
          status === "denied"
        ) {
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
    requestPermissions,
  };
}