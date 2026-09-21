import type React from "react";
import type { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  SlidersHorizontal,
  UserRound,
} from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TelefyaGradients } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

type SettingsRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  accent: "primary" | "secondary" | "success";
  onPress: () => void;
};

function SettingsRow({
  icon,
  title,
  description,
  accent,
  onPress,
}: SettingsRowProps) {
  const { colors } = useAppTheme();

  const accentColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
  }[accent];

  const accentSoft = {
    primary: colors.primarySoft,
    secondary: colors.secondarySoft,
    success: `${colors.success}18`,
  }[accent];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowPressable,
        {
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.992 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: accentSoft,
              borderColor: `${accentColor}24`,
            },
          ]}
        >
          {icon}
        </View>

        <View style={styles.rowCopy}>
          <AppText variant="bodyStrong">{title}</AppText>

          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {description}
          </AppText>
        </View>

        <ChevronRight color={colors.textSoft} size={20} />
      </View>
    </Pressable>
  );
}

export default function SettingsIndexScreen() {
  const { colors } = useAppTheme();
  const user = useAuthStore((state) => state.user);

  const displayName =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "Your account";

  return (
    <AppScreen tone="aurora" contentStyle={styles.content}>
      <AppHeader
        eyebrow="WORKSPACE SETTINGS"
        title="Manage Telefya"
        subtitle="Control your account, meeting experience, notifications, billing, and security."
        size="page"
      />

      <LinearGradient
        colors={TelefyaGradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.identityHero}
      >
        <View style={styles.identityAvatar}>
          <UserRound color="#FFFFFF" size={24} />
        </View>

        <View style={styles.identityCopy}>
          <AppText
            variant="bodyStrong"
            numberOfLines={1}
            style={styles.identityTitle}
          >
            {displayName}
          </AppText>

          <AppText
            variant="caption"
            numberOfLines={1}
            style={styles.identitySubtitle}
          >
            Personal Telefya workspace
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open account settings"
          onPress={() => router.push("/settings/account" as Href)}
          style={styles.manageButton}
        >
          <AppText variant="caption" style={styles.manageButtonText}>
            Manage
          </AppText>
        </Pressable>
      </LinearGradient>

      <View style={styles.group}>
        <AppText variant="overline" tone="muted">
          ACCOUNT
        </AppText>

        <SettingsRow
          accent="primary"
          icon={<UserRound color={colors.primary} size={20} />}
          title="Account settings"
          description="Profile details, contact information, and profile photo."
          onPress={() => router.push("/settings/account" as Href)}
        />

        <SettingsRow
          accent="secondary"
          icon={<CreditCard color={colors.secondary} size={20} />}
          title="Billing and plan"
          description="Manage your subscription, invoices, and workspace plan."
          onPress={() => router.push("/settings/billing" as Href)}
        />
      </View>

      <View style={styles.group}>
        <AppText variant="overline" tone="muted">
          MEETING EXPERIENCE
        </AppText>

        <SettingsRow
          accent="primary"
          icon={
            <SlidersHorizontal color={colors.primary} size={20} />
          }
          title="Meeting defaults"
          description="Choose your camera, microphone, join, and host preferences."
          onPress={() =>
            router.push("/settings/meeting-default" as Href)
          }
        />

        <SettingsRow
          accent="success"
          icon={<Bell color={colors.success} size={20} />}
          title="Notifications"
          description="Control invitations, reminders, recording, and meeting alerts."
          onPress={() =>
            router.push("/settings/notifications" as Href)
          }
        />
      </View>

      <View style={styles.group}>
        <AppText variant="overline" tone="muted">
          SECURITY
        </AppText>

        <SettingsRow
          accent="secondary"
          icon={<LockKeyhole color={colors.secondary} size={20} />}
          title="Privacy and security"
          description="Review sign-in protection, privacy controls, and account access."
          onPress={() => router.push("/settings/security" as Href)}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  identityHero: {
    minHeight: 96,
    borderRadius: Radius.xLarge,
    padding: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    shadowColor: "#0F6BFF",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  identityAvatar: {
    width: 50,
    height: 50,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  identityTitle: {
    color: "#FFFFFF",
  },
  identitySubtitle: {
    color: "rgba(255,255,255,0.78)",
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  manageButton: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,15,40,0.22)",
  },
  manageButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  group: {
    gap: Spacing.two,
  },
  rowPressable: {
    borderRadius: Radius.large,
  },
  row: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
});