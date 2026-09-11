import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Sparkles,
  Users,
  Video,
  VideoOff,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type Props = {
  muted: boolean;
  cameraOff: boolean;
  handRaised: boolean;
  screenSharing?: boolean;
  participantCount?: number;
  pendingRequestCount?: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onOpenBackgroundEffects?: () => void;
  onToggleHand: () => void;
  onToggleScreenShare?: () => void;
  onOpenParticipants?: () => void;
  onOpenChat?: () => void;
  onLeave: () => void;
};

type ControlTone =
  | "default"
  | "danger"
  | "warning"
  | "active";

type ControlButtonProps = {
  icon: React.ReactElement<{
    color?: string;
    size?: number;
  }>;
  label: string;
  tone?: ControlTone;
  badge?: number;
  onPress: () => void;
  accessibilityLabel: string;
};

function ControlButton({
  icon,
  label,
  tone = "default",
  badge,
  onPress,
  accessibilityLabel,
}: ControlButtonProps) {
  const { colors } = useAppTheme();

  const palette = {
    default: {
      background: colors.surfaceStrong,
      foreground: colors.text,
    },
    danger: {
      background: `${colors.danger}1C`,
      foreground: colors.danger,
    },
    warning: {
      background: `${colors.warning}1C`,
      foreground: colors.warning,
    },
    active: {
      background: "transparent",
      foreground: "#FFFFFF",
    },
  }[tone];

  const buttonContent = React.cloneElement(icon, {
    color: palette.foreground,
    size: 21,
  });

  return (
    <View style={styles.controlItem}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
      >
        {tone === "active" ? (
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.controlButton}
          >
            {buttonContent}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.controlButton,
              {
                backgroundColor: palette.background,
                borderColor:
                  tone === "default"
                    ? colors.border
                    : "transparent",
                borderWidth: tone === "default" ? 1 : 0,
              },
            ]}
          >
            {buttonContent}
          </View>
        )}

        {badge && badge > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.danger,
                borderColor: colors.card,
              },
            ]}
          >
            <AppText style={styles.badgeText}>
              {badge > 9 ? "9+" : badge}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      <AppText
        numberOfLines={1}
        style={[
          styles.controlLabel,
          { color: colors.textMuted },
        ]}
      >
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
  onOpenBackgroundEffects,
  onToggleHand,
  onToggleScreenShare,
  onOpenParticipants,
  onOpenChat,
  onLeave,
}: Props) {
  const { colors, isDark } = useAppTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 17,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.dock,
        {
          backgroundColor: isDark
            ? colors.glassStrong
            : colors.card,
          borderColor: colors.glassBorder,
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
          tone={muted ? "danger" : "default"}
          onPress={onToggleMute}
          accessibilityLabel={
            muted ? "Unmute microphone" : "Mute microphone"
          }
        />

        <ControlButton
          icon={cameraOff ? <VideoOff /> : <Video />}
          label={cameraOff ? "Video on" : "Video off"}
          tone={cameraOff ? "danger" : "default"}
          onPress={onToggleCamera}
          accessibilityLabel={
            cameraOff ? "Turn camera on" : "Turn camera off"
          }
        />

        {onOpenBackgroundEffects ? (
          <ControlButton
            icon={<Sparkles color="#FFFFFF" size={20} />}
            label="Effects"
            onPress={onOpenBackgroundEffects}
            accessibilityLabel="Open camera background effects"
          />
        ) : null}

        <ControlButton
          icon={<Hand />}
          label={handRaised ? "Lower hand" : "Raise hand"}
          tone={handRaised ? "warning" : "default"}
          onPress={onToggleHand}
          accessibilityLabel={
            handRaised ? "Lower hand" : "Raise hand"
          }
        />

        {onToggleScreenShare ? (
          <ControlButton
            icon={<MonitorUp />}
            label={screenSharing ? "Stop share" : "Share"}
            tone={screenSharing ? "active" : "default"}
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
              : "default"
          }
          badge={pendingRequestCount}
          onPress={onOpenParticipants ?? (() => undefined)}
          accessibilityLabel={`Open participants. ${participantCount} people in this meeting.`}
        />

        <ControlButton
          icon={<MessageCircle />}
          label="Chat"
          onPress={onOpenChat ?? (() => undefined)}
          accessibilityLabel="Open meeting chat"
        />

        <View style={styles.controlItem}>
          <Pressable
            onPress={onLeave}
            accessibilityRole="button"
            accessibilityLabel="Leave meeting"
            style={({ pressed }) => [
              styles.leaveButton,
              {
                backgroundColor: colors.danger,
                borderColor: `${colors.danger}66`,
              },
              pressed && styles.pressed,
            ]}
          >
            <PhoneOff color="#FFFFFF" size={21} />
          </Pressable>

          <AppText
            numberOfLines={1}
            style={[
              styles.controlLabel,
              { color: colors.danger },
            ]}
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
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
  },

  controlsRail: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },

  controlItem: {
    width: 60,
    alignItems: "center",
    gap: 7,
  },

  controlButton: {
    width: 50,
    height: 50,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  controlLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
  },

  leaveButton: {
    width: 50,
    height: 50,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});