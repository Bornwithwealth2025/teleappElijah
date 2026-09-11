import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const MEETING_NOTIFICATION_CHANNEL = "meetings";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getEasProjectId() {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    null
  );
}

export async function getExpoPushToken() {
  if (Platform.OS === "web") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      MEETING_NOTIFICATION_CHANNEL,
      {
        name: "Meetings",
        description:
          "Meeting invitations, reminders, recordings, and waiting-room updates.",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: "#0F6BFF",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      },
    );
  }

  const permissions =
    await Notifications.getPermissionsAsync();

  let status = permissions.status;

  if (status !== "granted") {
    const requested =
      await Notifications.requestPermissionsAsync();

    status = requested.status;
  }

  if (status !== "granted") {
    return null;
  }

  const projectId = getEasProjectId();

  if (!projectId) {
    throw new Error(
      "Expo project ID is missing from app.json.",
    );
  }

  return (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;
}