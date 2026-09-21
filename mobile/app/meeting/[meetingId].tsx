import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock3,
  Copy,
  LogIn,
  Radio,
  Share2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react-native";
import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatPanel } from "@/components/meeting/ChatPanel";
import { HostJoinRequestBanner } from "@/components/meeting/HostJoinRequestBanner";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { MeetingGrid } from "@/components/meeting/MeetingGrid";
import { MeetingParticipantSheet } from "@/components/meeting/MeetingParticipantSheet";
import { MeetingPermissionGate } from "@/components/meeting/MeetingPermissionGate";
import { RecordingControls } from "@/components/meeting/RecordingControls";
import { VideoEffectsSheet } from "@/components/meeting/VideoEffectsSheet";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { VideoEffectId } from "@/services/video-effects.service";
import { useConfMeetingSocketEvents } from "@/hooks/useConfMeetingSocketEvents";
import { useMeetingLifecycle } from "@/hooks/useMeetingLifecycle";
import { useMeetingNetworkQuality } from "@/hooks/useMeetingNetworkQuality";
import { useMeetingTelemetry } from "@/hooks/useMeetingTelemetry";
import { useMeetingReconnect } from "@/hooks/useMeetingReconnect";
import { useMeetingOrientation } from "@/hooks/useMeetingOrientation";
import useAuthStore from "@/store/authStore";
import useMeetingStore from "@/store/meetingStore";
import usePreferencesStore from "@/store/preferencesStore";
import MediasoupClient from "@/services/mediasoupClient";
import UserService from "@/api/user.service";

