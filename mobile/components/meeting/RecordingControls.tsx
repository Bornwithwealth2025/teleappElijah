import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import {
  CircleStop,
  Radio,
} from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useMeetingStore from "@/store/meetingStore";
import useRecordingStore from "@/store/recordingStore";

import { RecordingStatusBadge } from "./RecordingStatusBadge";

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
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              {
                backgroundColor: isRecording
                  ? colors.danger
                  : colors.textSoft,
                transform: [{ scale: pulse }],
              },
            ]}
          />

          <View style={styles.titleCopy}>
            <AppText variant="bodyStrong">
              Meeting recording
            </AppText>

            <AppText variant="caption" tone="muted">
              {isRecording
                ? "This session is being recorded."
                : isProcessing
                  ? "Preparing your recording..."
                  : "Only the host can control recording."}
            </AppText>
          </View>
        </View>

        <RecordingStatusBadge status={status} />
      </View>

      {isRecording ? (
        <AppButton
          title={
            isStopping
              ? "Stopping..."
              : "Stop recording"
          }
          variant="danger"
          loading={isStopping}
          disabled={isStopping}
          leftIcon={
            <CircleStop color="#FFFFFF" size={18} />
          }
          onPress={() => void stopRecording(roomId)}
        />
      ) : (
        <AppButton
          title={
            isStarting
              ? "Starting..."
              : isProcessing
                ? "Processing..."
                : "Start recording"
          }
          loading={isStarting}
          disabled={isStarting || isProcessing}
          leftIcon={
            <Radio color="#FFFFFF" size={18} />
          }
          onPress={() => void startRecording(roomId)}
        />
      )}

      {error ? (
        <AppText
          variant="caption"
          style={[
            styles.error,
            { color: colors.danger },
          ]}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  titleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },

  titleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  error: {
    textAlign: "center",
    fontWeight: "700",
  },
});