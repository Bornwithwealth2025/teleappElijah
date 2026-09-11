import apiClient from "@/api/client";

export type RecordingStatus =
  | "recording"
  | "processing"
  | "ready"
  | "failed";

export type Recording = {
  recordingId: string;
  roomId?: string;
  title?: string;
  status: RecordingStatus;
  fileName?: string;
  mimeType?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  startedAt?: string;
  stoppedAt?: string;
  durationSeconds?: number;
  sizeBytes?: number;
  createdAt?: string;
};

type RecordingListResponse =
  | Recording[]
  | {
      recordings?: Recording[];
      data?: Recording[];
    };

function getBaseUrl() {
  return String(
    apiClient.defaults.baseURL ?? "",
  ).replace(/\/+$/, "");
}

function getList(
  response: RecordingListResponse,
) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.recordings ?? response.data ?? [];
}

const RecordingService = {
  async getRecording(
    recordingId: string,
  ): Promise<Recording> {
    if (!recordingId) {
      throw new Error("Recording ID is required.");
    }

    const { data } = await apiClient.get<Recording>(
      `/recordings/${encodeURIComponent(recordingId)}`,
    );

    return data;
  },

  async listRecordings(): Promise<Recording[]> {
    const { data } =
      await apiClient.get<RecordingListResponse>(
        "/user/recordings",
      );

    return getList(data).map((item: any) => ({
      recordingId:
        item.recordingId ??
        item.recording_id ??
        item.id,

      roomId: item.roomId ?? item.room_id,
      title: item.title,
      status: item.status,
      fileName: item.fileName ?? item.file_name,
      mimeType: item.mimeType ?? item.mime_type,
      fileUrl: item.fileUrl ?? item.file_url,
      thumbnailUrl:
        item.thumbnailUrl ?? item.thumbnail_url,
      startedAt: item.startedAt ?? item.started_at,
      stoppedAt: item.stoppedAt ?? item.stopped_at,
      durationSeconds:
        item.durationSeconds ?? item.duration_seconds,
      sizeBytes: item.sizeBytes ?? item.size_bytes,
      createdAt: item.createdAt ?? item.created_at,
    }));
  },

  getPlaybackUrl(recordingId: string) {
    return `${getBaseUrl()}/recordings/${encodeURIComponent(
      recordingId,
    )}/stream`;
  },

  getDownloadUrl(recordingId: string) {
    return `${getBaseUrl()}/recordings/${encodeURIComponent(
      recordingId,
    )}/download`;
  },

  getThumbnailUrl(recordingId: string) {
    return `${getBaseUrl()}/recordings/${encodeURIComponent(
      recordingId,
    )}/thumbnail`;
  },
};

export default RecordingService;