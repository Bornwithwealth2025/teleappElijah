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
import { LinearGradient } from "expo-linear-gradient";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { Radius, Spacing } from "@/constants/theme";
import type { WaitingRoomRequest } from "@/types/meeting.types";

type Props = {
  requests: WaitingRoomRequest[];
  busy?: boolean;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onAdmitAll: () => void;
};

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "P";
}

export function HostJoinRequestBanner({
  requests,
  busy = false,
  onApprove,
  onDecline,
  onAdmitAll,
}: Props) {
  if (!requests.length) {
    return null;
  }

  const request = requests[0];
  const remainingCount = requests.length - 1;

  return (
    <View style={styles.overlay}>
      <View style={styles.topLine} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>
            {getInitial(request.userName)}
          </AppText>

          <View style={styles.avatarStatus} />
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <AppText
              variant="bodyStrong"
              style={styles.title}
              numberOfLines={1}
            >
              {request.userName || "Participant"} wants to join
            </AppText>

            <View style={styles.waitingPill}>
              <UsersRound color="#A9CBFF" size={12} />
              <AppText style={styles.waitingCount}>
                {requests.length}
              </AppText>
            </View>
          </View>

          <AppText variant="caption" style={styles.subtitle}>
            {remainingCount > 0
              ? `${remainingCount} more waiting in the lobby`
              : "Waiting in the lobby"}
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
            styles.declineButton,
            {
              opacity: busy ? 0.55 : pressed ? 0.74 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#FF958B" size="small" />
          ) : (
            <>
              <X color="#FF958B" size={16} />
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
            styles.approveButton,
            {
              opacity: busy ? 0.55 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.approveGradient}
          >
            <Check color="#FFFFFF" size={17} />
            <AppText style={styles.approveText}>Admit</AppText>
          </LinearGradient>
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
              opacity: busy ? 0.55 : pressed ? 0.75 : 1,
            },
          ]}
        >
          <UserPlus color="#A9CBFF" size={15} />
          <AppText style={styles.admitAllText}>
            Admit all {requests.length}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(104, 170, 255, 0.42)",
    borderRadius: Radius.large,
    backgroundColor: "rgba(7, 22, 51, 0.94)",
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },

  topLine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(120, 173, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(120, 173, 255, 0.50)",
  },

  avatarText: {
    color: "#DDEAFF",
    fontWeight: "900",
  },

  avatarStatus: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: Radius.pill,
    backgroundColor: "#42E5A0",
    borderWidth: 2,
    borderColor: "#071633",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  title: {
    flex: 1,
    color: "#F5F8FF",
  },

  subtitle: {
    color: "rgba(218, 231, 255, 0.72)",
  },

  waitingPill: {
    minWidth: 30,
    height: 24,
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "rgba(120, 173, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(120, 173, 255, 0.25)",
  },

  waitingCount: {
    color: "#A9CBFF",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  declineButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: "rgba(255, 107, 94, 0.52)",
    backgroundColor: "rgba(255, 75, 62, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  approveButton: {
    flex: 1.15,
    minHeight: 42,
    overflow: "hidden",
    borderRadius: Radius.medium,
  },

  approveGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  declineText: {
    color: "#FF958B",
    fontWeight: "800",
  },

  approveText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  admitAll: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: "rgba(169, 203, 255, 0.28)",
    backgroundColor: "rgba(255,255,255,0.045)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  admitAllText: {
    color: "#A9CBFF",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800",
  },
});