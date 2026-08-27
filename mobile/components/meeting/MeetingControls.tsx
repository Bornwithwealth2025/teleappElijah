import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
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
  Users,
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
  participantCount?: number;
  pendingRequestCount?: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleHand: () => void;
  onToggleScreenShare?: () => void;
  onOpenParticipants?: () => void;
  onOpenChat?: () => void;
  onLeave: () => void;
};

type ControlTone = "neutral" | "danger" | "warning" | "active";

const TONE_STYLES: Record<
  ControlTone,
  { bg: string; fg: string }
> = {
  neutral: {
    bg: "rgba(255,255,255,0.10)",
    fg: "#F4F7FF",
  },
  danger: {
    bg: "rgba(255, 75, 62, 0.16)",
    fg: "#FF6B5E",
  },
  warning: {
    bg: "rgba(255, 176, 32, 0.18)",
    fg: "#FFC24B",
  },
  active: {
    bg: "rgba(15, 107, 255, 0.20)",
    fg: "#5B9BFF",
  },
};

function ControlButton({
  icon,
  label,
  tone = "neutral",
  badge,
  onPress,
  accessibilityLabel,
}: {
  icon: React.ReactElement<{
    color?: string;
    size?: number;
  }>;
  label: string;
  tone?: ControlTone;
  badge?: number;
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
          {
            backgroundColor: bg,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {React.cloneElement(icon, {
          color: fg,
          size: 21,
        })}

        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>
              {badge > 9 ? "9+" : badge}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      <AppText style={styles.controlLabel} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

export function MeetingControls({
  muted,
  cameraOff,
  handRaised,
  screenSharing = false,
  participantCount = 0,
  pendingRequestCount = 0,
  onToggleMute,
  onToggleCamera,
  onToggleHand,
  onToggleScreenShare,
  onOpenParticipants,
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.controlsRail}
      >
        <ControlButton
          icon={muted ? <MicOff /> : <Mic />}
          label={muted ? "Unmute" : "Mute"}
          tone={muted ? "danger" : "neutral"}
          onPress={onToggleMute}
          accessibilityLabel={
            muted ? "Unmute microphone" : "Mute microphone"
          }
        />

        <ControlButton
          icon={cameraOff ? <VideoOff /> : <Video />}
          label={cameraOff ? "Video on" : "Video off"}
          tone={cameraOff ? "danger" : "neutral"}
          onPress={onToggleCamera}
          accessibilityLabel={
            cameraOff ? "Turn camera on" : "Turn camera off"
          }
        />

        <ControlButton
          icon={<Hand />}
          label={handRaised ? "Lower hand" : "Raise hand"}
          tone={handRaised ? "warning" : "neutral"}
          onPress={onToggleHand}
          accessibilityLabel={
            handRaised ? "Lower hand" : "Raise hand"
          }
        />

        {onToggleScreenShare ? (
          <ControlButton
            icon={<MonitorUp />}
            label={screenSharing ? "Stop share" : "Share"}
            tone={screenSharing ? "active" : "neutral"}
            onPress={onToggleScreenShare}
            accessibilityLabel={
              screenSharing
                ? "Stop screen sharing"
                : "Start screen sharing"
            }
          />
        ) : null}

        <ControlButton
          icon={<Users />}
          label={
            participantCount === 1
              ? "Person"
              : "People"
          }
          tone={
            pendingRequestCount > 0
              ? "active"
              : "neutral"
          }
          badge={pendingRequestCount}
          onPress={onOpenParticipants ?? (() => undefined)}
          accessibilityLabel={`Open participants. ${participantCount} people in this meeting.`}
        />

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
            <PhoneOff color="#FFFFFF" size={21} />
          </Pressable>

          <AppText
            style={[styles.controlLabel, styles.leaveLabel]}
          >
            Leave
          </AppText>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: "100%",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },

  controlsRail: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },

  controlItem: {
    width: 58,
    alignItems: "center",
    gap: 6,
  },

  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4B3E",
    borderWidth: 2,
    borderColor: "#0A1220",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
  },

  controlLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  leaveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8362B",
    alignItems: "center",
    justifyContent: "center",
  },

  leaveLabel: {
    color: "#FF6B5E",
  },
});