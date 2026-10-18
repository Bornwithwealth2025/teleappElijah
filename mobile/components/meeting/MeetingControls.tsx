import React from "react";
import {
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  Sparkles,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react-native";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Tap } from "@/components/ui/Tap";
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
  onActivity?: () => void;
  onMoreVisibilityChange?: (open: boolean) => void;
};

type Tone = "neutral" | "alert" | "subtle" | "leave";

function ControlButton({
  icon,
  label,
  tone,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  tone: Tone;
  badge?: number;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  const palette = {
    neutral: {
      bg: "rgba(255,255,255,0.14)",
      border: "rgba(255,255,255,0.22)",
      label: "#EAF1FF",
    },
    alert: {
      bg: `${colors.danger}33`,
      border: `${colors.danger}88`,
      label: "#FFB5AF",
    },
    subtle: {
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.14)",
      label: "#C9D6F2",
    },
    leave: {
      bg: `${colors.danger}26`,
      border: `${colors.danger}99`,
      label: "#FF8F86",
    },
  }[tone];

  return (
    <Tap label={label} onPress={onPress}>
      <View style={styles.item}>
        <View
          style={[
            styles.circle,
            { backgroundColor: palette.bg, borderColor: palette.border },
          ]}
        >
          {icon}

          {badge && badge > 0 ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.danger },
              ]}
            >
              <AppText style={styles.badgeText}>
                {badge > 9 ? "9+" : badge}
              </AppText>
            </View>
          ) : null}
        </View>

        <AppText
          numberOfLines={1}
          style={[styles.label, { color: palette.label }]}
        >
          {label}
        </AppText>
      </View>
    </Tap>
  );
}

function MoreAction({
  icon,
  label,
  active = false,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <Tap label={label} onPress={onPress} style={styles.moreWrap}>
      <View
        style={[
          styles.moreAction,
          {
            backgroundColor: active
              ? `${colors.primary}1F`
              : isDark
                ? "rgba(255,255,255,0.045)"
                : colors.surface,
            borderColor: active
              ? `${colors.primary}66`
              : isDark
                ? "rgba(255,255,255,0.12)"
                : colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.moreIcon,
            { backgroundColor: colors.primary },
          ]}
        >
          {icon}
        </View>

        <AppText
          numberOfLines={2}
          style={[styles.moreLabel, { color: colors.text }]}
        >
          {label}
        </AppText>

        {badge && badge > 0 ? (
          <View
            style={[
              styles.moreBadge,
              { backgroundColor: colors.danger },
            ]}
          >
            <AppText style={styles.badgeText}>
              {badge > 9 ? "9+" : badge}
            </AppText>
          </View>
        ) : null}
      </View>
    </Tap>
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
  onActivity,
  onMoreVisibilityChange,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const [moreVisible, setMoreVisible] = React.useState(false);

  function setMore(open: boolean) {
    setMoreVisible(open);
    onMoreVisibilityChange?.(open);
  }

  function act(action: () => void) {
    return () => {
      onActivity?.();
      action();
    };
  }

  function closeAndRun(action?: () => void) {
    setMore(false);
    onActivity?.();
    action?.();
  }

  return (
    <>
      <View style={styles.dock}>
        <View style={styles.mainGroup}>
          <ControlButton
            icon={
              muted ? (
                <MicOff color="#FFB5AF" size={22} />
              ) : (
                <Mic color="#FFFFFF" size={22} />
              )
            }
            label={muted ? "Unmute" : "Mute"}
            tone={muted ? "alert" : "neutral"}
            onPress={act(onToggleMute)}
          />

          <ControlButton
            icon={
              cameraOff ? (
                <VideoOff color="#FFB5AF" size={22} />
              ) : (
                <Video color="#FFFFFF" size={22} />
              )
            }
            label={cameraOff ? "Start video" : "Stop video"}
            tone={cameraOff ? "alert" : "neutral"}
            onPress={act(onToggleCamera)}
          />

          <ControlButton
            icon={<MoreHorizontal color="#DCE7FF" size={22} />}
            label="More"
            tone="subtle"
            badge={pendingRequestCount}
            onPress={act(() => setMore(true))}
          />
        </View>

        <View style={styles.divider} />

        <ControlButton
          icon={<PhoneOff color="#FF8F86" size={22} />}
          label="Leave"
          tone="leave"
          onPress={act(onLeave)}
        />
      </View>

      <Modal
        visible={moreVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMore(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setMore(false)}
            accessibilityRole="button"
            accessibilityLabel="Close more meeting actions"
          />

          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                borderColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.borderStrong },
              ]}
            />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetCopy}>
                <AppText variant="sectionTitle">
                  Meeting controls
                </AppText>
                <AppText variant="caption" tone="muted">
                  More ways to manage your call.
                </AppText>
              </View>

              <Tap
                label="Close meeting controls"
                onPress={() => setMore(false)}
              >
                <View
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : colors.surface,
                      borderColor: isDark
                        ? "rgba(255,255,255,0.16)"
                        : colors.border,
                    },
                  ]}
                >
                  <X color={colors.text} size={19} />
                </View>
              </Tap>
            </View>

            <View style={styles.moreList}>
              <MoreAction
                icon={<Users color="#FFFFFF" size={21} />}
                label={`${participantCount} participant${
                  participantCount === 1 ? "" : "s"
                }`}
                badge={pendingRequestCount}
                onPress={() => closeAndRun(onOpenParticipants)}
              />

              <MoreAction
                icon={<MessageCircle color="#FFFFFF" size={21} />}
                label="Chat"
                onPress={() => closeAndRun(onOpenChat)}
              />

              <MoreAction
                icon={<Sparkles color="#FFFFFF" size={21} />}
                label="Video effects"
                onPress={() => closeAndRun(onOpenBackgroundEffects)}
              />

              <MoreAction
                icon={<Hand color="#FFFFFF" size={21} />}
                label={handRaised ? "Lower hand" : "Raise hand"}
                active={handRaised}
                onPress={() => closeAndRun(onToggleHand)}
              />

              {onToggleScreenShare ? (
                <MoreAction
                  icon={<MonitorUp color="#FFFFFF" size={21} />}
                  label={
                    screenSharing
                      ? "Stop screen sharing"
                      : "Share screen"
                  }
                  active={screenSharing}
                  onPress={() => closeAndRun(onToggleScreenShare)}
                />
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "rgba(7, 18, 41, 0.94)",
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
    elevation: 16,
  },

  mainGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.one,
  },

  divider: {
    width: 1,
    height: 52,
    marginHorizontal: Spacing.one,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  item: {
    width: 64,
    alignItems: "center",
    gap: 6,
  },

  circle: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2, 6, 24, 0.62)",
  },

  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.four,
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  sheetCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  moreList: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.two,
  },

  moreWrap: {
    width: "48.5%",
  },

  moreAction: {
    width: "100%",
    height: 112,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  moreIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  moreLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },

  moreBadge: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});