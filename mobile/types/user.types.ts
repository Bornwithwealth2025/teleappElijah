export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  status?: number;
  error?: string | boolean;
  data?: T;
}

export interface UserProfile {
  id?: string | number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  profileImage?: string | null;
  avatar?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  date_of_birth?: string | null;
  dateOfBirth?: string | null;
  profile_image?: string | null;
  is_verified: number | boolean;
  isVerified?: boolean | number;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledMeeting {
  id: number | string;
  meeting_url: string;
  shedular_user_id?: string;
  scheduler_user_id?: string;
  time_zone?: string;
  des?: string;
  created_at?: string;
  updated_at?: string;
  date?: string;
  title?: string;
  status?: string;
  scheduled_at?: string;
  start_time?: string;
  participants_count?: number;
  participants?: unknown[] | number;
}

export interface ScheduleMeetingRequest {
  date: string;
  timeZone: string;
  path: string;
  des?: string;
}

export interface ScheduleMeetingData {
  id?: number | string;
  meeting_url: string;
  time_zone?: string;
  shedular_user_id?: string;
  des?: string;
  created_at?: string;
}

export interface DeleteMeetingRequest {
  meetingIds: string[];
}

export interface UploadProfileImageResponse {
  success: boolean;
  error?: boolean | string;
  message: string;
  image?: string;
  status?: number;
  data?: {
    image?: string;
    profile_image?: string;
  };
}

export type GetProfileResponse =
  ApiResponse<UserProfile>;

export type ScheduleMeetingResponse =
  ApiResponse<ScheduleMeetingData>;

export type GetMeetingsResponse =
  ApiResponse<ScheduledMeeting[]>;

export type DeleteMeetingsResponse =
  ApiResponse<undefined>;