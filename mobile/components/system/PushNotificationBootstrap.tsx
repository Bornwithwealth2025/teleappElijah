import React, { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { router, type Href } from "expo-router";

import PushNotificationService from "@/api/push-notification.service";
import { getExpoPushToken } from "@/services/push-notifications";
import useAuthStore from "@/store/authStore";

function getSafeNotificationRoute(
  notification: Notifications.Notification,
): Href | null {
  const route = notification.request.content.data?.url;

  if (
    typeof route !== "string" ||
    !route.startsWith("/") ||
    route.startsWith("//")
  ) {
    return null;
  }

  return route as Href;
}

export function PushNotificationBootstrap() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const registeredUserId = useRef<string | null>(null);

  useEffect(() => {
    const userId = String(user?.id ?? "").trim();

    if (!isAuthenticated || !userId) {
      registeredUserId.current = null;
      return;
    }

    if (registeredUserId.current === userId) {
      return;
    }

    let cancelled = false;

    async function registerDevice() {
      try {
        const expoPushToken = await getExpoPushToken();

        if (cancelled || !expoPushToken) {
          return;
        }

        if (Platform.OS !== "android" && Platform.OS !== "ios") {
          return;
        }

        await PushNotificationService.registerDevice({
          expoPushToken,
          platform: Platform.OS,
        });

        if (!cancelled) {
          registeredUserId.current = userId;
        }
      } catch (error) {
        console.warn(
          "[push] Device registration failed:",
          error,
        );
      }
    }

    void registerDevice();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    function openNotification(
      notification: Notifications.Notification,
    ) {
      const route = getSafeNotificationRoute(notification);

      if (route) {
        router.push(route);
      }
    }

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification) {
          openNotification(response.notification);
        }
      })
      .catch(() => undefined);

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          openNotification(response.notification);
        },
      );

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}