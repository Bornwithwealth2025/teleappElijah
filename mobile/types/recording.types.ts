export type RecordingStatus =
  | "idle"
  | "recording"
  | "processing"
  | "ready"
  | "failed";

export type RecordingEventBase = {
  recordingId?: string | null;
  roomId?: string | null;
  fileName?: string;
  mimeType?: string;
  startedAt?: string;
  stoppedAt?: string;
  finalizing?: boolean;
};

export type RecordingStartedPayload = RecordingEventBase & {
  recordingId: string;
  roomId: string;
};

export type RecordingStoppedPayload = RecordingEventBase & {
  roomId: string;
};

export type RecordingFailedPayload = {
  recordingId?: string;
  roomId?: string;
  message?: string;
  error?: string;
};