function getUserName(user: any) {
  const fullName = [
    user?.first_name ?? user?.firstName,
    user?.last_name ?? user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.name || user?.email || "Guest";
}

function getUserId(user: any) {
  return String(
    user?.id ??
      user?.user_id ??
      user?.userId ??
      user?.email ??
      "guest-user",
  );
}

export default function MeetingRoomScreen() {
  const {
    meetingId: routeMeetingId,
    host: hostParam,
  } = useLocalSearchParams<{
    meetingId?: string | string[];
    host?: string | string[];
  }>();

  const meetingId = Array.isArray(routeMeetingId)
    ? routeMeetingId[0]
    : routeMeetingId;
  const isHostRoute =
    (Array.isArray(hostParam) ? hostParam[0] : hostParam) === "true";

  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const cameraEnabledByDefault = usePreferencesStore(
    (state) => state.meeting.cameraEnabled,
  );

  const status = useMeetingStore((state) => state.status);
  const error = useMeetingStore((state) => state.error);
  const isHost = useMeetingStore((state) => state.isHost);

  const waitingRoomStatus = useMeetingStore(
    (state) => state.waitingRoomStatus,
  );
  const waitingRoomMessage = useMeetingStore(
    (state) => state.waitingRoomMessage,
  );
  const pendingJoinRequests = useMeetingStore(
    (state) => state.pendingJoinRequests,
  );
  const isHandlingWaitingRoomAction = useMeetingStore(
    (state) => state.isHandlingWaitingRoomAction,
  );

  const isMuted = useMeetingStore((state) => state.isMuted);
  const isCameraOff = useMeetingStore(
    (state) => state.isCameraOff,
  );
  const isHandRaised = useMeetingStore(
    (state) => state.isHandRaised,
  );
  const isScreenSharing = useMeetingStore(
    (state) => state.isScreenSharing,
  );
  const videoEffect = useMeetingStore(
    (state) => state.videoEffect,
  );
  const networkQuality = useMeetingStore(
    (state) => state.networkQuality,
  );

  const participants = useMeetingStore(
    (state) => state.participants,
  );
  const messages = useMeetingStore((state) => state.messages);
  const socketId = useMeetingStore((state) => state.socketId);

  const editMessage = useMeetingStore(
    (state) => state.editMessage,
  );

  const deleteMessage = useMeetingStore(
    (state) => state.deleteMessage,
  );
  const localStream = useMeetingStore(
    (state) => state.localStream,
  );
  const setLocalStream = useMeetingStore(
    (state) => state.setLocalStream,
  );
  const remoteStreams = useMeetingStore(
    (state) => state.remoteStreams,
  );

  const requestMeetingAccess = useMeetingStore(
    (state) => state.requestMeetingAccess,
  );
  const joinMeeting = useMeetingStore((state) => state.joinMeeting);

  const startLocalMedia = useMeetingStore(
    (state) => state.startLocalMedia,
  );
  const leaveMeeting = useMeetingStore(
    (state) => state.leaveMeeting,
  );
  const toggleMute = useMeetingStore(
    (state) => state.toggleMute,
  );
  const toggleCamera = useMeetingStore(
    (state) => state.toggleCamera,
  );
  const toggleHand = useMeetingStore(
    (state) => state.toggleHand,
  );
  const toggleScreenShare = useMeetingStore(
    (state) => state.toggleScreenShare,
  );
  const setVideoEffect = useMeetingStore(
    (state) => state.setVideoEffect,
  );
  const sendMessage = useMeetingStore(
    (state) => state.sendMessage,
  );
  const muteAllParticipants = useMeetingStore(
    (state) => state.muteAllParticipants,
  );
  const muteParticipant = useMeetingStore(
    (state) => state.muteParticipant,
  );
  const removeParticipantByHost = useMeetingStore(
    (state) => state.removeParticipantByHost,
  );
  const respondToWaitingRoomRequest = useMeetingStore(
    (state) => state.respondToWaitingRoomRequest,
  );
  const admitAllWaitingParticipants = useMeetingStore(
    (state) => state.admitAllWaitingParticipants,
  );

  useConfMeetingSocketEvents();

  const joined = status === "joined";
  useMeetingOrientation(joined);
  const joining = status === "joining";
  const leaving = status === "leaving";

  useMeetingLifecycle({ enabled: joined || joining });
  useMeetingReconnect({ enabled: joined });
  useMeetingNetworkQuality(joined);
  useMeetingTelemetry(
    joined || status === "error",
  );

  const entrance = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      damping: 17,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const [chatVisible, setChatVisible] = React.useState(false);
  const [participantsVisible, setParticipantsVisible] =
    React.useState(false);
  const [recordingVisible, setRecordingVisible] =
    React.useState(false);
  const [effectsVisible, setEffectsVisible] =
    React.useState(false);
  const [controlsVisible, setControlsVisible] =
    React.useState(true);

  const [effectBusy, setEffectBusy] =
    React.useState(false);

  const handleSelectVideoEffect = React.useCallback(
    async (effectId: VideoEffectId) => {
      setEffectBusy(true);

      try {
        await setVideoEffect(effectId);
        setEffectsVisible(false);
      } catch (error) {
        Alert.alert(
          "Background effect unavailable",
          error instanceof Error
            ? error.message
            : "Unable to apply the selected effect.",
        );
      } finally {
        setEffectBusy(false);
      }
    },
    [setVideoEffect],
  );

  const roomCode = String(meetingId ?? "room");
  const userName = getUserName(user);
  const userId = getUserId(user);

  const prepareCameraPreview = React.useCallback(async () => {
    try {
      const stream = await MediasoupClient.getLocalStream();
      setLocalStream(stream);
    } catch (previewError) {
      const message =
        previewError instanceof Error
          ? previewError.message
          : "Unable to start the camera preview.";

      Alert.alert("Camera preview unavailable", message);
    }
  }, [setLocalStream]);

  const openChat = React.useCallback(() => {
    setChatVisible(true);
  }, []);

  const closeChat = React.useCallback(() => {
    setChatVisible(false);
  }, []);

  const handleJoin = async () => {
    if (cameraEnabledByDefault && !localStream) {
      await prepareCameraPreview();
    }

    if (isHostRoute) {
      const lifecycle = await UserService.updateMeetingLifecycle(
        roomCode,
        "start",
      );

      if (lifecycle?.success === false) {
        throw new Error(
          lifecycle.message || "Unable to start this meeting.",
        );
      }

      await joinMeeting({
        roomId: roomCode,
        userId,
        userName,
        isHost: true,
        cameraOn: cameraEnabledByDefault,
      });

      if (useMeetingStore.getState().status === "joined") {
        await startLocalMedia();
      }

      return;
    }

    await requestMeetingAccess({
      roomId: roomCode,
      userId,
      userName,
      cameraOn: cameraEnabledByDefault,
    });
  };

  const handleLeave = async () => {
    if (chatVisible) {
      closeChat();
    }

    setRecordingVisible(false);

    if (isHost) {
      try {
        await UserService.updateMeetingLifecycle(roomCode, "end");
      } catch (error) {
        console.warn("[meeting] Unable to mark meeting ended:", error);
      }
    }

    await leaveMeeting();
    router.back();
  };

  const handleCopy = async () => {
    if (
      Platform.OS === "web" &&
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      await navigator.clipboard.writeText(roomCode);
      Alert.alert("Copied", "Room code copied.");
      return;
    }

    Alert.alert("Room code", roomCode);
  };

  const handleShare = async () => {
    const webMeetingBase = (
      process.env.EXPO_PUBLIC_WEB_MEETING_URL ?? ""
    ).replace(/\/+$/, "");

    const meetingLink = webMeetingBase
      ? `${webMeetingBase}/live/${encodeURIComponent(roomCode)}`
      : roomCode;

    await Share.share({
      title: "Join my Telefya meeting",
      message: `Join my Telefya meeting: ${meetingLink}`,
    });
  };

  const handleToggleScreenShare = async () => {
    try {
      await toggleScreenShare();
    } catch (error) {
      Alert.alert(
        "Screen sharing unavailable",
        error instanceof Error
          ? error.message
          : "Please try again.",
      );
    }
  };

  const networkPillColor =
    networkQuality.level === "poor"
      ? colors.danger
      : networkQuality.level === "fair"
        ? colors.warning
        : colors.success;

  if (joined) {
    return (
      <AppScreen
        scroll={false}
        immersive
        contentStyle={styles.liveScreen}
      >
        <Animated.View
          style={[
            styles.liveRoot,
            {
              opacity: entrance,
              transform: [
                {
                  translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.stageShell}>
            <MeetingGrid
              fullScreen
              localStream={localStream}
              localName={userName}
              localMuted={isMuted}
              localCameraOff={isCameraOff}
              remoteStreams={remoteStreams}
              participants={participants}
            />
            <Pressable
              style={styles.controlsTapLayer}
              onPress={() => setControlsVisible((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={
                controlsVisible
                  ? "Hide meeting controls"
                  : "Show meeting controls"
              }
            />
          </View>

          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2, 6, 16, 0.6)", "rgba(2, 6, 16, 0)"]}
            style={styles.topScrim}
          />

          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2, 6, 16, 0)", "rgba(2, 6, 16, 0.68)"]}
            style={styles.bottomScrim}
          />

          {controlsVisible ? (
            <View
              style={[
                styles.liveTopBar,
                {
                  top: insets.top + Spacing.two,
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                },
              ]}
            >
            <Image
              source={require("@/assets/images/telefya-logo.png")}
              resizeMode="contain"
              style={styles.topLogo}
            />

            <View style={styles.liveTopActions}>
              <View
                style={[
                  styles.connectedPill,
                  {
                    backgroundColor: `${networkPillColor}16`,
                    borderColor: `${networkPillColor}38`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.connectedDot,
                    { backgroundColor: networkPillColor },
                  ]}
                />

                <AppText
                  style={[
                    styles.livePillText,
                    { color: networkPillColor },
                  ]}
                >
                  {networkQuality.label}
                </AppText>
              </View>

              {isHost ? (
                <IconButton
                  icon={<Radio color={colors.danger} size={17} />}
                  variant="soft"
                  accessibilityLabel="Open recording controls"
                  onPress={() => setRecordingVisible(true)}
                />
              ) : null}

              <IconButton
                icon={<Share2 color={colors.text} size={17} />}
                variant="soft"
                accessibilityLabel="Share meeting room"
                onPress={handleShare}
              />
            </View>
            </View>
          ) : null}

          <View
            pointerEvents="box-none"
            style={[
              styles.topOverlayStack,
              { top: insets.top + Spacing.two + 64 },
            ]}
          >
            {isHost && pendingJoinRequests.length > 0 ? (
              <HostJoinRequestBanner
                requests={pendingJoinRequests}
                busy={isHandlingWaitingRoomAction}
                onApprove={(requestId) => {
                  void respondToWaitingRoomRequest(
                    requestId,
                    "approve",
                  );
                }}
                onDecline={(requestId) => {
                  void respondToWaitingRoomRequest(
                    requestId,
                    "decline",
                  );
                }}
                onAdmitAll={() => {
                  void admitAllWaitingParticipants();
                }}
              />
            ) : null}

            {error ? (
              <View
                style={[
                  styles.liveError,
                  {
                    backgroundColor: `${colors.danger}14`,
                    borderColor: `${colors.danger}45`,
                  },
                ]}
              >
                <AppText
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

          {controlsVisible ? (
            <View
              style={[
                styles.liveMeta,
                {
                  bottom: 108 + insets.bottom,
                  backgroundColor: isDark
                    ? colors.glassStrong
                    : colors.card,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
            <View style={styles.metaLeft}>
              <AppText
                numberOfLines={1}
                style={[
                  styles.metaCode,
                  { color: colors.text },
                ]}
              >
                {roomCode}
              </AppText>

              <View
                style={[
                  styles.metaDivider,
                  { backgroundColor: colors.divider },
                ]}
              />

              <Users color={colors.textMuted} size={15} />

              <AppText
                style={[
                  styles.metaCount,
                  { color: colors.textMuted },
                ]}
              >
                {participants.length}
              </AppText>
            </View>

            <View style={styles.metaActions}>
              <IconButton
                icon={<Copy color={colors.primary} size={17} />}
                variant="soft"
                accessibilityLabel="Copy room code"
                onPress={handleCopy}
              />

              <View
                style={[
                  styles.securePill,
                  {
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <ShieldCheck color={colors.primary} size={15} />
                <AppText
                  style={[
                    styles.secureText,
                    { color: colors.primary },
                  ]}
                >
                  Secure
                </AppText>
              </View>
            </View>
            </View>
          ) : null}

          {controlsVisible ? (
            <View
              style={[
                styles.meetingControlsOverlay,
                { bottom: Spacing.two + insets.bottom },
              ]}
            >
            <MeetingControls
              muted={isMuted}
              cameraOff={isCameraOff}
              handRaised={isHandRaised}
              screenSharing={isScreenSharing}
              participantCount={participants.length}
              pendingRequestCount={pendingJoinRequests.length}
              onToggleMute={() => void toggleMute()}
              onToggleCamera={() => void toggleCamera()}
              onOpenBackgroundEffects={() => {
                setEffectsVisible(true);
              }}
              onToggleHand={() => void toggleHand()}
              onToggleScreenShare={() =>
                void handleToggleScreenShare()
              }
              onOpenChat={openChat}
              onOpenParticipants={() => {
                setParticipantsVisible(true);
              }}
              onLeave={() => void handleLeave()}
            />
            </View>
          ) : null}
        </Animated.View>

        {chatVisible ? (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            <Pressable
              style={styles.chatBackdrop}
              onPress={closeChat}
              accessibilityRole="button"
              accessibilityLabel="Close meeting chat"
            />

            <View
              style={[
                styles.chatPanelOverlay,
                {
                  bottom: Math.max(insets.bottom, Spacing.three),
                },
              ]}
            >
              <ChatPanel
                messages={messages}
                joined={joined}
                currentSocketId={socketId}
                onClose={closeChat}
                onSend={(message) => sendMessage(message)}
                onEdit={(messageId, message) =>
                  editMessage(messageId, message)
                }
                onDelete={(messageId) =>
                  deleteMessage(messageId)
                }
              />
            </View>
          </View>
        ) : null}

        {recordingVisible && isHost ? (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            <Pressable
              style={[
                styles.recordingBackdrop,
                { backgroundColor: colors.overlay },
              ]}
              onPress={() => setRecordingVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close recording controls"
            />

            <View
              style={[
                styles.recordingSheet,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.sheetHandle,
                  { backgroundColor: colors.borderStrong },
                ]}
              />

              <View style={styles.recordingSheetHeader}>
                <View style={styles.recordingSheetCopy}>
                  <AppText variant="sectionTitle">
                    Recording controls
                  </AppText>

                  <AppText variant="caption" tone="muted">
                    Start or stop the meeting recording.
                  </AppText>
                </View>

                <IconButton
                  icon={<X color={colors.text} size={18} />}
                  variant="ghost"
                  accessibilityLabel="Close recording controls"
                  onPress={() => setRecordingVisible(false)}
                />
              </View>

              <RecordingControls />
            </View>
          </View>
        ) : null}

        <VideoEffectsSheet
          visible={effectsVisible}
          selectedEffect={videoEffect}
          busy={effectBusy}
          onClose={() => {
            if (!effectBusy) {
              setEffectsVisible(false);
            }
          }}
          onSelect={(effectId) => {
            void handleSelectVideoEffect(effectId);
          }}
        />

        <MeetingParticipantSheet
          visible={participantsVisible}
          participants={participants}
          pendingRequestCount={pendingJoinRequests.length}
          isHost={isHost}
          onClose={() => {
            setParticipantsVisible(false);
          }}
          onMuteAll={() => {
            void muteAllParticipants();
          }}
          onMuteParticipant={(targetUserId) => {
            void muteParticipant(targetUserId);
          }}
          onRemoveParticipant={(targetUserId) => {
            Alert.alert(
              "Remove participant?",
              "They will leave this meeting immediately.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => {
                    void removeParticipantByHost(targetUserId);
                  },
                },
              ],
            );
          }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      tone="plain"
      contentStyle={styles.preJoinScreen}
    >
      <Animated.View
        style={[
          styles.preJoinRoot,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.preJoinHeader}>
          <Image
            source={require("@/assets/images/telefya-logo.png")}
            resizeMode="contain"
            style={styles.headerLogo}
          />

          <View
            style={[
              styles.connectedPill,
              {
                backgroundColor: colors.surfaceStrong,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.connectedDot,
                { backgroundColor: colors.textSoft },
              ]}
            />

            <AppText
              style={[
                styles.livePillText,
                { color: colors.textMuted },
              ]}
            >
              Preview
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.roomPanel,
            {
              backgroundColor: "transparent",
              borderColor: "transparent",
            },
          ]}
        >
          <View style={styles.roomHeader}>
            <View style={styles.roomCopy}>
              <AppText variant="caption" tone="muted">
                Meeting room
              </AppText>

              <AppText variant="title" numberOfLines={1}>
                {roomCode}
              </AppText>
            </View>

            {isHost ? (
              <View
                style={[
                  styles.hostBadge,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <ShieldCheck color={colors.primary} size={14} />

                <AppText
                  style={[
                    styles.hostBadgeText,
                    { color: colors.primary },
                  ]}
                >
                  Host
                </AppText>
              </View>
            ) : null}
          </View>

          {waitingRoomStatus === "pending" ||
          waitingRoomStatus === "requesting" ? (
            <View
              style={[
                styles.waitingCard,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.waitingIcon,
                  { backgroundColor: `${colors.primary}1D` },
                ]}
              >
                <Clock3 color={colors.primary} size={22} />
              </View>

              <View style={styles.waitingCopy}>
                <AppText variant="bodyStrong">
                  {waitingRoomStatus === "requesting"
                    ? "Requesting access"
                    : "You’re in the waiting room"}
                </AppText>

                <AppText variant="caption" tone="muted">
                  {waitingRoomMessage ||
                    "The host will admit you when they are ready."}
                </AppText>
              </View>

              <AppButton
                title="Leave"
                variant="ghost"
                fullWidth={false}
                onPress={() => void handleLeave()}
              />
            </View>
          ) : (
            <View style={styles.preJoinActions}>
              <AppButton
                title={
                  isHostRoute
                    ? "Start meeting"
                    : joining
                      ? "Joining..."
                      : waitingRoomStatus === "declined"
                        ? "Request again"
                        : "Request to join"
                }
                loading={joining}
                disabled={joining || leaving}
                onPress={() => void handleJoin()}
                containerStyle={styles.joinButton}
                leftIcon={<LogIn color="#FFFFFF" size={18} />}
              />

              <IconButton
                icon={<Copy color={colors.primary} size={18} />}
                variant="soft"
                accessibilityLabel="Copy room code"
                onPress={handleCopy}
              />

              <IconButton
                icon={<Share2 color={colors.primary} size={18} />}
                variant="soft"
                accessibilityLabel="Share meeting room"
                onPress={handleShare}
              />
            </View>
          )}
        </View>

        {error ? (
          <View
            style={[
              styles.errorPanel,
              {
                backgroundColor: `${colors.danger}12`,
                borderColor: `${colors.danger}40`,
              },
            ]}
          >
            <AppText
              style={[
                styles.errorText,
                { color: colors.danger },
              ]}
            >
              {error}
            </AppText>
          </View>
        ) : null}

        <View
          style={[
            styles.previewPanel,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.previewLabelRow}>
            <View
              style={[
                styles.previewDot,
                { backgroundColor: colors.success },
              ]}
            />

            <AppText variant="caption" tone="success">
              Camera preview
            </AppText>
          </View>

          <MeetingPermissionGate
            onGranted={() => {
              void prepareCameraPreview();
            }}
          >
            <MeetingGrid
              localStream={localStream}
              localName={userName}
              localMuted={isMuted}
              localCameraOff={isCameraOff}
              remoteStreams={remoteStreams}
              participants={participants}
            />
          </MeetingPermissionGate>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  liveScreen: {
    flex: 1,
    paddingHorizontal: 0,
  },

  liveRoot: {
    flex: 1,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },

  stageShell: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    backgroundColor: "#020618",
  },

  controlsTapLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },

  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 1,
  },

  bottomScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 190,
    zIndex: 1,
  },

  liveTopBar: {
    position: "absolute",
    top: Spacing.two,
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 20,
    minHeight: 52,
    paddingHorizontal: Spacing.one,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topLogo: {
    width: 108,
    height: 28,
  },

  liveTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  connectedPill: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
  },

  livePillText: {
    fontSize: 11,
    fontWeight: "800",
  },

  topOverlayStack: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 20,
    gap: Spacing.two,
  },

  liveError: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },

  errorText: {
    fontSize: 12,
    fontWeight: "700",
  },

  liveMeta: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    bottom: 108,
    zIndex: 20,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metaLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metaCode: {
    maxWidth: 132,
    fontSize: 12,
    fontWeight: "800",
  },

  metaDivider: {
    width: 1,
    height: 14,
  },

  metaCount: {
    fontSize: 12,
    fontWeight: "700",
  },

  metaActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  securePill: {
    minHeight: 32,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  secureText: {
    fontSize: 11,
    fontWeight: "800",
  },

  meetingControlsOverlay: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.two,
    zIndex: 30,
  },

  chatBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2, 6, 24, 0.64)",
  },

  chatPanelOverlay: {
    position: "absolute",
    left: Spacing.two,
    right: Spacing.two,
    height: "76%",
    maxHeight: 680,
  },

  recordingBackdrop: {
    ...StyleSheet.absoluteFill,
  },

  recordingSheet: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
  },

  recordingSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  recordingSheetCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  preJoinScreen: {
    gap: Spacing.five,
  },

  preJoinRoot: {
    width: "100%",
    gap: Spacing.five,
  },

  preJoinHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLogo: {
    width: 118,
    height: 28,
  },

  roomPanel: {
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },

  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  roomCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  hostBadge: {
    minHeight: 28,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  hostBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  preJoinActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  joinButton: {
    flex: 1,
  },

  waitingCard: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  waitingIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  waitingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  errorPanel: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },

  previewPanel: {
    minHeight: 290,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },

  previewLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  previewDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
});