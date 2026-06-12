import { create } from "zustand";

import UserService from "@/api/user.service";
import { ScheduledMeeting } from "@/types/user.types";
import {
  createMeetingUrl,
  createRoomId,
  getLocalTimeZone,
} from "@/utils/meetingLinks";

type SchedulerStore = {
  meetings: ScheduledMeeting[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;

  fetchMeetings: () => Promise<void>;
  scheduleMeeting: (date: string) => Promise<void>;
  deleteMeetings: (meetingIds: string[]) => Promise<void>;
  clearError: () => void;
};

const useSchedulerStore = create<SchedulerStore>((set, get) => ({
  meetings: [],
  isLoading: false,
  isCreating: false,
  isDeleting: false,
  error: null,

  fetchMeetings: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await UserService.getMeetings();

      if (!response.success) {
        throw new Error(response.message || "Unable to load meetings.");
      }

      set({ meetings: response.data ?? [] });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load meetings.",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  scheduleMeeting: async (date) => {
    set({ isCreating: true, error: null });

    try {
      const roomId = `${createRoomId()}_schedule_meeting`;
      const meetingUrl = createMeetingUrl(roomId);

      const response = await UserService.scheduleMeeting({
        date,
        timeZone: getLocalTimeZone(),
        meeting_url: meetingUrl,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to schedule meeting.");
      }

      await get().fetchMeetings();
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to schedule meeting.",
      });
    } finally {
      set({ isCreating: false });
    }
  },

  deleteMeetings: async (meetingIds) => {
    if (meetingIds.length === 0) return;

    set({ isDeleting: true, error: null });

    try {
      const response = await UserService.deleteMeetings({ meetingIds });

      if (!response.success) {
        throw new Error(response.message || "Unable to delete meetings.");
      }

      set((state) => ({
        meetings: state.meetings.filter(
          (meeting) => !meetingIds.includes(String(meeting.id))
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete meetings.",
      });
    } finally {
      set({ isDeleting: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useSchedulerStore;