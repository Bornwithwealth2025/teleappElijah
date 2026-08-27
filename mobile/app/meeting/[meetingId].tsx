import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Clock3,
  Copy,
  LogIn,
  MessageCircle,
  Send,
  Share2,
  ShieldCheck,
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
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { MeetingControls } from "@/components/meeting/MeetingControls";
import { MeetingGrid } from "@/components/meeting/MeetingGrid";
import { MeetingParticipantSheet } from "@/components/meeting/MeetingParticipantSheet";
import { MeetingPermissionGate } from "@/components/meeting/MeetingPermissionGate";
import { HostJoinRequestBanner } from "@/components/meeting/HostJoinRequestBanner";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import { useConfMeetingSocketEvents } from "@/hooks/useConfMeetingSocketEvents";
import { useMeetingLifecycle } from "@/hooks/useMeetingLifecycle";
import { useMeetingReconnect } from "@/hooks/useMeetingReconnect";
import useAuthStore from "@/store/authStore";
import useMeetingStore from "@/store/meetingStore";

function getUserName(user: any) {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.name || user?.email || "Guest";
}

function getUserId(user: any) {
  return String(user?.id ?? user?.user_id ?? user?.email ?? "guest-user");
}

const CHAT_SHEET_HEIGHT = 420;

export default function MeetingRoomScreen() {
  const { meetingId: routeMeetingId } = useLocalSearchParams<{
    meetingId?: string | string[];
  }>();

  const meetingId = Array.isArray(routeMeetingId)
    ? routeMeetingId[0]
    : routeMeetingId;

  const { colors } = useAppTheme();
  const user = useAuthStore((state) => state.user);

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
  const isCameraOff = useMeetingStore((state) => state.isCameraOff);
  const isHandRaised = useMeetingStore((state) => state.isHandRaised);
  const isScreenSharing = useMeetingStore((state) => state.isScreenSharing);
  const participants = useMeetingStore((state) => state.participants);
  const messages = useMeetingStore((state) => state.messages);
  const localStream = useMeetingStore((state) => state.localStream);
  const remoteStreams = useMeetingStore((state) => state.remoteStreams);

  const joinMeeting = useMeetingStore((state) => state.joinMeeting);
  const requestMeetingAccess = useMeetingStore(
    (state) => state.requestMeetingAccess,
  );
  const leaveMeeting = useMeetingStore((state) => state.leaveMeeting);
  const startLocalMedia = useMeetingStore((state) => state.startLocalMedia);
  const toggleMute = useMeetingStore((state) => state.toggleMute);
  const toggleCamera = useMeetingStore((state) => state.toggleCamera);
  const toggleHand = useMeetingStore((state) => state.toggleHand);
  const toggleScreenShare = useMeetingStore((state) => state.toggleScreenShare);
  const sendMessage = useMeetingStore((state) => state.sendMessage);
  const muteAllParticipants = useMeetingStore(
    (state) => state.muteAllParticipants,
  );
  const respondToWaitingRoomRequest = useMeetingStore(
    (state) => state.respondToWaitingRoomRequest,
  );
  const admitAllWaitingParticipants = useMeetingStore(
    (state) => state.admitAllWaitingParticipants,
  );

  useConfMeetingSocketEvents();

  const joined = status === "joined";
  const joining = status === "joining";
  const leaving = status === "leaving";

  useMeetingLifecycle({ enabled: joined || joining });
  useMeetingReconnect({ enabled: joined });

  const entrance = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      speed: 18,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatVisible, setChatVisible] = React.useState(false);
  const [participantsVisible, setParticipantsVisible] =
    React.useState(false);
  const [chatText, setChatText] = React.useState("");
  const chatInputRef = React.useRef<TextInput | null>(null);

  const chatTranslateY = React.useRef(
    new Animated.Value(CHAT_SHEET_HEIGHT),
  ).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

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

  const roomCode = String(meetingId ?? "room");
  const userName = getUserName(user);
  const userId = getUserId(user);

  const handleJoin = async () => {
    await requestMeetingAccess({
      roomId: roomCode,
      userId,
      userName,
    });
  };

  const handleLeave = async () => {
    if (chatOpen) closeChat();
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

    setChatText("");
    await sendMessage(message);
  };

  if (joined) {
    return (
      <AppScreen
        scroll={false}
        immersive
        tone="plain"
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
          <View style={styles.liveTopBar}>
            <Image
              source={require("@/assets/images/telefya-logo.png")}
              style={styles.topLogo}
              resizeMode="contain"
            />

            <View
              style={[
                styles.connectedPill,
                { backgroundColor: `${colors.success}20` },
              ]}
            >
              <View
                style={[
                  styles.connectedDot,
                  { backgroundColor: colors.success },
                ]}
              />

              <AppText
                variant="caption"
                style={{ color: colors.success, fontWeight: "800" }}
              >
                Live
              </AppText>
            </View>
          </View>

          {isHost && pendingJoinRequests.length > 0 ? (
            <HostJoinRequestBanner
              requests={pendingJoinRequests}
              busy={isHandlingWaitingRoomAction}
              onApprove={(requestId) => {
                void respondToWaitingRoomRequest(requestId, "approve");
              }}
              onDecline={(requestId) => {
                void respondToWaitingRoomRequest(requestId, "decline");
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
                  backgroundColor: `${colors.danger}20`,
                  borderColor: `${colors.danger}60`,
                },
              ]}
            >
              <AppText variant="caption" style={{ color: colors.danger }}>
                {error}
              </AppText>
            </View>
          ) : null}

          <View style={styles.liveStage}>
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

          <View style={styles.liveMeta}>
            <View style={styles.metaLeft}>
              <AppText style={styles.metaCode} numberOfLines={1}>
                {roomCode}
              </AppText>

              <View style={styles.metaDivider} />

              <Users color="rgba(255,255,255,0.55)" size={14} />
              <AppText style={styles.metaMuted}>{participants.length}</AppText>

              <View style={styles.metaDivider} />

              <ShieldCheck color="rgba(255,255,255,0.55)" size={14} />
            </View>

            <View style={styles.liveActions}>
              <IconButton
                icon={<Copy color="#FFFFFF" size={17} />}
                variant="surface"
                accessibilityLabel="Copy room code"
                onPress={handleCopy}
              />

              <IconButton
                icon={<Share2 color="#FFFFFF" size={17} />}
                variant="surface"
                accessibilityLabel="Share meeting room"
                onPress={handleShare}
              />
            </View>
          </View>

          <MeetingControls
            muted={isMuted}
            cameraOff={isCameraOff}
            handRaised={isHandRaised}
            screenSharing={isScreenSharing}
            onToggleMute={() => void toggleMute()}
            onToggleCamera={() => void toggleCamera()}
            onToggleHand={() => void toggleHand()}
            onToggleScreenShare={() => void toggleScreenShare()}
            onOpenChat={openChat}
            participantCount={participants.length}
            pendingRequestCount={pendingJoinRequests.length}
            onOpenParticipants={() => {
              setParticipantsVisible(true);
            }}
            onLeave={() => void handleLeave()}
          />
        </Animated.View>

        {chatVisible ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
              style={[styles.chatBackdrop, { opacity: backdropOpacity }]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closeChat} />
            </Animated.View>

            <Animated.View
              style={[
                styles.chatSheet,
                {
                  backgroundColor: colors.card,
                  transform: [{ translateY: chatTranslateY }],
                },
              ]}
            >
              <View style={styles.chatHandle} />

              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderCopy}>
                  <AppText variant="bodyStrong">Chat</AppText>
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

              <View style={styles.chatMessages}>
                {messages.slice(-30).map((message) => (
                  <View key={message.messageId} style={styles.chatMessageRow}>
                    <AppText variant="caption" tone="primary">
                      {message.userName}
                    </AppText>

                    <AppText variant="body">{message.message}</AppText>
                  </View>
                ))}

                {messages.length === 0 ? (
                  <AppText
                    variant="caption"
                    tone="muted"
                    style={styles.chatEmpty}
                  >
                    Start the conversation.
                  </AppText>
                ) : null}
              </View>

              <View style={styles.chatInputRow}>
                <TextInput
                  ref={chatInputRef}
                  value={chatText}
                  onChangeText={setChatText}
                  placeholder="Write a message..."
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
                  style={({ pressed }) => [
                    styles.chatSendButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: !chatText.trim() ? 0.4 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Send color="#FFFFFF" size={17} />
                </Pressable>
              </View>
            </Animated.View>
          </View>
        ) : null}

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
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll tone="plain" contentStyle={styles.preJoinScreen}>
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
            style={styles.headerLogo}
            resizeMode="contain"
          />

          <View
            style={[
              styles.connectedPill,
              { backgroundColor: colors.surfaceStrong },
            ]}
          >
            <View
              style={[
                styles.connectedDot,
                { backgroundColor: colors.textSoft },
              ]}
            />
            <AppText variant="caption" tone="muted">
              Preview
            </AppText>
          </View>
        </View>

        <AppCard variant="tinted" elevated style={styles.roomCard}>
          <View style={styles.roomHeader}>
            <View style={styles.roomCopy}>
              <AppText variant="caption" tone="muted">
                Room
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
                  variant="caption"
                  tone="primary"
                  style={styles.hostBadgeText}
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
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Clock3 color={colors.primary} size={22} />
              </View>

              <View style={styles.waitingCopy}>
                <AppText variant="bodyStrong">
                  {waitingRoomStatus === "requesting"
                    ? "Requesting access"
                    : "You're in the waiting room"}
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
        </AppCard>

        {error ? (
          <AppCard
            compact
            style={[
              styles.errorCard,
              {
                backgroundColor: `${colors.danger}12`,
                borderColor: `${colors.danger}40`,
              },
            ]}
          >
            <AppText variant="caption" style={{ color: colors.danger }}>
              {error}
            </AppText>
          </AppCard>
        ) : null}

        <AppCard variant="soft" style={styles.previewCard}>
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
        </AppCard>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  liveScreen: {
    backgroundColor: "#0A1220",
  },

  liveRoot: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },

  liveTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topLogo: {
    width: 108,
    height: 26,
  },

  headerLogo: {
    width: 118,
    height: 28,
  },

  connectedPill: {
    minHeight: 28,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },

  liveError: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.two,
  },

  liveStage: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
  },

  liveMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  metaLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },

  metaCode: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 120,
  },

  metaMuted: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "600",
  },

  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  liveActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  chatBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(4, 10, 22, 0.55)",
  },

  chatSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: CHAT_SHEET_HEIGHT,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },

  chatHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.4)",
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
    gap: Spacing.two,
  },

  chatMessageRow: {
    gap: 2,
  },

  chatEmpty: {
    textAlign: "center",
    paddingTop: Spacing.four,
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
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },

  chatSendButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
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

  roomCard: {
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
    minHeight: 92,
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

  previewCard: {
    padding: Spacing.three,
  },

  errorCard: {
    borderWidth: 1,
  },
});