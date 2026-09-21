import { create } from "zustand";

import UserService from "@/api/user.service";
import type { MeetingInbox } from "@/types/user.types";

const emptyInbox: MeetingInbox = {
  live: [],
  upcoming: [],
  invitations: [],
};

type MeetingInboxStore = {
  inbox: MeetingInbox;
  isLoading: boolean;
  error: string | null;
  fetchInbox: () => Promise<void>;
};

const useMeetingInboxStore = create<MeetingInboxStore>(
  (set) => ({
    inbox: emptyInbox,
    isLoading: false,
    error: null,

    fetchInbox: async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await UserService.getMeetingInbox();

        if (response?.success === false) {
          throw new Error(
            response.message || "Unable to load your meetings.",
          );
        }

        set({
          inbox: {
            live: response?.data?.live ?? [],
            upcoming: response?.data?.upcoming ?? [],
            invitations: response?.data?.invitations ?? [],
          },
          error: null,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Unable to load your meetings.",
        });
      } finally {
        set({ isLoading: false });
      }
    },
  }),
);

export default useMeetingInboxStore;