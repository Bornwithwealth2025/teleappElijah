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
import { Send } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
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
  const inputRef = useRef<TextInput>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

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

  async function handleSend() {
    const value = text.trim();

    if (!value || !joined || sending) {
      return;
    }

    setSending(true);
    setText("");

    try {
      await onSend(value);
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
      <AppCard elevated variant="soft" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <AppText variant="sectionTitle">
              Room chat
            </AppText>

            <AppText variant="caption" tone="muted">
              Messages shared with participants.
            </AppText>
          </View>

          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <AppText variant="caption" tone="primary">
              {messages.length}
            </AppText>
          </View>
        </View>

        <View style={styles.messages}>
          {visibleMessages.map((message, index) => (
            <Animated.View
              key={message.messageId ?? `${message.message}-${index}`}
              style={[
                styles.message,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                tone="primary"
                style={styles.sender}
              >
                {message.userName || "Participant"}
              </AppText>

              <AppText variant="body">
                {message.message}
              </AppText>
            </Animated.View>
          ))}

          {messages.length === 0 ? (
            <View style={styles.empty}>
              <AppText variant="bodyStrong">
                No messages yet
              </AppText>

              <AppText variant="caption" tone="muted">
                Start the conversation with your meeting team.
              </AppText>
            </View>
          ) : null}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.inputShell,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: joined ? 1 : 0.6,
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
                joined ? "Write a message..." : "Join to chat"
              }
              placeholderTextColor={colors.textSoft}
              accessibilityLabel="Meeting chat message"
              style={[
                styles.input,
                { color: colors.text },
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
                  backgroundColor: colors.primary,
                  opacity:
                    !joined || !text.trim() || sending
                      ? 0.42
                      : pressed
                        ? 0.78
                        : 1,
                },
              ]}
            >
              <Send color="#FFFFFF" size={17} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  card: {
    gap: Spacing.four,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.three,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  messages: {
    gap: Spacing.two,
  },

  message: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 3,
  },

  sender: {
    fontWeight: "800",
  },

  empty: {
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },

  inputShell: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingLeft: Spacing.three,
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 92,
    fontSize: 15,
    lineHeight: 21,
    paddingVertical: Spacing.two,
  },

  send: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
});