import React from "react";
import { router } from "expo-router";
import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

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
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        eyebrow="SETTINGS"
        title="Security"
        subtitle="Protect your account and meeting access."
      />

      <AppCard
        variant="tinted"
        style={styles.securityHeader}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: colors.primary },
          ]}
        >
          <ShieldCheck color="#FFFFFF" size={22} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyStrong">
            Account protection
          </AppText>

          <AppText variant="caption" tone="muted">
            Your account is protected by authenticated Telefya sessions.
          </AppText>
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <LockKeyhole
              color={colors.primary}
              size={21}
            />
          </View>

          <View style={styles.copy}>
            <AppText variant="bodyStrong">
              Password and sign-in
            </AppText>

            <AppText variant="caption" tone="muted">
              Use Telefya’s secure password reset flow to change your password.
            </AppText>
          </View>
        </View>

        <AppButton
          title="Change password"
          variant="secondary"
          leftIcon={
            <KeyRound
              color={colors.primaryDeep}
              size={18}
            />
          }
          rightIcon={
            <ArrowRight
              color={colors.primaryDeep}
              size={18}
            />
          }
          onPress={() =>
            router.push("/auth/forget-password")
          }
        />
      </AppCard>

      <AppCard
        variant="soft"
        style={styles.card}
      >
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: colors.surfaceStrong },
            ]}
          >
            <ShieldCheck
              color={colors.textMuted}
              size={21}
            />
          </View>

          <View style={styles.copy}>
            <AppText variant="bodyStrong">
              Room approval
            </AppText>

            <AppText variant="caption" tone="muted">
              Room approval controls will become available when workspace
              meeting policies are enabled.
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: colors.surfaceStrong,
              borderColor: colors.border,
            },
          ]}
        >
          <AppText variant="caption" tone="muted">
            Managed by workspace policy
          </AppText>
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  card: {
    gap: Spacing.four,
  },

  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});