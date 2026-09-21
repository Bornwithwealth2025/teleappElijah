import React from "react";
import { router } from "expo-router";
import {
  ArrowLeft,
  Link2,
  ShieldCheck,
  Video,
} from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import {
  getRoomIdFromMeetingUrl,
  isValidMeetingRoomId,
} from "@/utils/meetingLinks";

export default function JoinMeetingScreen() {
  const { colors } = useAppTheme();

  const [meetingLink, setMeetingLink] = React.useState("");
  const [error, setError] = React.useState("");

  function handleJoin() {
    const roomId = getRoomIdFromMeetingUrl(meetingLink);

    if (!isValidMeetingRoomId(roomId)) {
      setError(
        "Paste a valid Telefya meeting link or room code.",
      );
      return;
    }

    setError("");

    router.push({
      pathname: "/meeting/[meetingId]",
      params: { meetingId: roomId },
    });
  }

  return (
    <AppScreen
      tone="aurora"
      scroll={false}
      contentStyle={styles.content}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <AppHeader
          eyebrow="JOIN A MEETING"
          title="Enter a secure room"
          subtitle="Paste a Telefya meeting link or enter the room code shared by the host."
          size="page"
          leftSlot={
            <IconButton
              icon={<ArrowLeft color={colors.text} size={20} />}
              variant="soft"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            />
          }
        />

        <AppCard elevated style={styles.card}>
          <View
            style={[
              styles.iconShell,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Video color={colors.primary} size={25} />
          </View>

          <View style={styles.cardCopy}>
            <AppText variant="sectionTitle">
              Join with a meeting link
            </AppText>

            <AppText variant="caption" tone="muted">
              You will request access from the host before entering the room.
            </AppText>
          </View>

          <View
            style={[
              styles.inputShell,
              {
                backgroundColor: colors.surface,
                borderColor: error
                  ? colors.danger
                  : colors.border,
              },
            ]}
          >
            <Link2 color={colors.primary} size={20} />

            <TextInput
              value={meetingLink}
              onChangeText={(value) => {
                setMeetingLink(value);
                setError("");
              }}
              placeholder="https://telefya.com/live/..."
              placeholderTextColor={colors.textSoft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleJoin}
              accessibilityLabel="Meeting link or room code"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {error ? (
            <AppText
              variant="caption"
              style={{ color: colors.danger, fontWeight: "700" }}
            >
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Request to join"
            leftIcon={<ShieldCheck color="#FFFFFF" size={18} />}
            onPress={handleJoin}
          />
        </AppCard>

        <View
          style={[
            styles.notice,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}26`,
            },
          ]}
        >
          <ShieldCheck color={colors.primary} size={19} />

          <AppText
            variant="caption"
            style={{ color: colors.primaryDeep, flex: 1 }}
          >
            The host controls who enters the meeting. You will remain in the waiting room until admitted.
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  keyboard: {
    width: "100%",
    gap: Spacing.five,
  },
  card: {
    gap: Spacing.four,
  },
  iconShell: {
    width: 54,
    height: 54,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: {
    gap: 3,
  },
  inputShell: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
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