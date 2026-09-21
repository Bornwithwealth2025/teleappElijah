import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarPlus,
  CircleCheck,
  Link2,
  Plus,
  Video,
} from "lucide-react-native";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import UserService from "@/api/user.service";

import {
  AppButton,
  BRAND_GRADIENT,
} from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import {
  createMeetingUrl,
  createRoomId,
  getLocalTimeZone,
} from "@/utils/meetingLinks";

export function MeetingActionPanel() {
  const feedback = useFeedback();
  const [isStarting, setIsStarting] = React.useState(false);

  async function handleStartMeeting() {
    if (isStarting) return;

    try {
      setIsStarting(true);
      feedback.joinMeeting();

      const roomId = createRoomId();

      const response = await UserService.startInstantMeeting({
        path: createMeetingUrl(roomId),
        timeZone: getLocalTimeZone(),
        des: "Instant Telefya meeting",
      });

      const activeRoomId = response?.data?.room_id ?? roomId;

      router.push({
        pathname: "/meeting/[meetingId]",
        params: {
          meetingId: activeRoomId,
          host: "true",
        },
      });
    } catch (error) {
      Alert.alert(
        "Unable to start meeting",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  function handleScheduleMeeting() {
    feedback.message();
    router.push("/(tabs)/scheduler");
  }

  return (
    <LinearGradient
      colors={BRAND_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.surface}
    >
      <View style={styles.topHighlight} />

      <View style={styles.header}>
        <View style={styles.videoIcon}>
          <Video color="#FFFFFF" size={22} />
        </View>

        <View style={styles.readyPill}>
          <CircleCheck color="#B8F6D8" size={14} />
          <AppText numberOfLines={1} style={styles.readyLabel}>
            READY TO MEET
          </AppText>
        </View>
      </View>

      <View style={styles.copyWrap}>
        <AppText style={styles.title}>Meet with confidence.</AppText>

        <AppText style={styles.copy}>
          Start a secure room now, or plan a meeting your team can join later.
        </AppText>
      </View>

      <AppButton
        title={isStarting ? "Starting meeting..." : "Start instant meeting"}
        variant="outline"
        textColor="#FFFFFF"
        loading={isStarting}
        disabled={isStarting}
        leftIcon={<Plus color="#FFFFFF" size={20} />}
        rightIcon={<Video color="#FFFFFF" size={18} />}
        contentAlign="spaceBetween"
        style={styles.primaryButton}
        onPress={() => void handleStartMeeting()}
      />

      <View style={styles.footerActions}>
        <Pressable
          onPress={handleScheduleMeeting}
          accessibilityRole="button"
          accessibilityLabel="Schedule a meeting"
          style={({ pressed }) => [
            styles.footerAction,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.footerActionIcon}>
            <CalendarPlus color="#FFFFFF" size={17} />
          </View>

          <AppText numberOfLines={1} style={styles.footerActionText}>
            Schedule
          </AppText>
        </Pressable>

        <Pressable
          onPress={handleScheduleMeeting}
          accessibilityRole="button"
          accessibilityLabel="Create a meeting link"
          style={({ pressed }) => [
            styles.footerAction,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.footerActionIcon}>
            <Link2 color="#FFFFFF" size={17} />
          </View>

          <AppText numberOfLines={1} style={styles.footerActionText}>
            Create link
          </AppText>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  surface: {
    minHeight: 286,
    overflow: "hidden",
    borderRadius: Radius.card,
    padding: Spacing.five,
    gap: Spacing.four,
    ...Shadows.enterprise,
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  videoIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,13,43,0.32)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  readyPill: {
    minHeight: 30,
    maxWidth: 148,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(3,13,43,0.40)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  readyLabel: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.45,
  },

  copyWrap: {
    gap: Spacing.one,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.65,
  },

  copy: {
    maxWidth: 315,
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },

  primaryButton: {
    marginTop: Spacing.one,
    backgroundColor: "rgba(2,6,24,0.2)",
    borderColor: "rgba(255,255,255,0.46)",
  },

  footerActions: {
    width: "100%",
    flexDirection: "row",
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: Spacing.three,
  },

  footerAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: Radius.medium,
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(3,13,43,0.18)",
  },

  footerActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,13,43,0.26)",
  },

  footerActionText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});