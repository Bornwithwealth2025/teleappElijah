import apiClient from "@/api/client";

export type NotificationPreferences = {
  reminders: boolean;
  invitations: boolean;
  waitingRoom: boolean;
  recordings: boolean;
};

const NotificationPreferencesService = {
  async get() {
    const response = await apiClient.get<{
      success: boolean;
      data: NotificationPreferences;
    }>("/user/notification-preferences");

    return response.data.data;
  },

  async update(
    preferences: NotificationPreferences,
  ) {
    const response = await apiClient.put<{
      success: boolean;
      data: NotificationPreferences;
    }>("/user/notification-preferences", preferences);

    return response.data.data;
  },
};

export default NotificationPreferencesService;