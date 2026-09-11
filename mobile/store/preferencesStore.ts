import { create } from "zustand";

import { authStorage } from "@/api/client";
import NotificationPreferencesService from "@/api/notification-preferences.service";

export type MeetingDefaults = {
  durationMinutes: number;
  roomName: string;
  cameraEnabled: boolean;
  autoCreateLink: boolean;
};

export type NotificationPreferences = {
  reminders: boolean;
  invitations: boolean;
  waitingRoom: boolean;
  recordings: boolean;
};

type PreferencesState = {
  meeting: MeetingDefaults;
  notifications: NotificationPreferences;
  isReady: boolean;
  activeUserId: string | null;

  initialize: (userId?: string | null) => Promise<void>;

  updateMeetingDefaults: (
    values: Partial<MeetingDefaults>,
  ) => Promise<void>;

  updateNotificationPreferences: (
    values: Partial<NotificationPreferences>,
  ) => Promise<void>;
};

const defaultMeeting: MeetingDefaults = {
  durationMinutes: 45,
  roomName: "",
  cameraEnabled: true,
  autoCreateLink: true,
};

const defaultNotifications: NotificationPreferences = {
  reminders: true,
  invitations: true,
  waitingRoom: true,
  recordings: true,
};

function getStorageKey(userId?: string | null) {
  const safeUserId = String(userId ?? "guest")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  return `telefya_preferences_${safeUserId || "guest"}`;
}

function isSignedInUser(userId?: string | null) {
  const value = String(userId ?? "").trim();

  return Boolean(value && value !== "guest");
}

function getDefaults() {
  return {
    meeting: { ...defaultMeeting },
    notifications: { ...defaultNotifications },
  };
}

async function readPreferences(userId?: string | null) {
  try {
    const storageKey = getStorageKey(userId);

    const raw =
      (await authStorage.getItem(storageKey)) ??
      (await authStorage.getItem(
        "telefya_preferences_active",
      ));

    if (!raw) {
      return getDefaults();
    }

    const parsed = JSON.parse(raw) as Partial<{
      meeting: Partial<MeetingDefaults>;
      notifications: Partial<NotificationPreferences>;
    }>;

    return {
      meeting: {
        ...defaultMeeting,
        ...(parsed.meeting ?? {}),
      },
      notifications: {
        ...defaultNotifications,
        ...(parsed.notifications ?? {}),
      },
    };
  } catch {
    return getDefaults();
  }
}

async function persistPreferences(
  userId: string | null,
  meeting: MeetingDefaults,
  notifications: NotificationPreferences,
) {
  const value = JSON.stringify({
    meeting,
    notifications,
  });

  await authStorage.setItem(
    getStorageKey(userId),
    value,
  );
}

const usePreferencesStore = create<PreferencesState>(
  (set, get) => ({
    ...getDefaults(),
    isReady: false,
    activeUserId: null,

    initialize: async (userId) => {
      const activeUserId = String(userId ?? "guest").trim() || "guest";

      set({
        isReady: false,
        activeUserId,
      });

      const localPreferences = await readPreferences(
        activeUserId,
      );

      set({
        ...localPreferences,
        isReady: true,
      });

      if (!isSignedInUser(activeUserId)) {
        return;
      }

      try {
        const remoteNotifications =
          await NotificationPreferencesService.get();

        const nextNotifications = {
          ...defaultNotifications,
          ...remoteNotifications,
        };

        set({
          notifications: nextNotifications,
        });

        await persistPreferences(
          activeUserId,
          get().meeting,
          nextNotifications,
        );
      } catch (error) {
        console.warn(
          "[preferences] Unable to load notification preferences:",
          error,
        );
      }
    },

    updateMeetingDefaults: async (values) => {
      const nextMeeting = {
        ...get().meeting,
        ...values,
      };

      set({
        meeting: nextMeeting,
      });

      try {
        await persistPreferences(
          get().activeUserId,
          nextMeeting,
          get().notifications,
        );
      } catch {
        // Preserve in-memory changes if local storage is unavailable.
      }
    },

    updateNotificationPreferences: async (values) => {
      const nextNotifications = {
        ...get().notifications,
        ...values,
      };

      set({
        notifications: nextNotifications,
      });

      try {
        await persistPreferences(
          get().activeUserId,
          get().meeting,
          nextNotifications,
        );
      } catch {
        // Preserve in-memory changes if local storage is unavailable.
      }

      if (!isSignedInUser(get().activeUserId)) {
        return;
      }

      try {
        const saved =
          await NotificationPreferencesService.update(
            nextNotifications,
          );

        set({
          notifications: {
            ...defaultNotifications,
            ...saved,
          },
        });
      } catch (error) {
        console.warn(
          "[preferences] Unable to save notification preferences:",
          error,
        );
      }
    },
  }),
);

export default usePreferencesStore;