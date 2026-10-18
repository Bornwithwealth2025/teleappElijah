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

import { AppText } from "@/components/ui/AppText";
import { Tap } from "@/components/ui/Tap";
import { Radius, Spacing } from "@/constants/theme";

function PanelAction({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Tap label={title} onPress={onPress} style={styles.actionPressable}>
      <View style={styles.actionTile}>
        <View style={styles.actionIcon}>{icon}</View>

        <View style={styles.actionCopy}>
          <AppText
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.actionTitle}
          >
            {title}
          </AppText>

          <AppText
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.actionDescription}
          >
            {description}
          </AppText>
        </View>

        <View style={styles.actionChevron}>
          <ChevronRight color="#FFFFFF" size={15} strokeWidth={2.6} />
        </View>
      </View>
    </Tap>
  );
}

export function MeetingActionPanel() {
  return (
    <LinearGradient
      colors={["#7B1CFF", "#0F6BFF", "#12D8B0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.hero}
    >
      <View style={styles.header}>
        <View style={styles.videoIcon}>
          <Video color="#FFFFFF" size={22} strokeWidth={2.35} />
        </View>

        <View style={styles.readyPill}>
          <View style={styles.readyDot} />
          <AppText style={styles.readyText}>Ready to meet</AppText>
        </View>
      </View>

      <View style={styles.copy}>
        <AppText style={styles.title}>Meet with confidence.</AppText>

        <AppText style={styles.description}>
          Start now, schedule ahead, or share a secure meeting link.
        </AppText>
      </View>

      <Tap
        label="Start instant meeting"
        onPress={() => router.push("/(tabs)/create")}
        style={styles.primaryPressable}
      >
        <View style={styles.primaryButton}>
          <View style={styles.primaryIcon}>
            <Plus color="#FFFFFF" size={22} strokeWidth={2.7} />
          </View>

          <AppText numberOfLines={1} style={styles.primaryText}>
            Start instant meeting
          </AppText>

          <View style={styles.primaryChevron}>
            <ChevronRight color="#0F6BFF" size={21} strokeWidth={2.7} />
          </View>
        </View>
      </Tap>

      <View style={styles.actions}>
        <PanelAction
          icon={
            <CalendarPlus
              color="#FFFFFF"
              size={18}
              strokeWidth={2.3}
            />
          }
          title="Schedule"
          description="Plan ahead"
          onPress={() => router.push("/(tabs)/scheduler")}
        />

        <PanelAction
          icon={<Link2 color="#FFFFFF" size={18} strokeWidth={2.3} />}
          title="Join meeting"
          description="Use a link"
          onPress={() => router.push("/meeting/join")}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: "hidden",
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#061A3A",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
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
    backgroundColor: "rgba(3,13,43,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },

  readyPill: {
    height: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(3,13,43,0.38)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  readyDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: "#12D8B0",
  },

  readyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  copy: {
    gap: 4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  description: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  primaryPressable: {
    width: "100%",
  },

  primaryButton: {
    width: "100%",
    height: 62,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    backgroundColor: "#FFFFFF",
  },

  primaryIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6BFF",
  },

  primaryText: {
    flex: 1,
    minWidth: 0,
    color: "#0B2D75",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  primaryChevron: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,107,255,0.10)",
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.two,
  },

  actionPressable: {
    flex: 1,
    minWidth: 0,
  },

  actionTile: {
    width: "100%",
    height: 72,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: Radius.large,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(3,13,43,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  actionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  actionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },

  actionDescription: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },

  actionChevron: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});