import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  LockKeyhole,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { MeetingMessage } from "@/types/meeting.types";

type Props = {
  messages: MeetingMessage[];
  joined: boolean;
  currentSocketId?: string | null;
  onClose?: () => void;
  onSend: (message: string) => Promise<void> | void;
  onEdit?: (
    messageId: string,
    message: string,
  ) => Promise<void> | void;
  onDelete?: (messageId: string) => Promise<void> | void;
};

function formatMessageTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatPanel({
  messages,
  joined,
  currentSocketId,
  onClose,
  onSend,
  onEdit,
  onDelete,
}: Props) {
  const { colors, isDark } = useAppTheme();

  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [editingMessage, setEditingMessage] =
    React.useState<MeetingMessage | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages.length]);

  function isMyMessage(message: MeetingMessage) {
    return Boolean(currentSocketId) &&
      message.socketId === currentSocketId;
  }

  function cancelEditing() {
    setEditingMessage(null);
    setText("");
  }

  function beginEditing(message: MeetingMessage) {
    setEditingMessage(message);
    setText(message.message);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function showMessageActions(message: MeetingMessage) {
    if (!isMyMessage(message)) {
      return;
    }

    Alert.alert("Your message", undefined, [
      {
        text: "Edit",
        onPress: () => beginEditing(message),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void onDelete?.(message.messageId);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleSend() {
    const value = text.trim();

    if (!value || !joined || sending) {
      return;
    }

    setSending(true);

    try {
      if (editingMessage) {
        await onEdit?.(editingMessage.messageId, value);
        cancelEditing();
      } else {
        setText("");
        await onSend(value);
      }
    } catch {
      // Keep the draft intact if a future backend implementation rejects it.
      setText(value);
    } finally {
      setSending(false);
    }
  }

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          backgroundColor: isDark
            ? "rgba(9, 21, 45, 0.98)"
            : colors.card,
          borderColor: isDark
            ? "rgba(255,255,255,0.12)"
            : colors.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.topHighlight,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.11)"
              : colors.glassHighlight,
          },
        ]}
      />

      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headingIcon}
          >
            <MessageCircle color="#FFFFFF" size={18} />
          </LinearGradient>

          <View style={styles.headingText}>
            <AppText variant="sectionTitle">In-meeting chat</AppText>

            <View style={styles.audienceRow}>
              <Users color={colors.textSoft} size={13} />
              <AppText variant="caption" tone="muted">
                Everyone in this meeting
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: colors.primarySoft,
                borderColor: `${colors.primary}33`,
              },
            ]}
          >
            <AppText
              variant="label"
              style={[styles.countText, { color: colors.primary }]}
            >
              {messages.length}
            </AppText>
          </View>

          {onClose ? (
            <IconButton
              icon={<X color={colors.text} size={18} />}
              variant="surface"
              size={36}
              accessibilityLabel="Close meeting chat"
              onPress={onClose}
            />
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.divider },
        ]}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageScroller}
        contentContainerStyle={[
          styles.messageContent,
          messages.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const senderName =
              message.userName?.trim() || "Participant";
            const mine = isMyMessage(message);

            return (
              <Pressable
                key={message.messageId}
                disabled={!mine}
                onLongPress={() => showMessageActions(message)}
                delayLongPress={350}
                accessibilityRole={mine ? "button" : undefined}
                accessibilityLabel={
                  mine
                    ? "Your message. Hold to edit or delete."
                    : undefined
                }
                style={({ pressed }) => [
                  styles.messageRow,
                  mine && styles.messageRowMine,
                  {
                    opacity: pressed && mine ? 0.74 : 1,
                  },
                ]}
              >
                {!mine ? (
                  <View
                    style={[
                      styles.senderAvatar,
                      {
                        backgroundColor:
                          index % 2 === 0
                            ? colors.primarySoft
                            : colors.secondarySoft,
                      },
                    ]}
                  >
                    <AppText
                      variant="label"
                      style={{
                        color:
                          index % 2 === 0
                            ? colors.primary
                            : colors.secondary,
                        fontWeight: "900",
                      }}
                    >
                      {senderName.charAt(0).toUpperCase()}
                    </AppText>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.messageCopy,
                    mine && styles.messageCopyMine,
                  ]}
                >
                  <View style={styles.senderRow}>
                    <AppText
                      variant="caption"
                      numberOfLines={1}
                      style={[
                        styles.senderName,
                        { color: mine ? colors.primary : colors.text },
                      ]}
                    >
                      {mine ? "You" : senderName}
                    </AppText>

                    <AppText variant="caption" tone="muted">
                      {formatMessageTime(message.time)}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor: mine
                          ? colors.primarySoft
                          : isDark
                            ? "rgba(255,255,255,0.07)"
                            : colors.surfaceStrong,
                        borderColor: mine
                          ? `${colors.primary}35`
                          : isDark
                            ? "rgba(255,255,255,0.08)"
                            : colors.glassBorder,
                      },
                    ]}
                  >
                    <AppText variant="body" style={styles.messageText}>
                      {message.message}
                    </AppText>

                    {message.edited ? (
                      <AppText
                        variant="caption"
                        tone="muted"
                        style={styles.editedLabel}
                      >
                        Edited
                      </AppText>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <MessageCircle color={colors.primary} size={23} />
            </View>

            <AppText variant="bodyStrong">
              Start the conversation
            </AppText>

            <AppText
              variant="caption"
              tone="muted"
              style={styles.emptyDescription}
            >
              Messages are visible to everyone in this meeting.
            </AppText>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.composerArea}>
          {editingMessage ? (
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
                style={[styles.editingText, { color: colors.primary }]}
              >
                Editing your message
              </AppText>

              <Pressable
                onPress={cancelEditing}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing message"
              >
                <X color={colors.primary} size={16} />
              </Pressable>
            </View>
          ) : null}

          <View
            style={[
              styles.composer,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : colors.surfaceStrong,
                borderColor: joined
                  ? isDark
                    ? "rgba(255,255,255,0.13)"
                    : colors.borderStrong
                  : colors.border,
                opacity: joined ? 1 : 0.62,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              editable={joined && !sending}
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => void handleSend()}
              placeholder={
                joined
                  ? editingMessage
                    ? "Update your message..."
                    : "Message everyone..."
                  : "Join the meeting to chat"
              }
              placeholderTextColor={colors.textSoft}
              accessibilityLabel="Meeting chat message"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.16)"
                    : colors.card,
                },
              ]}
            />

            <Pressable
              disabled={!joined || !text.trim() || sending}
              onPress={() => void handleSend()}
              accessibilityRole="button"
              accessibilityLabel={
                editingMessage
                  ? "Save edited chat message"
                  : "Send chat message"
              }
              style={({ pressed }) => [
                styles.send,
                {
                  opacity:
                    !joined || !text.trim() || sending
                      ? 0.35
                      : pressed
                        ? 0.78
                        : 1,
                },
              ]}
            >
              <LinearGradient
                colors={BRAND_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}
              >
                {editingMessage ? (
                  <Pencil color="#FFFFFF" size={18} />
                ) : (
                  <Send color="#FFFFFF" size={18} />
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {!joined ? (
            <View style={styles.privateNotice}>
              <LockKeyhole color={colors.textSoft} size={13} />
              <AppText variant="caption" tone="muted">
                Join the meeting before sending a message.
              </AppText>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 1,
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(127, 145, 176, 0.55)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  headingIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  headingText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  countText: {
    fontWeight: "900",
  },

  divider: {
    height: 1,
    width: "100%",
  },

  messageScroller: {
    flex: 1,
    minHeight: 0,
  },

  messageContent: {
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },

  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },

  messageRowMine: {
    justifyContent: "flex-end",
  },

  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  messageCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },

  messageCopyMine: {
    flex: 0,
    maxWidth: "84%",
  },

  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  senderName: {
    flex: 1,
    fontWeight: "800",
  },

  messageBubble: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderTopLeftRadius: 5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  messageText: {
    lineHeight: 21,
  },

  editedLabel: {
    marginTop: 4,
    fontStyle: "italic",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.five,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  emptyDescription: {
    maxWidth: 250,
    textAlign: "center",
    lineHeight: 20,
  },

  composerArea: {
    flexShrink: 0,
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

  composer: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    maxHeight: 96,
    borderRadius: Radius.medium,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
  },

  send: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: Radius.medium,
  },

  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  privateNotice: {
    marginTop: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
});