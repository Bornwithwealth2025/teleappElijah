import { Platform } from "react-native";

export type ScreenShareStream = any;

function getMediaDevices() {
  if (Platform.OS === "web") {
    return typeof navigator !== "undefined"
      ? navigator.mediaDevices
      : undefined;
  }

  try {
    return require("@stream-io/react-native-webrtc").mediaDevices;
  } catch {
    return undefined;
  }
}

export function isScreenShareAvailable() {
  if (Platform.OS === "ios") {
    return false;
  }

  const mediaDevices = getMediaDevices();

  return Boolean(mediaDevices?.getDisplayMedia);
}

export async function startScreenShare(): Promise<ScreenShareStream> {
  if (Platform.OS === "ios") {
    throw new Error(
      "iPhone screen sharing requires the ReplayKit broadcast extension, which is not configured yet.",
    );
  }

  const mediaDevices = getMediaDevices();

  if (!mediaDevices?.getDisplayMedia) {
    throw new Error(
      Platform.OS === "web"
        ? "Screen sharing is not supported in this browser."
        : "Screen sharing requires the latest Telefya development build.",
    );
  }

  const constraints =
    Platform.OS === "android"
      ? {
          video: true,
          audio: false,
          android: {
            resolutionScale: 0.7,
          },
        }
      : {
          video: true,
          audio: false,
        };

  const stream = await mediaDevices.getDisplayMedia(
    constraints as any,
  );

  const videoTrack = stream?.getVideoTracks?.()[0];

  videoTrack?.addEventListener?.("ended", () => {
    stopScreenShare(stream);
  });

  return stream;
}

export function stopScreenShare(
  stream?: ScreenShareStream | null,
) {
  stream?.getTracks?.().forEach((track: any) => {
    try {
      track.stop();
    } catch {
      // Track may already be stopped by Android's capture prompt.
    }
  });
}