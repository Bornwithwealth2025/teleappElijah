import React from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import {
  Clock,
  Link as LinkIcon,
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

export default function MeetingDefaultsScreen() {
  const { colors } = useAppTheme();

  const [duration, setDuration] = React.useState("45 minutes");
  const [roomName, setRoomName] = React.useState("");
  const [cameraEnabled, setCameraEnabled] = React.useState(true);
  const [autoCreateLink, setAutoCreateLink] =
    React.useState(true);

  function handleSave() {
    Alert.alert(
      "Defaults updated",
      "These preferences are active for this app session. Server persistence will be connected when the workspace settings API is available.",
    );
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        eyebrow="SETTINGS"
        title="Meeting defaults"
        subtitle="Configure how new Telefya rooms should begin."
      />

      <AppCard
        variant="tinted"
        style={styles.heroCard}
      >
        <View
          style={[
            styles.heroIcon,
            { backgroundColor: colors.primary },
          ]}
        >
          <Video color="#FFFFFF" size={22} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyStrong">
            Your meeting preferences
          </AppText>

          <AppText variant="caption" tone="muted">
            These settings are used when you create a new room on this device.
          </AppText>
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.fields}>
          <AppTextInput
            label="Default meeting duration"
            value={duration}
            onChangeText={setDuration}
            placeholder="45 minutes"
            leftSlot={
              <Clock
                color={colors.textSoft}
                size={18}
              />
            }
          />

          <AppTextInput
            label="Default room name"
            value={roomName}
            onChangeText={setRoomName}
            placeholder="My Telefya room"
            leftSlot={
              <LinkIcon
                color={colors.textSoft}
                size={18}
              />
            }
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.copy}>
            <AppText variant="bodyStrong">
              Camera on by default
            </AppText>

            <AppText variant="caption" tone="muted">
              Start meetings with video enabled.
            </AppText>
          </View>

          <Switch
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
            trackColor={{
              false: colors.border,
              true: colors.primarySoft,
            }}
            thumbColor={
              cameraEnabled
                ? colors.primary
                : colors.textSoft
            }
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.copy}>
            <AppText variant="bodyStrong">
              Auto-create meeting link
            </AppText>

            <AppText variant="caption" tone="muted">
              Generate a shareable link when scheduling a room.
            </AppText>
          </View>

          <Switch
            value={autoCreateLink}
            onValueChange={setAutoCreateLink}
            trackColor={{
              false: colors.border,
              true: colors.primarySoft,
            }}
            thumbColor={
              autoCreateLink
                ? colors.primary
                : colors.textSoft
            }
          />
        </View>

        <AppButton
          title="Save defaults"
          onPress={handleSave}
          containerStyle={styles.action}
        />
      </AppCard>

      <AppCard
        variant="soft"
        compact
        style={styles.infoCard}
      >
        <Video
          color={colors.primary}
          size={20}
        />

        <AppText
          variant="caption"
          tone="muted"
          style={styles.infoText}
        >
          Camera and microphone permissions are requested securely when you
          join a meeting.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    gap: Spacing.four,
  },

  fields: {
    gap: Spacing.three,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.four,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  action: {
    marginTop: Spacing.one,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  infoText: {
    flex: 1,
    lineHeight: 20,
  },
});