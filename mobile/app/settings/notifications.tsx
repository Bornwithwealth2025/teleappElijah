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
  Radio,
} from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
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
  const initialize = usePreferencesStore((state) => state.initialize);
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
      description: "Receive reminders before scheduled meetings start.",
      icon: <CalendarClock color={colors.primary} size={20} />,
    },
    {
      key: "invitations",
      title: "Meeting invitations",
      description: "Know when a Telefya room is shared with you.",
      icon: <Mail color={colors.secondary} size={20} />,
    },
    {
      key: "waitingRoom",
      title: "Waiting room requests",
      description: "Hosts are alerted when someone requests to join.",
      icon: <Bell color={colors.success} size={20} />,
    },
    {
      key: "recordings",
      title: "Recording ready",
      description: "Get an alert when your recording is available.",
      icon: <Radio color={colors.primary} size={20} />,
    },
  ];

  function togglePreference(key: NotificationKey) {
    void updateNotificationPreferences({
      [key]: !preferences[key],
    });
  }

  function showSavedMessage() {
    Alert.alert(
      "Preferences updated",
      "Your notification preferences have been saved on this device.",
    );
  }

  const enabledCount = options.filter(
    (option) => preferences[option.key],
  ).length;

  return (
    <AppScreen tone="aurora" contentStyle={styles.content}>
      <AppHeader
        eyebrow="MEETING ALERTS"
        title="Notifications"
        subtitle="Control the moments Telefya should bring to your attention."
        size="page"
      />

      <AppCard elevated style={styles.summaryCard}>
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Bell color={colors.primary} size={23} />
        </View>

        <View style={styles.summaryCopy}>
          <AppText variant="bodyStrong">
            {enabledCount} of {options.length} alerts enabled
          </AppText>

          <AppText variant="caption" tone="muted">
            Changes are saved immediately when you switch an alert on or off.
          </AppText>
        </View>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          ALERT TYPES
        </AppText>

        <View style={styles.optionList}>
          {options.map((option) => {
            const enabled = preferences[option.key];

            return (
              <View
                key={option.key}
                style={[
                  styles.option,
                  {
                    backgroundColor: colors.card,
                    borderColor: enabled
                      ? `${colors.primary}38`
                      : colors.border,
                  },
                ]}
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

                <View style={styles.optionCopy}>
                  <AppText variant="bodyStrong">
                    {option.title}
                  </AppText>

                  <AppText variant="caption" tone="muted">
                    {option.description}
                  </AppText>
                </View>

                <Switch
                  value={enabled}
                  onValueChange={() => togglePreference(option.key)}
                  trackColor={{
                    false: colors.borderStrong,
                    true: colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel={`Toggle ${option.title}`}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.infoNotice,
          {
            backgroundColor: colors.secondarySoft,
            borderColor: `${colors.secondary}25`,
          },
        ]}
      >
        <Radio color={colors.secondary} size={19} />

        <AppText
          variant="caption"
          style={{ color: colors.textMuted, flex: 1 }}
        >
          To receive alerts, allow notifications for Telefya in your device settings.
        </AppText>
      </View>

      <AppText
        variant="caption"
        style={[styles.savedText, { color: colors.primary }]}
        onPress={showSavedMessage}
      >
        Your notification preferences are saved automatically.
      </AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  section: {
    gap: Spacing.two,
  },
  optionList: {
    gap: Spacing.two,
  },
  option: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  infoNotice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  savedText: {
    textAlign: "center",
    fontWeight: "800",
  },
});