import { Platform } from "react-native";

import {
  registerBackgroundBlurVideoFilters,
  registerVirtualBackgroundFilter,
} from "@stream-io/video-filters-react-native";

export type VideoEffectId =
  | "none"
  | "blur-light"
  | "blur-medium"
  | "blur-heavy"
  | "ocean"
  | "office"
  | "mountains";

export type VideoEffectOption = {
  id: VideoEffectId;
  label: string;
  kind: "none" | "blur" | "image";
  imageUrl?: string;
};

export const VIDEO_EFFECT_OPTIONS: VideoEffectOption[] = [
  {
    id: "none",
    label: "None",
    kind: "none",
  },
  {
    id: "blur-light",
    label: "Light blur",
    kind: "blur",
  },
  {
    id: "blur-medium",
    label: "Medium blur",
    kind: "blur",
  },
  {
    id: "blur-heavy",
    label: "Strong blur",
    kind: "blur",
  },
  {
    id: "ocean",
    label: "Ocean",
    kind: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1440&q=85",
  },
  {
    id: "office",
    label: "Office",
    kind: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1440&q=85",
  },
  {
    id: "mountains",
    label: "Mountains",
    kind: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1440&q=85",
  },
];

let initialized = false;
const registeredImageUris = new Map<
  VideoEffectId,
  string
>();

function getOption(id: VideoEffectId) {
  return (
    VIDEO_EFFECT_OPTIONS.find((option) => option.id === id) ??
    VIDEO_EFFECT_OPTIONS[0]
  );
}

function getBlurFilterName(id: VideoEffectId) {
  switch (id) {
    case "blur-light":
      return "BackgroundBlurLight";
    case "blur-medium":
      return "BackgroundBlurMedium";
    case "blur-heavy":
      return "BackgroundBlurHeavy";
    default:
      return null;
  }
}

export async function initializeVideoEffects() {
  if (Platform.OS === "web") {
    return false;
  }

  if (initialized) {
    return true;
  }

  await registerBackgroundBlurVideoFilters();

  for (const option of VIDEO_EFFECT_OPTIONS) {
    if (option.kind !== "image" || !option.imageUrl) {
      continue;
    }

    const registeredUri =
      await registerVirtualBackgroundFilter({
        uri: option.imageUrl,
      });

    registeredImageUris.set(option.id, registeredUri);
  }

  initialized = true;
  return true;
}

export async function applyVideoEffect(
  stream: any,
  effectId: VideoEffectId,
) {
  if (Platform.OS === "web") {
    throw new Error(
      "Virtual backgrounds are currently available in the native mobile app only.",
    );
  }

  if (!stream?.getVideoTracks) {
    throw new Error(
      "Turn your camera on before applying a background effect.",
    );
  }

  await initializeVideoEffects();

  const option = getOption(effectId);
  const blurFilterName = getBlurFilterName(effectId);

  let filterName: string | null = null;

  if (blurFilterName) {
    filterName = blurFilterName;
  }

  if (option.kind === "image") {
    const imageUri = registeredImageUris.get(effectId);

    if (!imageUri) {
      throw new Error(
        "This background image is not ready yet. Please try again.",
      );
    }

    filterName = `VirtualBackground-${imageUri}`;
  }

  const tracks = stream.getVideoTracks();

  if (!tracks.length) {
    throw new Error(
      "Turn your camera on before applying a background effect.",
    );
  }

  tracks.forEach((track: any) => {
    track._setVideoEffect?.(filterName);
  });

  return option;
}

export async function clearVideoEffect(stream: any) {
  if (!stream?.getVideoTracks) {
    return;
  }

  stream.getVideoTracks().forEach((track: any) => {
    track._setVideoEffect?.(null);
  });
}