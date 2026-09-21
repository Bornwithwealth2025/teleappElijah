import { create } from "zustand";

import UserService, {
  UploadableImage,
} from "@/api/user.service";
import { UserProfile } from "@/types/user.types";
import type {
  UpdateProfileRequest,
} from "@/types/user.types";

type UserStore = {
  profile: UserProfile | null;
  isLoading: boolean;
  isUploading: boolean;
  isUpdating: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  uploadProfileImage: (
    image: UploadableImage,
  ) => Promise<void>;
  updateProfile: (
    payload: UpdateProfileRequest,
  ) => Promise<void>;
  clearProfile: () => void;
  clearError: () => void;
};

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

function unwrapProfile(value: any): UserProfile | null {
  const profile =
    value?.data?.user ??
    value?.data?.profile ??
    value?.data ??
    value?.user ??
    value?.profile ??
    value;

  return profile && typeof profile === "object"
    ? (profile as UserProfile)
    : null;
}

function getUploadedImage(response: any) {
  return (
    response?.image ??
    response?.data?.image ??
    response?.data?.profile_image ??
    null
  );
}

const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  isLoading: false,
  isUploading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await UserService.getProfile();
      const profile = unwrapProfile(response);

      if (!response.success || !profile) {
        throw new Error(
          response.message || "Unable to load profile.",
        );
      }

      set({
        profile,
        error: null,
      });
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to load profile.",
        ),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (payload) => {
    set({
      isUpdating: true,
      error: null,
    });

    try {
      const response = await UserService.updateProfile(payload);
      const profile = unwrapProfile(response);

      if (!response.success || !profile) {
        throw new Error(
          response.message || "Unable to update profile.",
        );
      }

      set({
        profile,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to update profile.",
      );

      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isUpdating: false });
    }
  },

  uploadProfileImage: async (image) => {
    set({
      isUploading: true,
      error: null,
    });

    try {
      const response =
        await UserService.uploadProfileImage(image);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to upload image.",
        );
      }

      const uploadedImage = getUploadedImage(response);
      const currentProfile = get().profile;

      if (uploadedImage && currentProfile) {
        set({
          profile: {
            ...currentProfile,
            profile_image: uploadedImage,
          },
        });
      }

      await get().fetchProfile();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to upload image.",
      );

      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isUploading: false });
    }
  },

  clearProfile: () => {
    set({
      profile: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useUserStore;