import { create } from "zustand";

import RecordingService, {
  Recording,
  RecordingStatus,
} from "@/api/recording.service";
import { ConfMeetingSocketCommands } from "@/services/confMeetingSocket";

type RecordingState = {
  status: RecordingStatus | "idle";
  recordingId: string | null;
  roomId: string | null;
  fileName: string | null;
  mimeType: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  error: string | null;
  isStarting: boolean;
  isStopping: boolean;
  recordings: Recording[];
  isLoading: boolean;

  startRecording: (roomId: string) => Promise<void>;
  stopRecording: (roomId: string) => Promise<void>;
  setRecordingStarted: (payload: any) => void;
  setRecordingStopped: (payload: any) => void;
  setRecordingFailed: (message: string) => void;
  fetchRecordings: () => Promise<void>;
  fetchRecording: (recordingId: string) => Promise<Recording | null>;
  clearError: () => void;
  reset: () => void;
};

const initialState = {
  status: "idle" as const,
  recordingId: null,
  roomId: null,
  fileName: null,
  mimeType: null,
  startedAt: null,
  stoppedAt: null,
  error: null,
  isStarting: false,
  isStopping: false,
  recordings: [],
  isLoading: false,
};

function getMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

const useRecordingStore = create<RecordingState>((set) => ({
  ...initialState,

  startRecording: async (roomId) => {
    if (!roomId) return;

    set({
      isStarting: true,
      error: null,
      roomId,
    });

    try {
      const response = await ConfMeetingSocketCommands.startRecording({
        roomId,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to start recording.");
      }

      const data = response.data ?? {};

      set({
        status: "recording",
        recordingId: data.recordingId ?? null,
        roomId,
        fileName: data.fileName ?? null,
        mimeType: data.mimeType ?? "video/mp4",
        startedAt: data.startedAt ?? new Date().toISOString(),
        stoppedAt: null,
        error: null,
      });
    } catch (error) {
      set({
        status: "failed",
        error: getMessage(error, "Unable to start recording."),
      });
      throw error;
    } finally {
      set({ isStarting: false });
    }
  },

  stopRecording: async (roomId) => {
    if (!roomId) return;

    set({
      isStopping: true,
      error: null,
    });

    try {
      const response = await ConfMeetingSocketCommands.stopRecording({
        roomId,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to stop recording.");
      }

      const data = response.data ?? {};

      set({
        status: "processing",
        recordingId: data.recordingId ?? undefined,
        roomId,
        fileName: data.fileName ?? undefined,
        mimeType: data.mimeType ?? "video/mp4",
        stoppedAt: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      set({
        status: "failed",
        error: getMessage(error, "Unable to stop recording."),
      });
      throw error;
    } finally {
      set({ isStopping: false });
    }
  },

  setRecordingStarted: (payload) => {
    const data = payload?.data ?? payload ?? {};

    set({
      status: "recording",
      recordingId: data.recordingId ?? null,
      roomId: data.roomId ?? null,
      fileName: data.fileName ?? null,
      mimeType: data.mimeType ?? "video/mp4",
      startedAt: data.startedAt ?? new Date().toISOString(),
      stoppedAt: null,
      error: null,
    });
  },

  setRecordingStopped: (payload) => {
    const data = payload?.data ?? payload ?? {};

    set({
      status: "processing",
      recordingId: data.recordingId ?? null,
      roomId: data.roomId ?? null,
      fileName: data.fileName ?? null,
      mimeType: data.mimeType ?? "video/mp4",
      stoppedAt: data.stoppedAt ?? new Date().toISOString(),
      error: null,
    });
  },

  setRecordingFailed: (message) => {
    set({
      status: "failed",
      error: message || "Recording failed.",
    });
  },

  fetchRecordings: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await RecordingService.listRecordings();

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load recordings.");
      }

      const recordings =
        response.data?.recordings ??
        response.data ??
        [];

      set({
        recordings: Array.isArray(recordings) ? recordings : [],
      });
    } catch (error) {
      set({
        error: getMessage(error, "Unable to load recordings."),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecording: async (recordingId) => {
    try {
      const response = await RecordingService.getRecording(recordingId);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load recording.");
      }

      return response.data ?? null;
    } catch (error) {
      set({
        error: getMessage(error, "Unable to load recording."),
      });

      return null;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

export default useRecordingStore;