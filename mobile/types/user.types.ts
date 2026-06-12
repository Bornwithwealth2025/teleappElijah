export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  status: number;
  error?: string | boolean;
  data?: T;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country: string;
  state: string;
  city: string;
  date_of_birth: string;
  profile_image: string | null;
  is_verified: number;
}

export interface ScheduledMeeting {
  id: number;
  meeting_url: string;
  shedular_user_id: string;
  time_zone: string;
  created_at: string;
  updated_at: string;
  date?: string;
}

export interface ScheduleMeetingRequest {
  date: string;
  timeZone: string;
  meeting_url: string;
}

export interface ScheduleMeetingData {
  meeting_url: string;
  time_zone: string;
}

export interface DeleteMeetingRequest {
  meetingIds: string[];
}

export interface UploadProfileImageResponse {
  success: boolean;
  error: boolean | string;
  message: string;
  image: string;
  status: number;
}

export type GetProfileResponse = ApiResponse<UserProfile>;
export type ScheduleMeetingResponse = ApiResponse<ScheduleMeetingData>;
export type GetMeetingsResponse = ApiResponse<ScheduledMeeting[]>;
export type DeleteMeetingsResponse = ApiResponse;