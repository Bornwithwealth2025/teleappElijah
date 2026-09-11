import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock3,
  Copy,
  LogIn,
  Pencil,
  Radio,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const CHAT_SHEET_HEIGHT = 420;

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
  const { meetingId: routeMeetingId } = useLocalSearchParams<{
    meetingId?: string | string[];
  }>();

  const meetingId = Array.isArray(routeMeetingId)
    ? routeMeetingId[0]
    : routeMeetingId;

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
  const remoteStreams = useMeetingStore(
    (state) => state.remoteStreams,
  );

  const requestMeetingAccess = useMeetingStore(
    (state) => state.requestMeetingAccess,
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

  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatVisible, setChatVisible] = React.useState(false);
  const [participantsVisible, setParticipantsVisible] =
    React.useState(false);
  const [chatText, setChatText] = React.useState("");
  const [editingMessageId, setEditingMessageId] = React.useState<
    string | null
  >(null);
  const [recordingVisible, setRecordingVisible] =
    React.useState(false);
  const [effectsVisible, setEffectsVisible] =
    React.useState(false);

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

  const chatInputRef = React.useRef<TextInput | null>(null);
  const chatScrollRef = React.useRef<ScrollView | null>(null);

  const chatTranslateY = React.useRef(
    new Animated.Value(CHAT_SHEET_HEIGHT),
  ).current;

  const backdropOpacity = React.useRef(
    new Animated.Value(0),
  ).current;

  const roomCode = String(meetingId ?? "room");
  const userName = getUserName(user);
  const userId = getUserId(user);

  const openChat = React.useCallback(() => {
    setChatVisible(true);
    setChatOpen(true);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(chatTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, chatTranslateY]);

  const closeChat = React.useCallback(() => {
    setChatOpen(false);
    setEditingMessageId(null);
    setChatText("");
    Keyboard.dismiss();
    chatInputRef.current?.blur();

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(chatTranslateY, {
        toValue: CHAT_SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setChatVisible(false);
    });
  }, [backdropOpacity, chatTranslateY]);

    const handleJoin = async () => {
    await requestMeetingAccess({
      roomId: roomCode,
      userId,
      userName,
      cameraOn: cameraEnabledByDefault,
    });
  };

  const handleLeave = async () => {
    if (chatOpen) {
      closeChat();
    }

    setRecordingVisible(false);

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
    await Share.share({
      message: `Join my Telefya meeting: ${roomCode}`,
    });
  };

  const handleSendMessage = async () => {
    const message = chatText.trim();

    if (!message || !joined) return;

    const messageId = editingMessageId;

    try {
      if (messageId) {
        await editMessage(messageId, message);
        setEditingMessageId(null);
      } else {
        await sendMessage(message);
      }

      setChatText("");
      requestAnimationFrame(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      });
    } catch {
      Alert.alert(
        "Chat unavailable",
        "Your message could not be sent. Please try again.",
      );
    }
  };

  const handleMessageOptions = (message: {
    messageId: string;
    message: string;
    socketId?: string;
  }) => {
    if (!socketId || message.socketId !== socketId) {
      return;
    }

    Alert.alert("Your message", undefined, [
      {
        text: "Edit",
        onPress: () => {
          setEditingMessageId(message.messageId);
          setChatText(message.message);
          requestAnimationFrame(() => chatInputRef.current?.focus());
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteMessage(message.messageId).catch(() => {
            Alert.alert(
              "Unable to delete",
              "Please try again in a moment.",
            );
          });
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const formatMessageTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
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
            <MeetingPermissionGate>
              <MeetingGrid
                fullScreen
                localStream={localStream}
                localName={userName}
                localMuted={isMuted}
                localCameraOff={isCameraOff}
                remoteStreams={remoteStreams}
                participants={participants}
              />
            </MeetingPermissionGate>
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

          <View
            style={[
              styles.liveTopBar,
              {
                top: insets.top + Spacing.two,
                backgroundColor: isDark
                  ? colors.glassStrong
                  : colors.card,
                borderColor: colors.glassBorder,
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
                void toggleScreenShare()
              }
              onOpenChat={openChat}
              onOpenParticipants={() => {
                setParticipantsVisible(true);
              }}
              onLeave={() => void handleLeave()}
            />
          </View>
        </Animated.View>

        {chatVisible ? (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            <Animated.View
              style={[
                styles.chatBackdrop,
                { opacity: backdropOpacity },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeChat}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.chatSheet,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  transform: [{ translateY: chatTranslateY }],
                },
              ]}
            >
              <View
                style={[
                  styles.chatHandle,
                  { backgroundColor: colors.borderStrong },
                ]}
              />

              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderCopy}>
                  <AppText variant="bodyStrong">
                    Meeting chat
                  </AppText>

                  <AppText variant="caption" tone="muted">
                    {messages.length === 0
                      ? "No messages yet"
                      : `${messages.length} message${
                          messages.length === 1 ? "" : "s"
                        }`}
                  </AppText>
                </View>

                <IconButton
                  icon={<X color={colors.text} size={18} />}
                  variant="ghost"
                  accessibilityLabel="Close chat"
                  onPress={closeChat}
                />
              </View>

              <ScrollView
                ref={chatScrollRef}
                style={styles.chatMessages}
                contentContainerStyle={styles.chatMessagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  chatScrollRef.current?.scrollToEnd({
                    animated: true,
                  });
                }}
              >
                {messages.slice(-30).map((message) => {
                  const isMine =
                    Boolean(socketId) &&
                    message.socketId === socketId;

                  return (
                    <Pressable
                      key={message.messageId}
                      disabled={!isMine}
                      onLongPress={() => handleMessageOptions(message)}
                      delayLongPress={350}
                      accessibilityRole={isMine ? "button" : undefined}
                      accessibilityLabel={
                        isMine
                          ? "Message options. Long press to edit or delete."
                          : undefined
                      }
                      style={({ pressed }) => [
                        styles.chatMessageRow,
                        isMine
                          ? styles.chatMessageRowMine
                          : styles.chatMessageRowTheirs,
                        {
                          backgroundColor: isMine
                            ? colors.primarySoft
                            : colors.surface,
                          borderColor: isMine
                            ? `${colors.primary}45`
                            : colors.border,
                          opacity: pressed && isMine ? 0.78 : 1,
                        },
                      ]}
                    >
                      {!isMine ? (
                        <AppText
                          variant="caption"
                          style={{
                            color: colors.textMuted,
                            fontWeight: "800",
                          }}
                        >
                          {message.userName}
                        </AppText>
                      ) : null}

                      <AppText variant="body">
                        {message.message}
                      </AppText>

                      <View style={styles.chatMessageFooter}>
                        {message.edited ? (
                          <AppText variant="caption" tone="muted">
                            Edited ·{" "}
                          </AppText>
                        ) : null}

                        <AppText variant="caption" tone="muted">
                          {formatMessageTime(message.time)}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })}

                {messages.length === 0 ? (
                  <AppText
                    variant="caption"
                    tone="muted"
                    style={styles.chatEmpty}
                  >
                    Start the conversation.
                  </AppText>
                ) : null}
              </ScrollView>

              <View style={styles.chatComposer}>
                {editingMessageId ? (
                  <View
                    style={[
                      styles.editingBar,
                      {
                        backgroundColor: colors.primarySoft,
                        borderColor: `${colors.primary}35`,
                      },
                    ]}
                  >
                    <Pencil color={colors.primary} size={14} />

                    <AppText
                      variant="caption"
                      style={[
                        styles.editingText,
                        { color: colors.primary },
                      ]}
                    >
                      Editing message
                    </AppText>

                    <Pressable
                      onPress={() => {
                        setEditingMessageId(null);
                        setChatText("");
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel editing message"
                    >
                      <X color={colors.primary} size={16} />
                    </Pressable>
                  </View>
                ) : null}

                <View style={styles.chatInputRow}>
                  <TextInput
                    ref={chatInputRef}
                    value={chatText}
                    onChangeText={setChatText}
                    placeholder={
                      editingMessageId
                        ? "Update your message..."
                        : "Write a message..."
                    }
                    placeholderTextColor={colors.textSoft}
                    onSubmitEditing={handleSendMessage}
                    style={[
                      styles.chatInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  />

                  <Pressable
                    onPress={handleSendMessage}
                    disabled={!chatText.trim()}
                    accessibilityRole="button"
                    accessibilityLabel={
                      editingMessageId
                        ? "Save edited message"
                        : "Send message"
                    }
                    style={({ pressed }) => [
                      styles.chatSendButton,
                      {
                        backgroundColor: colors.primary,
                        opacity: !chatText.trim()
                          ? 0.4
                          : pressed
                            ? 0.85
                            : 1,
                      },
                    ]}
                  >
                    {editingMessageId ? (
                      <Pencil color="#FFFFFF" size={17} />
                    ) : (
                      <Send color="#FFFFFF" size={17} />
                    )}
                  </Pressable>
                </View>
              </View>
            </Animated.View>
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
              backgroundColor: colors.card,
              borderColor: colors.border,
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
                  joining
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

          <MeetingPermissionGate>
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
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
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
    backgroundColor: "rgba(2, 6, 24, 0.58)",
  },

  chatSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: CHAT_SHEET_HEIGHT,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },

  chatHandle: {
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
    alignSelf: "center",
  },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatHeaderCopy: {
    gap: 2,
  },

  chatMessages: {
    flex: 1,
  },

  chatMessagesContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },

  chatMessageRow: {
    gap: 3,
    maxWidth: "82%",
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },

  chatMessageRowMine: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },

  chatMessageRowTheirs: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },

  chatMessageFooter: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 2,
  },

  chatEmpty: {
    textAlign: "center",
    paddingTop: Spacing.four,
  },

  chatComposer: {
    gap: Spacing.two,
  },

  editingBar: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  editingText: {
    flex: 1,
    fontWeight: "800",
  },

  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  chatInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    fontSize: 15,
  },

  chatSendButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
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
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.four,
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