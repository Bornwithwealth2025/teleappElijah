import React from "react";
import {
  Check,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { WaitingRoomRequest } from "@/types/meeting.types";

type Props = {
  requests: WaitingRoomRequest[];
  busy?: boolean;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onAdmitAll: () => void;
};

export function HostJoinRequestBanner({
  requests,
  busy = false,
  onApprove,
  onDecline,
  onAdmitAll,
}: Props) {
  const { colors } = useAppTheme();

  if (!requests.length) {
    return null;
  }

  const request = requests[0];
  const remainingCount = requests.length - 1;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: "rgba(15, 107, 255, 0.16)",
          borderColor: "rgba(91, 155, 255, 0.48)",
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.icon,
            { backgroundColor: "rgba(15, 107, 255, 0.24)" },
          ]}
        >
          <UserPlus color="#78ADFF" size={19} />
        </View>

        <View style={styles.copy}>
          <AppText
            variant="bodyStrong"
            style={styles.title}
            numberOfLines={1}
          >
            {request.userName} wants to join
          </AppText>

          <AppText variant="caption" style={styles.subtitle}>
            {remainingCount > 0
              ? `Plus ${remainingCount} more waiting`
              : "Review their request to enter"}
          </AppText>
        </View>

        <View
          style={[
            styles.count,
            { backgroundColor: "rgba(120, 173, 255, 0.18)" },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: "#A9CBFF", fontWeight: "800" }}
          >
            {requests.length}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          disabled={busy}
          onPress={() => onDecline(request.requestId)}
          accessibilityRole="button"
          accessibilityLabel={`Decline ${request.userName}`}
          style={({ pressed }) => [
            styles.actionButton,
            styles.declineButton,
            {
              borderColor: "rgba(255, 107, 94, 0.55)",
              opacity: busy ? 0.5 : pressed ? 0.78 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#FF8478" size="small" />
          ) : (
            <>
              <X color="#FF8478" size={16} />
              <AppText style={styles.declineText}>Decline</AppText>
            </>
          )}
        </Pressable>

        <Pressable
          disabled={busy}
          onPress={() => onApprove(request.requestId)}
          accessibilityRole="button"
          accessibilityLabel={`Admit ${request.userName}`}
          style={({ pressed }) => [
            styles.actionButton,
            styles.approveButton,
            {
              opacity: busy ? 0.5 : pressed ? 0.82 : 1,
            },
          ]}
        >
          <Check color="#FFFFFF" size={16} />
          <AppText style={styles.approveText}>Admit</AppText>
        </Pressable>
      </View>

      {requests.length > 1 ? (
        <Pressable
          disabled={busy}
          onPress={onAdmitAll}
          accessibilityRole="button"
          accessibilityLabel={`Admit all ${requests.length} waiting participants`}
          style={({ pressed }) => [
            styles.admitAll,
            {
              borderColor: colors.border,
              opacity: busy ? 0.5 : pressed ? 0.78 : 1,
            },
          ]}
        >
          <UsersRound color="#A9CBFF" size={16} />
          <AppText style={styles.admitAllText}>
            Admit all {requests.length} participants
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  title: {
    color: "#F4F7FF",
  },

  subtitle: {
    color: "rgba(218, 231, 255, 0.72)",
  },

  count: {
    minWidth: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  declineButton: {
    borderWidth: 1,
    backgroundColor: "rgba(255, 75, 62, 0.08)",
  },

  approveButton: {
    backgroundColor: "#0F6BFF",
  },

  declineText: {
    color: "#FF8478",
    fontWeight: "800",
  },

  approveText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  admitAll: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  admitAllText: {
    color: "#A9CBFF",
    fontSize: 13,
    fontWeight: "800",
  },
});