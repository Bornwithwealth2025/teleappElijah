import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import {
  CircleAlert,
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
  const { colors, isDark } = useAppTheme();

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
          toValue: 1.18,
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

    return () => animation.stop();
  }, [isRecording, pulse]);

  if (!isHost || !roomId) {
    return null;
  }

  const description = isRecording
    ? "Recording is live and visible to all participants."
    : isProcessing
      ? "Your last recording is being prepared for the library."
      : "Capture this meeting for replay, download, and sharing.";

  const actionTitle = isRecording
    ? isStopping
      ? "Stopping recording..."
      : "Stop recording"
    : isStarting
      ? "Starting recording..."
      : isProcessing
        ? "Recording processing..."
        : "Start recording";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.055)"
            : colors.surface,
          borderColor: isRecording
            ? `${colors.danger}52`
            : isDark
              ? "rgba(255,255,255,0.12)"
              : colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: isRecording
                ? `${colors.danger}18`
                : colors.primarySoft,
              borderColor: isRecording
                ? `${colors.danger}30`
                : `${colors.primary}24`,
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
            <Video color={colors.primary} size={18} />
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

      <AppButton
        title={actionTitle}
        variant={isRecording ? "danger" : "primary"}
        loading={isStarting || isStopping}
        disabled={isStarting || isStopping || isProcessing}
        leftIcon={
          isRecording ? (
            <CircleStop color="#FFFFFF" size={18} />
          ) : (
            <Radio color="#FFFFFF" size={18} />
          )
        }
        onPress={() => {
          if (isRecording) {
            void stopRecording(roomId);
            return;
          }

          void startRecording(roomId);
        }}
      />

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
          <CircleAlert color={colors.danger} size={16} />

          <AppText
            variant="caption"
            style={[
              styles.errorText,
              { color: colors.danger },
            ]}
          >
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  iconShell: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingDot: {
    width: 12,
    height: 12,
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
    padding: Spacing.two,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },

  errorText: {
    flex: 1,
    lineHeight: 18,
    fontWeight: "700",
  },
});