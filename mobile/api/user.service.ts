import apiClient from "@/api/client";
import {
  DeleteMeetingRequest,
  DeleteMeetingsResponse,
  GetMeetingsResponse,
  GetProfileResponse,
  ScheduleMeetingRequest,
  ScheduleMeetingResponse,
  UploadProfileImageResponse,
} from "@/types/user.types";

export type UploadableImage = {
  uri: string;
  name?: string;
  type?: string;
};

const UserService = {
  getProfile: async (): Promise<GetProfileResponse> => {
    const { data } = await apiClient.get<GetProfileResponse>("/users/profile");
    return data;
  },

  scheduleMeeting: async (
    payload: ScheduleMeetingRequest
  ): Promise<ScheduleMeetingResponse> => {
    const { data } = await apiClient.post<ScheduleMeetingResponse>(
      "/users/schedule-meeting",
      payload
    );
    return data;
  },

  getMeetings: async (): Promise<GetMeetingsResponse> => {
    const { data } = await apiClient.get<GetMeetingsResponse>(
      "/users/get-meeting"
    );
    return data;
  },

  deleteMeetings: async (
    payload: DeleteMeetingRequest
  ): Promise<DeleteMeetingsResponse> => {
    const { data } = await apiClient.post<DeleteMeetingsResponse>(
      "/users/delete-meeting",
      payload
    );
    return data;
  },

  uploadProfileImage: async (
    image: UploadableImage
  ): Promise<UploadProfileImageResponse> => {
    const formData = new FormData();

    formData.append("image", {
      uri: image.uri,
      name: image.name ?? "profile.jpg",
      type: image.type ?? "image/jpeg",
    } as any);

    const { data } = await apiClient.post<UploadProfileImageResponse>(
      "/users/upload-file",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  },
};

export default UserService;