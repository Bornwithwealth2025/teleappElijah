import { create } from "zustand";

import UserService from "@/api/user.service";
import type {
  ScheduledMeeting,
} from "@/types/user.types";
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

function unwrapMeetings(response: any): ScheduledMeeting[] {
  const candidates = [
    response?.data?.meetings,
    response?.data,
    response?.meetings,
  ];

  const meetings = candidates.find(Array.isArray);

  return meetings ?? [];
}

function getBackendError(
  error: any,
  fallback: string,
) {
  const responseData = error?.response?.data;

  const message =
    responseData?.message ??
    responseData?.error ??
    responseData?.details ??
    error?.message;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message;
  }

  return fallback;
}

function isValidDate(value: string) {
  const parsed = new Date(value);

  return (
    Boolean(value) &&
    !Number.isNaN(parsed.getTime())
  );
}

const useSchedulerStore = create<SchedulerStore>(
  (set, get) => ({
    meetings: [],
    isLoading: false,
    isCreating: false,
    isDeleting: false,
    error: null,

    fetchMeetings: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response =
          await UserService.getMeetings();

        if (response?.success === false) {
          throw new Error(
            response.message ||
              "Unable to load meetings.",
          );
        }

        set({
          meetings: unwrapMeetings(response),
          error: null,
        });
      } catch (error) {
        set({
          error: getBackendError(
            error,
            "Unable to load meetings.",
          ),
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    scheduleMeeting: async (date) => {
      if (get().isCreating) return;

      if (!isValidDate(date)) {
        set({
          error:
            "Please choose a valid meeting date and time.",
        });
        return;
      }

      set({
        isCreating: true,
        error: null,
      });

      try {
        const roomId =
          `${createRoomId()}_schedule_meeting`;

        const meetingUrl =
          createMeetingUrl(roomId);

        // The backend expects "path", not "meeting_url".
        const response =
          await UserService.scheduleMeeting({
            date,
            timeZone: getLocalTimeZone(),
            path: meetingUrl,
          });

        if (response?.success === false) {
          throw new Error(
            response.message ||
              "Unable to schedule meeting.",
          );
        }

        await get().fetchMeetings();
      } catch (error) {
        set({
          error: getBackendError(
            error,
            "Unable to schedule meeting.",
          ),
        });
      } finally {
        set({
          isCreating: false,
        });
      }
    },

    deleteMeetings: async (meetingIds) => {
      const ids = meetingIds
        .map(String)
        .filter(Boolean);

      if (
        ids.length === 0 ||
        get().isDeleting
      ) {
        return;
      }

      set({
        isDeleting: true,
        error: null,
      });

      try {
        const response =
          await UserService.deleteMeetings({
            meetingIds: ids,
          });

        if (response?.success === false) {
          throw new Error(
            response.message ||
              "Unable to delete meetings.",
          );
        }

        set((state) => ({
          meetings: state.meetings.filter(
            (meeting) =>
              !ids.some(
                (id) =>
                  String(id) ===
                  String(meeting.id),
              ),
          ),
          error: null,
        }));
      } catch (error) {
        set({
          error: getBackendError(
            error,
            "Unable to delete meetings.",
          ),
        });
      } finally {
        set({
          isDeleting: false,
        });
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  }),
);

export default useSchedulerStore;