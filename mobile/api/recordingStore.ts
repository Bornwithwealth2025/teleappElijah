import { create } from "zustand";

import RecordingService, {
  type Recording,
  type RecordingStatus,
} from "@/api/recording.service";
import { ConfMeetingSocketCommands } from "@/services/confMeetingSocket";

type RecordingSocketData = {
  recordingId?: string;
  roomId?: string;
  fileName?: string;
  mimeType?: string;
  startedAt?: string;
  stoppedAt?: string;
  finalizing?: boolean;
};

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
  setRecordingStarted: (payload: RecordingSocketData) => void;
  setRecordingStopped: (payload: RecordingSocketData) => void;
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
  recordings: [] as Recording[],
  isLoading: false,
};

function getMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

function getData(payload: unknown): RecordingSocketData {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const value = payload as {
    data?: RecordingSocketData;
    recording?: RecordingSocketData;
  };

  return value.data ?? value.recording ?? (payload as RecordingSocketData);
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

      const data = getData(response);

      set({
        status: "recording",
        recordingId: data.recordingId ?? null,
        roomId: data.roomId ?? roomId,
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

      const data = getData(response);

      set({
        status: "processing",
        recordingId: data.recordingId ?? null,
        roomId: data.roomId ?? roomId,
        fileName: data.fileName ?? null,
        mimeType: data.mimeType ?? "video/mp4",
        stoppedAt: data.stoppedAt ?? new Date().toISOString(),
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
    const data = getData(payload);

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
    const data = getData(payload);

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
      const recordings = await RecordingService.listRecordings();

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
      return await RecordingService.getRecording(recordingId);
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