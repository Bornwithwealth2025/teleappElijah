import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  LockKeyhole,
  MessageCircle,
  Send,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { MeetingMessage } from "@/types/meeting.types";

type Props = {
  messages: MeetingMessage[];
  joined: boolean;
  onSend: (message: string) => Promise<void> | void;
};

export function ChatPanel({
  messages,
  joined,
  onSend,
}: Props) {
  const { colors } = useAppTheme();
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY]);

  async function handleSend() {
    const value = text.trim();

    if (!value || !joined || sending) {
      return;
    }

    setSending(true);
    setText("");

    try {
      await onSend(value);
    } catch {
      setText(value);
    } finally {
      setSending(false);
    }
  }

  const visibleMessages = messages.slice(-8);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <View style={styles.headingRow}>
              <LinearGradient
                colors={BRAND_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headingIcon}
              >
                <MessageCircle color="#FFFFFF" size={17} />
              </LinearGradient>

              <View style={styles.headingCopy}>
                <AppText variant="sectionTitle">
                  Meeting chat
                </AppText>

                <AppText variant="caption" tone="muted">
                  Keep everyone in the conversation.
                </AppText>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: colors.primarySoft,
                borderColor: `${colors.primary}28`,
              },
            ]}
          >
            <AppText
              variant="label"
              style={{ color: colors.primary }}
            >
              {messages.length}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.messageArea,
            {
              backgroundColor: colors.surfaceStrong,
              borderColor: colors.border,
            },
          ]}
        >
          {visibleMessages.length > 0 ? (
            <View style={styles.messages}>
              {visibleMessages.map((message, index) => (
                <View
                  key={
                    message.messageId ??
                    `${message.userName}-${message.message}-${index}`
                  }
                  style={[
                    styles.message,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.glassBorder,
                    },
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <View
                      style={[
                        styles.senderAvatar,
                        { backgroundColor: colors.secondarySoft },
                      ]}
                    >
                      <AppText
                        variant="label"
                        style={{
                          color: colors.secondary,
                          fontWeight: "900",
                        }}
                      >
                        {(message.userName || "P")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </AppText>
                    </View>

                    <AppText
                      variant="caption"
                      style={[
                        styles.sender,
                        { color: colors.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {message.userName || "Participant"}
                    </AppText>
                  </View>

                  <AppText variant="body" style={styles.messageText}>
                    {message.message}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <MessageCircle color={colors.primary} size={20} />
              </View>

              <AppText variant="bodyStrong">
                No messages yet
              </AppText>

              <AppText
                variant="caption"
                tone="muted"
                style={styles.emptyDescription}
              >
                Start the conversation with everyone in this meeting.
              </AppText>
            </View>
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.inputShell,
              {
                backgroundColor: colors.surface,
                borderColor: joined
                  ? colors.borderStrong
                  : colors.border,
                opacity: joined ? 1 : 0.62,
              },
            ]}
          >
            <TextInput
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
                  ? "Write a message..."
                  : "Join the meeting to chat"
              }
              placeholderTextColor={colors.textSoft}
              accessibilityLabel="Meeting chat message"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
            />

            <Pressable
              disabled={!joined || !text.trim() || sending}
              onPress={() => void handleSend()}
              accessibilityRole="button"
              accessibilityLabel="Send chat message"
              style={({ pressed }) => [
                styles.send,
                {
                  opacity:
                    !joined || !text.trim() || sending
                      ? 0.38
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
                <Send color="#FFFFFF" size={18} />
              </LinearGradient>
            </Pressable>
          </View>

          {!joined ? (
            <View style={styles.privateNotice}>
              <LockKeyhole color={colors.textSoft} size={12} />
              <AppText variant="caption" tone="muted">
                Join the meeting to send messages.
              </AppText>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  card: {
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.three,
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
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  headingIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  headingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },

  messageArea: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.two,
  },

  messages: {
    gap: Spacing.two,
  },

  message: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },

  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  sender: {
    flex: 1,
    fontWeight: "800",
  },

  messageText: {
    lineHeight: 21,
  },

  empty: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  emptyDescription: {
    textAlign: "center",
  },

  inputShell: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 96,
    borderRadius: Radius.medium,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },

  send: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    overflow: "hidden",
  },

  sendGradient: {
    width: "100%",
    height: "100%",
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