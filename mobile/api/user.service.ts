import apiClient from "@/api/client";
import type {
  DeleteMeetingRequest,
  DeleteMeetingsResponse,
  GetMeetingInboxResponse,
  GetMeetingsResponse,
  GetProfileResponse,
  ScheduleMeetingRequest,
  ScheduleMeetingResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadProfileImageResponse,
} from "@/types/user.types";

export type UploadableImage = {
  uri: string;
  name?: string;
  type?: string;
  file?: Blob;
};

async function buildImageFormData(image: UploadableImage) {
  const formData = new FormData();
  const name = image.name ?? "profile.jpg";
  const type = image.type ?? "image/jpeg";

  if (image.file) {
    formData.append("image", image.file, name);
    return formData;
  }

  if (
    typeof window !== "undefined" &&
    typeof Blob !== "undefined"
  ) {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    formData.append(
      "image",
      new Blob([blob], { type }),
      name,
    );

    return formData;
  }

  formData.append("image", {
    uri: image.uri,
    name,
    type,
  } as any);

  return formData;
}

const UserService = {
  async getProfile(): Promise<GetProfileResponse> {
    const { data } =
      await apiClient.get<GetProfileResponse>(
        "/user/mobile/profile",
      );

    return data;
  },

  async updateProfile(
    payload: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> {
    const { data } = await apiClient.patch<UpdateProfileResponse>(
      "/user/profile",
      payload,
    );

    return data;
  },

  async scheduleMeeting(
    payload: ScheduleMeetingRequest,
  ): Promise<ScheduleMeetingResponse> {
    const { data } =
      await apiClient.post<ScheduleMeetingResponse>(
        "/user/schedule-meeting",
        payload,
      );

    return data;
  },

  async startInstantMeeting(payload: {
    path: string;
    timeZone: string;
    des?: string;
  }) {
    const { data } = await apiClient.post(
      "/user/start-meeting",
      payload,
    );

    return data;
  },

  async updateMeetingLifecycle(
    roomId: string,
    action: "start" | "end",
  ) {
    const { data } = await apiClient.patch(
      `/user/meetings/room/${encodeURIComponent(roomId)}/lifecycle`,
      { action },
    );

    return data;
  },

  async getMeetings(): Promise<GetMeetingsResponse> {
    const { data } =
      await apiClient.get<GetMeetingsResponse>(
        "/user/get-meeting",
      );

    return data;
  },

  async getMeetingInbox(): Promise<GetMeetingInboxResponse> {
    const { data } = await apiClient.get<GetMeetingInboxResponse>(
      "/user/mobile/meeting-inbox",
    );

    return data;
  },

  async deleteMeetings(
    payload: DeleteMeetingRequest,
  ): Promise<DeleteMeetingsResponse> {
    const { data } =
      await apiClient.post<DeleteMeetingsResponse>(
        "/user/delete-meeting",
        payload,
      );

    return data;
  },

  async uploadProfileImage(
    image: UploadableImage,
  ): Promise<UploadProfileImageResponse> {
    const formData = await buildImageFormData(image);

    const { data } =
      await apiClient.post<UploadProfileImageResponse>(
        "/user/upload-file",
        formData,
        {
          headers: {
            Accept: "application/json"
          },
        },
      );

    return data;
  },
};

export default UserService;