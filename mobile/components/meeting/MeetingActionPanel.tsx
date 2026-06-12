import { router } from "expo-router";
import { Link2, Plus, Video } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { GlassCard } from "@/components/ui/GlassCard";
import { Radius, SCREEN, Spacing } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

function createRoomId() {
  const token = Math.random().toString(36).slice(2, 8);
  return `telefya-${token}`;
}

export function MeetingActionPanel() {
  const feedback = useFeedback();
  const { colors } = useAppTheme();

  function handleStartMeeting() {
    feedback.joinMeeting();
    router.push(`/meeting/${createRoomId()}`);
  }

  function handleCreateLink() {
    feedback.message();
    router.push("/(tabs)/scheduler");
  }

  return (
    <GlassCard style={styles.card} radius={Radius.large}>
      <View style={styles.headerRow}>
        <View style={[styles.iconShell, { backgroundColor: colors.primarySoft }]}>
          <Video color={colors.primary} size={22} />
        </View>

        <View style={styles.copyWrap}>
          <AppText variant="subtitle">Start or schedule</AppText>
          <AppText variant="caption" tone="muted" style={styles.copy}>
            Open a live room now or prepare a shareable meeting link.
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Start instant meeting"
          size={SCREEN.isShortHeight ? "md" : "lg"}
          onPress={handleStartMeeting}
          leftIcon={<Plus color="#FFFFFF" size={18} />}
        />

        <AppButton
          title="Create meeting link"
          variant="secondary"
          size={SCREEN.isShortHeight ? "md" : "lg"}
          onPress={handleCreateLink}
          leftIcon={<Link2 color={colors.primary} size={18} />}
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SCREEN.isShortHeight ? Spacing.three : Spacing.four,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
  },
  copy: {
    marginTop: Spacing.one,
  },
  actions: {
    gap: Spacing.three,
  },
});