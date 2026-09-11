import React from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import {
  Bell,
  CalendarClock,
  Mail,
  ShieldCheck,
} from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import usePreferencesStore from "@/store/preferencesStore";

type NotificationKey =
  | "reminders"
  | "invitations"
  | "waitingRoom"
  | "recordings";

type NotificationOption = {
  key: NotificationKey;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function NotificationPreferencesScreen() {
  const { colors } = useAppTheme();

  const user = useAuthStore((state) => state.user);

  const preferences = usePreferencesStore(
    (state) => state.notifications,
  );
  const initialize = usePreferencesStore(
    (state) => state.initialize,
  );
  const updateNotificationPreferences = usePreferencesStore(
    (state) => state.updateNotificationPreferences,
  );

  React.useEffect(() => {
    void initialize(
      String(user?.id ?? user?.user_id ?? user?.email ?? "guest"),
    );
  }, [initialize, user?.email, user?.id, user?.user_id]);

  const options: NotificationOption[] = [
    {
      key: "reminders",
      title: "Meeting reminders",
      description:
        "Get notified before scheduled meetings start.",
      icon: (
        <CalendarClock
          color={colors.primary}
          size={20}
        />
      ),
    },
    {
      key: "invitations",
      title: "Room invitations",
      description:
        "Receive alerts when someone shares a room with you.",
      icon: (
        <Mail
          color={colors.primary}
          size={20}
        />
      ),
    },
    {
      key: "waitingRoom",
      title: "Waiting room requests",
      description:
        "Get alerted when a participant is waiting for approval.",
      icon: (
        <Bell
          color={colors.primary}
          size={20}
        />
      ),
    },
    {
      key: "recordings",
      title: "Recording ready",
      description:
        "Get notified when a meeting recording is ready.",
      icon: (
        <Mail
          color={colors.primary}
          size={20}
        />
      ),
    },
  ];

  function togglePreference(key: NotificationKey) {
    void updateNotificationPreferences({
      [key]: !preferences[key],
    });
  }

function handleSave() {
  Alert.alert(
    "Preferences saved",
    "Your notification choices now apply across your signed-in devices.",
  );
}

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        eyebrow="SETTINGS"
        title="Notifications"
        subtitle="Choose how Telefya keeps you informed."
      />

      <AppCard
        variant="tinted"
        style={styles.introCard}
      >
        <View
          style={[
            styles.introIcon,
            { backgroundColor: colors.primary },
          ]}
        >
          <ShieldCheck color="#FFFFFF" size={21} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyStrong">
            Stay informed, not interrupted
          </AppText>

          <AppText variant="caption" tone="muted">
            Choose the alerts that matter to your day.
          </AppText>
        </View>
      </AppCard>

      <View style={styles.list}>
        {options.map((option) => {
          const enabled = preferences[option.key];

          return (
            <AppCard
              key={option.key}
              variant="soft"
              style={styles.optionCard}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: enabled
                      ? colors.primarySoft
                      : colors.surfaceStrong,
                  },
                ]}
              >
                {option.icon}
              </View>

              <View style={styles.copy}>
                <AppText variant="bodyStrong">
                  {option.title}
                </AppText>

                <AppText variant="caption" tone="muted">
                  {option.description}
                </AppText>
              </View>

              <Switch
                value={enabled}
                onValueChange={() =>
                  togglePreference(option.key)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primarySoft,
                }}
                thumbColor={
                  enabled
                    ? colors.primary
                    : colors.textSoft
                }
              />
            </AppCard>
          );
        })}
      </View>

      <AppButton
        title="Save preferences"
        onPress={handleSave}
        containerStyle={styles.saveButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    gap: Spacing.three,
  },

  optionCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  saveButton: {
    marginTop: Spacing.two,
  },
});