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
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui/AppText";
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

type ActionProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  badge?: number;
  onPress: () => void;
};

function CoreAction({
  icon,
  label,
  active = false,
  danger = false,
  badge,
  onPress,
}: ActionProps) {
  const { colors } = useAppTheme();
  const accent = danger ? colors.danger : colors.primary;

  return (
    <View style={styles.coreItem}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.coreButton,
          {
            backgroundColor: danger
              ? colors.danger
              : active
                ? `${accent}26`
                : "rgba(255,255,255,0.12)",
            borderColor: danger
              ? colors.danger
              : active
                ? `${accent}66`
                : "rgba(255,255,255,0.18)",
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {icon}

        {badge && badge > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.danger,
                borderColor: colors.background,
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
          styles.coreLabel,
          { color: danger ? "#FFB5AF" : "#EAF1FF" },
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

function MoreAction({
  icon,
  label,
  active = false,
  badge,
  onPress,
}: ActionProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.moreAction,
        {
          backgroundColor: active
            ? `${colors.primary}18`
            : colors.surface,
          borderColor: active
            ? `${colors.primary}60`
            : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.moreIcon,
          {
            backgroundColor: active
              ? colors.primary
              : `${colors.primary}1D`,
          },
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
    </Pressable>
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
  const { colors } = useAppTheme();
  const [moreVisible, setMoreVisible] = React.useState(false);

  function closeAndRun(action?: () => void) {
    setMoreVisible(false);
    action?.();
  }

  return (
    <>
      <View
        style={[
          styles.dock,
          {
            backgroundColor: "rgba(7, 18, 41, 0.90)",
            borderColor: "rgba(255,255,255,0.16)",
          },
        ]}
      >
        <CoreAction
          icon={
            muted ? (
              <MicOff color="#FFB5AF" size={21} />
            ) : (
              <Mic color="#FFFFFF" size={21} />
            )
          }
          label={muted ? "Unmute" : "Mute"}
          active={muted}
          onPress={onToggleMute}
        />

        <CoreAction
          icon={
            cameraOff ? (
              <VideoOff color="#FFB5AF" size={21} />
            ) : (
              <Video color="#FFFFFF" size={21} />
            )
          }
          label={cameraOff ? "Camera on" : "Camera"}
          active={cameraOff}
          onPress={onToggleCamera}
        />

        <CoreAction
          icon={<MoreHorizontal color="#FFFFFF" size={23} />}
          label="More"
          badge={pendingRequestCount}
          onPress={() => setMoreVisible(true)}
        />

        <CoreAction
          icon={<PhoneOff color="#FFFFFF" size={21} />}
          label="Leave"
          danger
          onPress={onLeave}
        />
      </View>

      <Modal
        visible={moreVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMoreVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setMoreVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close more meeting actions"
          />

          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
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
              <View>
                <AppText variant="sectionTitle">
                  Meeting controls
                </AppText>
                <AppText variant="caption" tone="muted">
                  More ways to manage your call.
                </AppText>
              </View>

              <Pressable
                onPress={() => setMoreVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close meeting controls"
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.surface },
                ]}
              >
                <X color={colors.text} size={19} />
              </Pressable>
            </View>

            <View style={styles.moreList}>
              <MoreAction
                icon={<Users color={colors.primary} size={20} />}
                label={`${participantCount} participant${
                  participantCount === 1 ? "" : "s"
                }`}
                badge={pendingRequestCount}
                onPress={() => closeAndRun(onOpenParticipants)}
              />

              <MoreAction
                icon={
                  <MessageCircle color={colors.primary} size={20} />
                }
                label="Chat"
                onPress={() => closeAndRun(onOpenChat)}
              />

              <MoreAction
                icon={<Sparkles color={colors.primary} size={20} />}
                label="Video effects"
                onPress={() =>
                  closeAndRun(onOpenBackgroundEffects)
                }
              />

              <MoreAction
                icon={
                  <Hand
                    color={handRaised ? "#FFFFFF" : colors.primary}
                    size={20}
                  />
                }
                label={handRaised ? "Lower hand" : "Raise hand"}
                active={handRaised}
                onPress={() => closeAndRun(onToggleHand)}
              />

              {onToggleScreenShare ? (
                <MoreAction
                  icon={
                    <MonitorUp
                      color={screenSharing ? "#FFFFFF" : colors.primary}
                      size={20}
                    />
                  }
                  label={
                    screenSharing
                      ? "Stop screen sharing"
                      : "Share screen"
                  }
                  active={screenSharing}
                  onPress={() =>
                    closeAndRun(onToggleScreenShare)
                  }
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
    maxWidth: 330,
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 14,
  },
  coreItem: {
    width: 60,
    alignItems: "center",
    gap: 5,
  },
  coreButton: {
    width: 47,
    height: 47,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coreLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 10,
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  moreList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  moreAction: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 112,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  moreIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  moreLabel: {
    fontSize: 13,
    lineHeight: 17,
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