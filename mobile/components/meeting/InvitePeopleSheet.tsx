import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  Mail,
  Send,
  UserPlus,
  X,
} from "lucide-react-native";

import MeetingInvitationService from "@/api/meeting-invitation.service";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type InvitePeopleSheetProps = {
  visible: boolean;
  meetingId: string | number | null;
  meetingTitle: string;
  onClose: () => void;
};

export function InvitePeopleSheet({
  visible,
  meetingId,
  meetingTitle,
  onClose,
}: InvitePeopleSheetProps) {
  const { colors } = useAppTheme();

  const [email, setEmail] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  function close() {
    if (isSending) return;
    setEmail("");
    setError("");
    setSuccess("");
    onClose();
  }

  async function sendInvite() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!meetingId || !normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setIsSending(true);
      setError("");
      setSuccess("");

      const response = await MeetingInvitationService.inviteMember(
        meetingId,
        {
          email: normalizedEmail,
          member_role: "attendee",
        },
      );

      if (response?.success === false) {
        throw new Error(
          response.message || "Unable to send invitation.",
        );
      }

      const delivery = response?.data?.delivery;

      setSuccess(
        delivery === "email"
          ? "Email invitation sent. They can join on the web or install Telefya."
          : "Invitation sent. They will receive it in Telefya.",
      );
      setEmail("");
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to send invitation.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={close}
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

          <View style={styles.header}>
            <View
              style={[
                styles.icon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <UserPlus color={colors.primary} size={21} />
            </View>

            <View style={styles.copy}>
              <AppText variant="sectionTitle">
                Invite people
              </AppText>

              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {meetingTitle}
              </AppText>
            </View>

            <IconButton
              icon={<X color={colors.text} size={19} />}
              variant="ghost"
              size={40}
              accessibilityLabel="Close invite people"
              onPress={close}
            />
          </View>

          <View
            style={[
              styles.inputShell,
              {
                backgroundColor: colors.surface,
                borderColor: error
                  ? colors.danger
                  : colors.border,
              },
            ]}
          >
            <Mail color={colors.primary} size={19} />

            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError("");
                setSuccess("");
              }}
              placeholder="name@example.com"
              placeholderTextColor={colors.textSoft}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={() => void sendInvite()}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {error ? (
            <AppText
              variant="caption"
              style={{ color: colors.danger, fontWeight: "700" }}
            >
              {error}
            </AppText>
          ) : null}

          {success ? (
            <AppText
              variant="caption"
              style={{ color: colors.success, fontWeight: "700" }}
            >
              {success}
            </AppText>
          ) : null}

          <AppButton
            title={isSending ? "Sending invite..." : "Send invitation"}
            variant="gradient"
            loading={isSending}
            disabled={isSending || !email.trim()}
            leftIcon={<Send color="#FFFFFF" size={18} />}
            onPress={() => void sendInvite()}
          />

          <AppText variant="caption" tone="muted">
            Telefya users receive an in-app alert. Guests receive a secure email invitation.
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
    alignSelf: "center",
    marginBottom: Spacing.one,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  inputShell: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    padding: 0,
    fontSize: 15,
    fontWeight: "600",
  },
});