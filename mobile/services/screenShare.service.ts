import { Platform } from "react-native";

export type ScreenShareStream = any;

function getMediaDevices() {
  if (Platform.OS === "web") {
    return typeof navigator !== "undefined"
      ? navigator.mediaDevices
      : undefined;
  }

  try {
    return require("react-native-webrtc").mediaDevices;
  } catch {
    return undefined;
  }
}

export function isScreenShareAvailable() {
  const mediaDevices = getMediaDevices();

  return Boolean(
    mediaDevices?.getDisplayMedia ||
      (Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.mediaDevices?.getDisplayMedia),
  );
}

export async function startScreenShare(): Promise<ScreenShareStream> {
  const mediaDevices = getMediaDevices();

  if (!mediaDevices?.getDisplayMedia) {
    throw new Error(
      Platform.OS === "web"
        ? "Screen sharing is not supported in this browser."
        : "Native screen sharing requires a development build with screen capture configured.",
    );
  }

  const stream = await mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });

  const videoTrack = stream.getVideoTracks?.()[0];

  if (videoTrack) {
    videoTrack.addEventListener?.("ended", () => {
      stream.getTracks?.().forEach((track: any) => track.stop());
    });
  }

  return stream;
}

export function stopScreenShare(stream?: ScreenShareStream | null) {
  stream?.getTracks?.().forEach((track: any) => {
    track.stop();
  });
}