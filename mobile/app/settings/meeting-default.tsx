import React from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import {
  Clock3,
  Link2,
  Video,
} from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import usePreferencesStore from "@/store/preferencesStore";

type PreferenceRowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function PreferenceRow({
  title,
  description,
  value,
  onValueChange,
}: PreferenceRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.preferenceRow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.preferenceCopy}>
        <AppText variant="bodyStrong">{title}</AppText>

        <AppText variant="caption" tone="muted">
          {description}
        </AppText>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.borderStrong,
          true: colors.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function MeetingDefaultsScreen() {
  const { colors } = useAppTheme();

  const user = useAuthStore((state) => state.user);

  const meeting = usePreferencesStore((state) => state.meeting);
  const isReady = usePreferencesStore((state) => state.isReady);
  const initialize = usePreferencesStore((state) => state.initialize);
  const updateMeetingDefaults = usePreferencesStore(
    (state) => state.updateMeetingDefaults,
  );

  const [duration, setDuration] = React.useState(
    String(meeting.durationMinutes),
  );
  const [roomName, setRoomName] = React.useState(meeting.roomName);
  const [cameraEnabled, setCameraEnabled] = React.useState(
    meeting.cameraEnabled,
  );
  const [autoCreateLink, setAutoCreateLink] = React.useState(
    meeting.autoCreateLink,
  );

  React.useEffect(() => {
    void initialize(
      String(user?.id ?? user?.user_id ?? user?.email ?? "guest"),
    );
  }, [initialize, user?.email, user?.id, user?.user_id]);

  React.useEffect(() => {
    if (!isReady) {
      return;
    }

    setDuration(String(meeting.durationMinutes));
    setRoomName(meeting.roomName);
    setCameraEnabled(meeting.cameraEnabled);
    setAutoCreateLink(meeting.autoCreateLink);
  }, [isReady, meeting]);

  async function handleSave() {
    const parsedDuration = Number.parseInt(duration, 10);

    if (
      !Number.isFinite(parsedDuration) ||
      parsedDuration < 1 ||
      parsedDuration > 1440
    ) {
      Alert.alert(
        "Invalid duration",
        "Enter a duration between 1 and 1,440 minutes.",
      );
      return;
    }

    await updateMeetingDefaults({
      durationMinutes: parsedDuration,
      roomName: roomName.trim(),
      cameraEnabled,
      autoCreateLink,
    });

    Alert.alert(
      "Defaults saved",
      "Your preferences will be used when you create meetings on this device.",
    );
  }

  return (
    <AppScreen tone="aurora" contentStyle={styles.content}>
      <AppHeader
        eyebrow="MEETING EXPERIENCE"
        title="Meeting defaults"
        subtitle="Set how your next Telefya meeting begins."
        size="page"
      />

      <AppCard elevated style={styles.heroCard}>
        <View
          style={[
            styles.heroIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Video color={colors.primary} size={23} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyStrong">
            Personal meeting setup
          </AppText>

          <AppText variant="caption" tone="muted">
            These settings apply before you join or create a meeting.
          </AppText>
        </View>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          DEFAULTS
        </AppText>

        <AppCard style={styles.formCard}>
          <AppTextInput
            label="Default meeting duration"
            value={duration}
            onChangeText={setDuration}
            placeholder="45"
            keyboardType="number-pad"
            leftSlot={<Clock3 color={colors.textSoft} size={18} />}
          />

          <AppText
            variant="caption"
            tone="muted"
            style={styles.inputHint}
          >
            Enter a duration from 1 minute up to 24 hours.
          </AppText>

          <AppTextInput
            label="Default room name"
            value={roomName}
            onChangeText={setRoomName}
            placeholder="My Telefya room"
            leftSlot={<Link2 color={colors.textSoft} size={18} />}
          />
        </AppCard>
      </View>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          JOINING PREFERENCES
        </AppText>

        <View style={styles.preferenceList}>
          <PreferenceRow
            title="Camera on by default"
            description="Start meetings with your camera enabled."
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
          />

          <PreferenceRow
            title="Create a shareable link"
            description="Generate a meeting link when scheduling a room."
            value={autoCreateLink}
            onValueChange={setAutoCreateLink}
          />
        </View>
      </View>

      <View
        style={[
          styles.notice,
          {
            backgroundColor: colors.secondarySoft,
            borderColor: `${colors.secondary}26`,
          },
        ]}
      >
        <Video color={colors.secondary} size={19} />

        <AppText
          variant="caption"
          style={{ color: colors.textMuted, flex: 1 }}
        >
          Camera and microphone access are requested only when you enter a live meeting.
        </AppText>
      </View>

      <AppButton
        title={isReady ? "Save meeting defaults" : "Loading preferences..."}
        disabled={!isReady}
        onPress={() => void handleSave()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  section: {
    gap: Spacing.two,
  },
  formCard: {
    gap: Spacing.three,
  },
  inputHint: {
    marginTop: -Spacing.two,
  },
  preferenceList: {
    gap: Spacing.two,
  },
  preferenceRow: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  preferenceCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  notice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});