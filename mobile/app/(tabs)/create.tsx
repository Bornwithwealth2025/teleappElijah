import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarPlus,
  ChevronRight,
  Link2,
  Video,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import UserService from "@/api/user.service";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import {
  createMeetingUrl,
  createRoomId,
  getLocalTimeZone,
} from "@/utils/meetingLinks";

type ActionRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
};

function ActionRow({
  icon,
  title,
  description,
  onPress,
}: ActionRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryAction,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.secondaryIcon,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        {icon}
      </View>

      <View style={styles.secondaryCopy}>
        <AppText variant="bodyStrong">{title}</AppText>

        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {description}
        </AppText>
      </View>

      <View
        style={[
          styles.arrowShell,
          { backgroundColor: colors.surfaceStrong },
        ]}
      >
        <ChevronRight color={colors.primary} size={19} />
      </View>
    </Pressable>
  );
}

export default function QuickMeetingScreen() {
  const { colors } = useAppTheme();
  const [isStarting, setIsStarting] = React.useState(false);
  const [startError, setStartError] = React.useState("");

  async function startNow() {
    if (isStarting) return;

    const roomId = createRoomId();

    try {
      setIsStarting(true);
      setStartError("");

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
      setStartError(
        error instanceof Error
          ? error.message
          : "Unable to start the meeting.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <AppScreen tone="aurora" contentStyle={styles.content}>
      <AppHeader
        eyebrow="QUICK MEETING"
        title="Meet on your terms"
        subtitle="Start a room now, join a shared meeting, or plan one for later."
        size="page"
      />

      <LinearGradient
        colors={BRAND_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryAction}
      >
        <View style={styles.primaryIcon}>
          <Video color="#FFFFFF" size={23} />
        </View>

        <View style={styles.primaryCopy}>
          <AppText style={styles.primaryTitle}>
            {isStarting ? "Starting meeting..." : "Start instant meeting"}
          </AppText>

          <AppText style={styles.primaryDescription}>
            Open your room now. You are the host and can share the link immediately.
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start instant meeting"
          onPress={startNow}
          style={({ pressed }) => [
            styles.primaryArrow,
            pressed && styles.pressed,
          ]}
        >
          <ChevronRight color="#FFFFFF" size={22} />
        </Pressable>
      </LinearGradient>

      {startError ? (
        <AppText
          variant="caption"
          style={{ color: colors.danger, fontWeight: "700" }}
        >
          {startError}
        </AppText>
      ) : null}

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          OTHER OPTIONS
        </AppText>

        <ActionRow
          icon={<Link2 color={colors.secondary} size={21} />}
          title="Join with a meeting link"
          description="Paste a Telefya link and request access from the host."
          onPress={() => router.push("/meeting/join")}
        />

        <ActionRow
          icon={<CalendarPlus color={colors.accent} size={21} />}
          title="Schedule a meeting"
          description="Choose a date and time, then invite people to join."
          onPress={() => router.push("/(tabs)/scheduler")}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  primaryAction: {
    minHeight: 148,
    borderRadius: Radius.card,
    padding: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    ...Shadows.enterprise,
  },

  primaryIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,13,43,0.24)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  primaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  primaryTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
  },

  primaryDescription: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  primaryArrow: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,13,43,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  section: {
    gap: Spacing.two,
  },

  secondaryAction: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  secondaryIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  arrowShell: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});