import { create } from "zustand";

import UserService, { UploadableImage } from "@/api/user.service";
import { UserProfile } from "@/types/user.types";

type UserStore = {
  profile: UserProfile | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  uploadProfileImage: (image: UploadableImage) => Promise<void>;
  clearError: () => void;
};

const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await UserService.getProfile();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to load profile.");
      }

      set({ profile: response.data });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load profile.",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadProfileImage: async (image) => {
    set({ isUploading: true, error: null });

    try {
      const response = await UserService.uploadProfileImage(image);

      if (!response.success) {
        throw new Error(response.message || "Unable to upload image.");
      }

      const currentProfile = get().profile;

      if (currentProfile) {
        set({
          profile: {
            ...currentProfile,
            profile_image: response.image,
          },
        });
      }

      await get().fetchProfile();
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload image.",
      });
    } finally {
      set({ isUploading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;