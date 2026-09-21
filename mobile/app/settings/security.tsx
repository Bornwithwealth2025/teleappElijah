import React from "react";
import { router, type Href } from "expo-router";
import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

export default function SecurityScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen tone="aurora" contentStyle={styles.content}>
      <AppHeader
        eyebrow="ACCOUNT PROTECTION"
        title="Security"
        subtitle="Review how your Telefya account and meeting access are protected."
        size="page"
      />

      <AppCard elevated style={styles.securityHero}>
        <View
          style={[
            styles.heroIcon,
            { backgroundColor: colors.primary },
          ]}
        >
          <ShieldCheck color="#FFFFFF" size={24} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyStrong">
            Your account is protected
          </AppText>

          <AppText variant="caption" tone="muted">
            Telefya uses authenticated sessions to protect your account and meeting access.
          </AppText>
        </View>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          SIGN-IN
        </AppText>

        <AppCard style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <LockKeyhole color={colors.primary} size={21} />
            </View>

            <View style={styles.copy}>
              <AppText variant="bodyStrong">
                Password and sign-in
              </AppText>

              <AppText variant="caption" tone="muted">
                Reset your password securely if you need to change it.
              </AppText>
            </View>
          </View>

          <AppButton
            title="Change password"
            variant="secondary"
            leftIcon={
              <KeyRound color={colors.primaryDeep} size={18} />
            }
            rightIcon={
              <ArrowRight color={colors.primaryDeep} size={18} />
            }
            onPress={() =>
              router.push("/auth/forget-password" as Href)
            }
          />
        </AppCard>
      </View>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          MEETING ACCESS
        </AppText>

        <View
          style={[
            styles.policyRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: colors.secondarySoft },
            ]}
          >
            <ShieldCheck color={colors.secondary} size={21} />
          </View>

          <View style={styles.copy}>
            <AppText variant="bodyStrong">
              Waiting room and host controls
            </AppText>

            <AppText variant="caption" tone="muted">
              Hosts can manage waiting-room access from inside live meetings.
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push("/settings/meeting-default" as Href)
          }
          style={({ pressed }) => [
            styles.policyLink,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: colors.primary, fontWeight: "800" }}
          >
            Review meeting preferences
          </AppText>

          <ArrowRight color={colors.primary} size={17} />
        </Pressable>
      </View>

      <View
        style={[
          styles.notice,
          {
            backgroundColor: `${colors.success}12`,
            borderColor: `${colors.success}30`,
          },
        ]}
      >
        <ShieldCheck color={colors.success} size={19} />

        <AppText
          variant="caption"
          style={{ color: colors.textMuted, flex: 1 }}
        >
          For best protection, use a unique password and sign out of shared devices after meetings.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  securityHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: Spacing.two,
  },
  actionCard: {
    gap: Spacing.four,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  policyRow: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  policyLink: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});