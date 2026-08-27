import React from "react";
import { router } from "expo-router";
import {
  CalendarPlus,
  CircleCheck,
  Link2,
  Plus,
  Video,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, SCREEN, Spacing } from "@/constants/theme";
import { useFeedback } from "@/contexts/feedback-context";
import { useAppTheme } from "@/hooks/use-app-themes";

function createRoomId() {
  const token = Math.random()
    .toString(36)
    .slice(2, 10);

  return `telefya-${token}`;
}

export function MeetingActionPanel() {
  const feedback = useFeedback();
  const { colors } = useAppTheme();

  function handleStartMeeting() {
    feedback.joinMeeting();

    router.push({
      pathname: "/meeting/[meetingId]",
      params: {
        meetingId: createRoomId(),
      },
    });
  }

  function handleCreateLink() {
    feedback.message();
    router.push("/(tabs)/scheduler");
  }

  return (
    <AppCard elevated style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <Video color={colors.primary} size={21} />
        </View>

        <View style={styles.copyWrap}>
          <View style={styles.liveRow}>
            <CircleCheck color={colors.success} size={13} />

            <AppText variant="overline" tone="primary">
              READY WHEN YOU ARE
            </AppText>
          </View>

          <AppText variant="sectionTitle" style={styles.title}>
            Meet with confidence.
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.copy}
          >
            Start now or schedule a shareable link for later.
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Start instant meeting"
          size={SCREEN.isShortHeight ? "md" : "lg"}
          onPress={handleStartMeeting}
          leftIcon={<Plus color="#FFFFFF" size={19} />}
        />

        <View style={styles.secondaryActions}>
          <AppButton
            title="Schedule"
            variant="secondary"
            size="md"
            fullWidth={false}
            containerStyle={styles.secondaryAction}
            onPress={handleCreateLink}
            leftIcon={
              <CalendarPlus
                color={colors.primaryDeep}
                size={17}
              />
            }
          />

          <AppButton
            title="Create link"
            variant="outline"
            size="md"
            fullWidth={false}
            containerStyle={styles.secondaryAction}
            onPress={handleCreateLink}
            leftIcon={
              <Link2 color={colors.text} size={17} />
            }
          />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  title: {
    marginTop: Spacing.one,
  },
  copy: {
    marginTop: 2,
    maxWidth: 300,
    lineHeight: 19,
  },
  actions: {
    gap: Spacing.two,
  },
  secondaryActions: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing.two,
  },
  secondaryAction: {
    flex: 1,
    minWidth: 0,
  },
});