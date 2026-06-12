import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarDays,
  Copy,
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  ShieldCheck,
  Video,
  VideoOff,
} from "lucide-react-native";
import {
  Alert,
  Platform,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ParticipantStack } from "@/components/meeting/ParticipantStack";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useConfMeetingSocketEvents } from "@/hooks/useConfMeetingSocketEvents";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useMeetingStore from "@/store/meetingStore";

function getUserName(user: any) {
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  return fullName || user?.email || "Guest";
}

function getUserId(user: any) {
  return String(user?.id ?? user?.email ?? "guest-user");
}

export default function MeetingRoomScreen() {
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { colors } = useAppTheme();

  const user = useAuthStore((state: any) => state.user);

  const status = useMeetingStore((state) => state.status);
  const error = useMeetingStore((state) => state.error);
  const isHost = useMeetingStore((state) => state.isHost);
  const isMuted = useMeetingStore((state) => state.isMuted);
  const isCameraOff = useMeetingStore((state) => state.isCameraOff);
  const isHandRaised = useMeetingStore((state) => state.isHandRaised);
  const participants = useMeetingStore((state) => state.participants);
  const messages = useMeetingStore((state) => state.messages);
  const producers = useMeetingStore((state) => state.producers);

  const joinMeeting = useMeetingStore((state) => state.joinMeeting);
  const leaveMeeting = useMeetingStore((state) => state.leaveMeeting);
  const startLocalMedia = useMeetingStore((state) => state.startLocalMedia);
  const toggleMute = useMeetingStore((state) => state.toggleMute);
  const toggleCamera = useMeetingStore((state) => state.toggleCamera);
  const toggleHand = useMeetingStore((state) => state.toggleHand);
  const sendMessage = useMeetingStore((state) => state.sendMessage);

  const [chatText, setChatText] = React.useState("");

  useConfMeetingSocketEvents();

  const roomCode = String(meetingId ?? "room");
  const joined = status === "joined";
  const joining = status === "joining";
  const leaving = status === "leaving";

  const participantInitials = participants
    .map((participant) => participant.name?.charAt(0)?.toUpperCase())
    .filter(Boolean);

  const handleJoinMeeting = async () => {
    await joinMeeting({
      roomId: roomCode,
      userId: getUserId(user),
      userName: getUserName(user),
      isHost: true,
    });

    try {
      await startLocalMedia();
    } catch {}
  };

  const handleLeaveMeeting = async () => {
    await leaveMeeting();
    router.back();
  };

  const handleCopyRoomCode = async () => {
    if (Platform.OS === "web" && navigator?.clipboard) {
      await navigator.clipboard.writeText(roomCode);
      return;
    }

    Alert.alert("Room code", roomCode);
  };

  const handleShareRoom = async () => {
    await Share.share({
      message: `Join my Telefya meeting: ${roomCode}`,
    });
  };

  const handleSendMessage = async () => {
    const nextMessage = chatText.trim();
    if (!nextMessage) return;

    setChatText("");
    await sendMessage(nextMessage);
  };

  return (
    <AppScreen>
      <AppHeader
        eyebrow="MEETING ROOM"
        title={joined ? "Meeting in progress" : "Ready to join?"}
        subtitle={
          joined
            ? "You are connected to the live room."
            : "Preview your meeting details before entering the room."
        }
      />

      <AppCard
        style={[
          styles.roomCard,
          {
            backgroundColor: colors.surfaceStrong,
            borderRadius: Radius.large,
          },
        ]}
      >
        <View style={styles.roomTopRow}>
          <View style={styles.roomCopy}>
            <AppText variant="caption" tone="muted">
              Room code
            </AppText>
            <AppText variant="subtitle" style={styles.roomCode} numberOfLines={1}>
              {roomCode}
            </AppText>
          </View>

          {isHost ? (
            <View style={[styles.hostBadge, { backgroundColor: colors.primarySoft }]}>
              <ShieldCheck color={colors.primary} size={15} />
              <AppText variant="caption" tone="primary" style={styles.hostText}>
                Host
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.roomMeta}>
          <View style={styles.metaItem}>
            <CalendarDays color={colors.primary} size={18} />
            <AppText variant="caption" tone="muted">
              {joined ? "Live now" : "Starts now"}
            </AppText>
          </View>

          <ParticipantStack
            count={Math.max(participants.length, joined ? 1 : 4)}
            initials={participantInitials.length ? participantInitials : ["E", "T", "M"]}
          />
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.danger + "14" }]}>
            <AppText variant="caption" style={{ color: colors.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <View style={styles.shareRow}>
          {joined ? (
            <AppButton
              title={leaving ? "Leaving..." : "Leave meeting"}
              variant="danger"
              disabled={leaving}
              onPress={handleLeaveMeeting}
              containerStyle={styles.joinButton}
            />
          ) : (
            <AppButton
              title={joining ? "Joining..." : "Join meeting"}
              disabled={joining}
              loading={joining}
              onPress={handleJoinMeeting}
              containerStyle={styles.joinButton}
            />
          )}

          <IconButton
            icon={<Copy color={colors.primary} size={19} />}
            variant="soft"
            onPress={handleCopyRoomCode}
          />

          <IconButton
            icon={<Share2 color={colors.primary} size={19} />}
            variant="soft"
            onPress={handleShareRoom}
          />
        </View>
      </AppCard>

      <SectionHeader
        title={joined ? "Room controls" : "Device preview"}
        actionLabel={`${messages.length} chats`}
      />

      <AppCard style={styles.previewCard}>
        <View style={[styles.videoPreview, { backgroundColor: colors.primarySoft }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <AppText variant="subtitle" style={{ color: "#FFFFFF" }}>
              {getUserName(user).charAt(0).toUpperCase()}
            </AppText>
          </View>

          <AppText variant="bodyStrong" tone="primary" style={styles.previewTitle}>
            {joined ? "Connected to room" : "Camera preview"}
          </AppText>

          <AppText variant="caption" tone="primary" style={styles.previewText}>
            {Platform.OS === "web"
              ? "Live camera requires a native Expo dev build."
              : isCameraOff
                ? "Camera is off"
                : `${producers.length} remote media source(s) available.`}
          </AppText>
        </View>

        <View style={styles.controlRow}>
          <IconButton
            icon={
              isMuted ? (
                <MicOff color={colors.textMuted} size={20} />
              ) : (
                <Mic color={colors.primary} size={20} />
              )
            }
            variant={isMuted ? "ghost" : "soft"}
            onPress={toggleMute}
          />

          <IconButton
            icon={
              isCameraOff ? (
                <VideoOff color={colors.textMuted} size={20} />
              ) : (
                <Video color={colors.primary} size={20} />
              )
            }
            variant={isCameraOff ? "ghost" : "soft"}
            onPress={toggleCamera}
          />

          <IconButton
            icon={
              <Hand
                color={isHandRaised ? colors.primary : colors.textMuted}
                size={20}
              />
            }
            variant={isHandRaised ? "soft" : "ghost"}
            onPress={toggleHand}
          />

          <IconButton
            icon={<MessageCircle color={colors.primary} size={20} />}
            variant="soft"
          />

          <IconButton
            icon={<PhoneOff color="#FFFFFF" size={20} />}
            variant="solid"
            onPress={joined ? handleLeaveMeeting : () => router.back()}
          />
        </View>
      </AppCard>

      <SectionHeader title="Chat" actionLabel={`${messages.length}`} />

      <AppCard style={styles.chatCard}>
        <View style={styles.messages}>
          {messages.slice(-4).map((message) => (
            <View key={message.messageId} style={styles.messageRow}>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {message.userName}
              </AppText>
              <AppText variant="body" numberOfLines={2}>
                {message.message}
              </AppText>
            </View>
          ))}

          {messages.length === 0 ? (
            <AppText variant="caption" tone="muted" style={styles.emptyChat}>
              No messages yet.
            </AppText>
          ) : null}
        </View>

        <View style={styles.chatInputRow}>
          <TextInput
            value={chatText}
            onChangeText={setChatText}
            placeholder="Send a message"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.chatInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSendMessage}
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
          >
            <AppText variant="caption" style={styles.sendText}>
              Send
            </AppText>
          </TouchableOpacity>
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  roomCard: {
    gap: Spacing.four,
  },
  roomTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  roomCopy: {
    flex: 1,
    minWidth: 0,
  },
  roomCode: {
    marginTop: Spacing.one,
  },
  hostBadge: {
    minHeight: 30,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  hostText: {
    fontWeight: "800",
  },
  roomMeta: {
    gap: Spacing.three,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  errorBox: {
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  joinButton: {
    flex: 1,
  },
  previewCard: {
    gap: Spacing.four,
  },
  videoPreview: {
    minHeight: 220,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },
  previewTitle: {
    textAlign: "center",
    fontWeight: "800",
    marginBottom: Spacing.one,
  },
  previewText: {
    textAlign: "center",
    fontWeight: "700",
    maxWidth: 260,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  chatCard: {
    gap: Spacing.three,
  },
  messages: {
    gap: Spacing.two,
  },
  messageRow: {
    gap: 2,
  },
  emptyChat: {
    textAlign: "center",
    paddingVertical: Spacing.two,
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
  sendButton: {
    minHeight: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});