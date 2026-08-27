import { create } from "zustand";

import { ConfMeetingSocketCommands } from "@/services/confMeetingSocket";

export type RecordingStatus =
  | "idle"
  | "recording"
  | "processing"
  | "ready"
  | "failed";

export type RecordingState = {
  recordingId: string | null;
  roomId: string | null;
  fileName?: string;
  mimeType?: string;
  startedAt?: string;
  stoppedAt?: string;
  status: RecordingStatus;
  finalizing?: boolean;
  error: string | null;
};

type RecordingPayload = Partial<RecordingState> & {
  data?: Partial<RecordingState>;
  recording?: Partial<RecordingState>;
};

type RecordingStore = RecordingState & {
  isStarting: boolean;
  isStopping: boolean;

  startRecording: (roomId: string) => Promise<void>;
  stopRecording: (roomId: string) => Promise<void>;

  setRecordingStarted: (payload: RecordingPayload) => void;
  setRecordingStopped: (payload: RecordingPayload) => void;
  setRecordingReady: (payload: RecordingPayload) => void;
  setRecordingFailed: (message: string) => void;
  clearRecording: () => void;
};

const initialState: RecordingState = {
  recordingId: null,
  roomId: null,
  status: "idle",
  error: null,
};

function unwrapPayload(payload: RecordingPayload) {
  return {
    ...payload,
    ...(payload.data ?? {}),
    ...(payload.recording ?? {}),
  };
}

const useRecordingStore = create<RecordingStore>((set, get) => ({
  ...initialState,

  isStarting: false,
  isStopping: false,

  startRecording: async (roomId) => {
    if (!roomId || get().isStarting || get().isStopping) {
      return;
    }

    set({
      isStarting: true,
      error: null,
      roomId,
    });

    try {
      const response =
        await ConfMeetingSocketCommands.startRecording({
          roomId,
        });

      const payload = unwrapPayload(
        response as RecordingPayload,
      );

      set({
        ...payload,
        roomId,
        recordingId:
          String(payload.recordingId ?? "") || null,
        status: "recording",
        error: null,
        isStarting: false,
        isStopping: false,
      });
    } catch (error) {
      set({
        isStarting: false,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Unable to start recording.",
      });
    }
  },

  stopRecording: async (roomId) => {
    if (!roomId || get().isStopping) {
      return;
    }

    set({
      isStopping: true,
      error: null,
    });

    try {
      const response =
        await ConfMeetingSocketCommands.stopRecording({
          roomId,
        });

      const payload = unwrapPayload(
        response as RecordingPayload,
      );

      set({
        ...payload,
        roomId,
        recordingId:
          String(
            payload.recordingId ??
              get().recordingId ??
              "",
          ) || null,
        status: "processing",
        error: null,
        isStarting: false,
        isStopping: false,
      });
    } catch (error) {
      set({
        isStopping: false,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Unable to stop recording.",
      });
    }
  },

  setRecordingStarted: (payload) => {
    const normalized = unwrapPayload(payload);

    set({
      ...normalized,
      recordingId:
        String(normalized.recordingId ?? "") || null,
      status: "recording",
      error: null,
    });
  },

  setRecordingStopped: (payload) => {
    const normalized = unwrapPayload(payload);

    set({
      ...normalized,
      recordingId:
        String(
          normalized.recordingId ??
            get().recordingId ??
            "",
        ) || null,
      status: "processing",
      error: null,
    });
  },

  setRecordingReady: (payload) => {
    const normalized = unwrapPayload(payload);

    set({
      ...normalized,
      recordingId:
        String(
          normalized.recordingId ??
            get().recordingId ??
            "",
        ) || null,
      status: "ready",
      error: null,
    });
  },

  setRecordingFailed: (message) => {
    set({
      status: "failed",
      error: message || "Recording failed.",
      isStarting: false,
      isStopping: false,
    });
  },

  clearRecording: () =>
    set({
      ...initialState,
      isStarting: false,
      isStopping: false,
    }),
}));

export default useRecordingStore;