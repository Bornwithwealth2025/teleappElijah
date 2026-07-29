import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";

type Props = {
  muted: boolean;
  cameraOff: boolean;
  handRaised: boolean;
  screenSharing?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleHand: () => void;
  onToggleScreenShare?: () => void;
  onOpenChat?: () => void;
  onLeave: () => void;
};

type ControlTone = "neutral" | "danger" | "warning" | "active";

const TONE_STYLES: Record<ControlTone, { bg: string; fg: string }> = {
  neutral: { bg: "rgba(255,255,255,0.10)", fg: "#F4F7FF" },
  danger: { bg: "rgba(255, 75, 62, 0.16)", fg: "#FF6B5E" },
  warning: { bg: "rgba(255, 176, 32, 0.18)", fg: "#FFC24B" },
  active: { bg: "rgba(15, 107, 255, 0.20)", fg: "#5B9BFF" },
};

function ControlButton({
  icon,
  label,
  tone = "neutral",
  onPress,
  accessibilityLabel,
}: {
  icon: React.ReactElement;
  label: string;
  tone?: ControlTone;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { bg, fg } = TONE_STYLES[tone];

  return (
    <View style={styles.controlItem}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.controlButton,
          { backgroundColor: bg, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        {React.cloneElement(icon, { color: fg, size: 22 })}
      </Pressable>

      <AppText style={styles.controlLabel}>{label}</AppText>
    </View>
  );
}

export function MeetingControls({
  muted,
  cameraOff,
  handRaised,
  screenSharing = false,
  onToggleMute,
  onToggleCamera,
  onToggleHand,
  onToggleScreenShare,
  onOpenChat,
  onLeave,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.dock,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <ControlButton
        icon={muted ? <MicOff /> : <Mic />}
        label={muted ? "Unmute" : "Mute"}
        tone={muted ? "danger" : "neutral"}
        onPress={onToggleMute}
        accessibilityLabel={muted ? "Unmute microphone" : "Mute microphone"}
      />

      <ControlButton
        icon={cameraOff ? <VideoOff /> : <Video />}
        label={cameraOff ? "Start video" : "Stop video"}
        tone={cameraOff ? "danger" : "neutral"}
        onPress={onToggleCamera}
        accessibilityLabel={cameraOff ? "Turn camera on" : "Turn camera off"}
      />

      <ControlButton
        icon={<Hand />}
        label={handRaised ? "Lower hand" : "Raise hand"}
        tone={handRaised ? "warning" : "neutral"}
        onPress={onToggleHand}
        accessibilityLabel={handRaised ? "Lower hand" : "Raise hand"}
      />

      {onToggleScreenShare ? (
        <ControlButton
          icon={<MonitorUp />}
          label="Share screen"
          tone={screenSharing ? "active" : "neutral"}
          onPress={onToggleScreenShare}
          accessibilityLabel={
            screenSharing ? "Stop screen share" : "Start screen share"
          }
        />
      ) : null}

      <ControlButton
        icon={<MessageCircle />}
        label="Chat"
        tone="neutral"
        onPress={onOpenChat ?? (() => undefined)}
        accessibilityLabel="Open chat"
      />

      <View style={styles.controlItem}>
        <Pressable
          onPress={onLeave}
          accessibilityRole="button"
          accessibilityLabel="Leave meeting"
          style={({ pressed }) => [
            styles.leaveButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <PhoneOff color="#FFFFFF" size={22} />
        </Pressable>

        <AppText style={[styles.controlLabel, styles.leaveLabel]}>
          Leave
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },

  controlItem: {
    alignItems: "center",
    gap: 6,
    width: 60,
  },

  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  controlLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },

  leaveButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8362B",
    alignItems: "center",
    justifyContent: "center",
  },

  leaveLabel: {
    color: "#FF6B5E",
  },
});