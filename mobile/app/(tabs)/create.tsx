import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarPlus,
  ChevronRight,
  Link2,
  Plus,
  Video,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import UserService from "@/api/user.service";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Tap } from "@/components/ui/Tap";
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
  accent: string;
  onPress: () => void;
};

function ActionRow({
  icon,
  title,
  description,
  accent,
  onPress,
}: ActionRowProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Tap label={title} onPress={onPress} style={styles.fullWidth}>
      <View
        style={[
          styles.secondaryAction,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.045)"
              : colors.card,
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : colors.border,
          },
        ]}
      >
        <View style={[styles.secondaryIcon, { backgroundColor: accent }]}>
          {icon}
        </View>

        <View style={styles.secondaryCopy}>
          <AppText
            numberOfLines={1}
            style={[styles.secondaryTitle, { color: colors.text }]}
          >
            {title}
          </AppText>

          <AppText
            numberOfLines={2}
            style={[styles.secondaryDescription, { color: colors.textMuted }]}
          >
            {description}
          </AppText>
        </View>

        <View style={styles.arrowShell}>
          <ChevronRight color={colors.textMuted} size={22} />
        </View>
      </View>
    </Tap>
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
            Start instant meeting
          </AppText>

          <AppText style={styles.primaryDescription}>
            Open your room now. You are the host and can share the link immediately.
          </AppText>
        </View>

        <Tap
          label="Start instant meeting"
          disabled={isStarting}
          onPress={startNow}
          style={styles.fullWidth}
        >
          <View style={styles.primaryButton}>
            <View style={styles.primaryButtonIcon}>
              <Plus color="#FFFFFF" size={20} strokeWidth={2.8} />
            </View>

            <AppText numberOfLines={1} style={styles.primaryButtonText}>
              {isStarting ? "Starting meeting..." : "Start instant meeting"}
            </AppText>

            <View style={styles.primaryButtonChevron}>
              <ChevronRight color="#0F6BFF" size={21} strokeWidth={2.6} />
            </View>
          </View>
        </Tap>
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
          icon={<Link2 color="#FFFFFF" size={22} />}
          title="Join with a meeting link"
          description="Paste a Telefya link and request access from the host."
          accent={colors.secondary}
          onPress={() => router.push("/meeting/join")}
        />

        <ActionRow
          icon={<CalendarPlus color="#FFFFFF" size={22} />}
          title="Schedule a meeting"
          description="Choose a date and time, then invite people to join."
          accent={colors.primary}
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

  fullWidth: {
    width: "100%",
  },

  primaryAction: {
    borderRadius: Radius.card,
    padding: Spacing.four,
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
    gap: 4,
  },

  primaryTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  primaryDescription: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  primaryButton: {
    width: "100%",
    height: 62,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    shadowColor: "#061A3A",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  primaryButtonIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6BFF",
  },

  primaryButtonText: {
    flex: 1,
    textAlign: "center",
    color: "#0B2D75",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },

  primaryButtonChevron: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,107,255,0.10)",
  },

  section: {
    width: "100%",
    gap: Spacing.three,
  },

  secondaryAction: {
    width: "100%",
    height: 88,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  secondaryIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  secondaryTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  secondaryDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  arrowShell: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});