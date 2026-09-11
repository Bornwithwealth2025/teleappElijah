import apiClient from "@/api/client";

export type RegisterPushDevicePayload = {
  expoPushToken: string;
  platform: "android" | "ios";
};

const PushNotificationService = {
  async registerDevice(payload: RegisterPushDevicePayload) {
    const response = await apiClient.post(
      "/user/push-devices",
      payload,
    );

    return response.data;
  },

  async unregisterDevice(expoPushToken: string) {
    const response = await apiClient.delete(
      "/user/push-devices",
      {
        data: { expoPushToken },
      },
    );

    return response.data;
  },
};

export default PushNotificationService;