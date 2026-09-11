import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import {
  CircleStop,
  Radio,
  Video,
} from "lucide-react-native";

import { RecordingStatusBadge } from "@/components/meeting/RecordingStatusBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useMeetingStore from "@/store/meetingStore";
import useRecordingStore from "@/store/recordingStore";

export function RecordingControls() {
  const { colors } = useAppTheme();

  const roomId = useMeetingStore((state) => state.roomId);
  const isHost = useMeetingStore((state) => state.isHost);

  const status = useRecordingStore((state) => state.status);
  const isStarting = useRecordingStore(
    (state) => state.isStarting,
  );
  const isStopping = useRecordingStore(
    (state) => state.isStopping,
  );
  const error = useRecordingStore((state) => state.error);
  const startRecording = useRecordingStore(
    (state) => state.startRecording,
  );
  const stopRecording = useRecordingStore(
    (state) => state.stopRecording,
  );

  const pulse = useRef(new Animated.Value(1)).current;

  const isRecording = status === "recording";
  const isProcessing = status === "processing";

  useEffect(() => {
    if (!isRecording) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.16,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 720,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isRecording, pulse]);

  if (!isHost || !roomId) {
    return null;
  }

  const description = isRecording
    ? "This meeting is being recorded. Participants can see the recording indicator."
    : isProcessing
      ? "Your previous recording is being prepared and saved."
      : "Start a recording for this meeting. It will appear in your library when ready.";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isRecording
            ? `${colors.danger}45`
            : colors.glassBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: isRecording
                ? `${colors.danger}16`
                : colors.primarySoft,
            },
          ]}
        >
          {isRecording ? (
            <Animated.View
              style={[
                styles.recordingDot,
                {
                  backgroundColor: colors.danger,
                  transform: [{ scale: pulse }],
                },
              ]}
            />
          ) : (
            <Video color={colors.primary} size={19} />
          )}
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <AppText variant="bodyStrong">
              Meeting recording
            </AppText>

            <RecordingStatusBadge status={status} />
          </View>

          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        </View>
      </View>

      {isRecording ? (
        <AppButton
          title={isStopping ? "Stopping recording..." : "Stop recording"}
          variant="danger"
          loading={isStopping}
          disabled={isStopping}
          leftIcon={<CircleStop color="#FFFFFF" size={18} />}
          onPress={() => void stopRecording(roomId)}
        />
      ) : (
        <AppButton
          title={
            isStarting
              ? "Starting recording..."
              : isProcessing
                ? "Recording processing..."
                : "Start recording"
          }
          loading={isStarting}
          disabled={isStarting || isProcessing}
          leftIcon={<Radio color="#FFFFFF" size={18} />}
          onPress={() => void startRecording(roomId)}
        />
      )}

      {error ? (
        <View
          style={[
            styles.errorNotice,
            {
              backgroundColor: `${colors.danger}10`,
              borderColor: `${colors.danger}32`,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: colors.danger, fontWeight: "700" }}
          >
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  iconShell: {
    width: 44,
    height: 44,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingDot: {
    width: 13,
    height: 13,
    borderRadius: Radius.pill,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  errorNotice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
});