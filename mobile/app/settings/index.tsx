//app/settings/index.tsx
import { router, type Href } from "expo-router";
import {
  Bell,
  ChevronRight,
  LockKeyhole,
  SlidersHorizontal,
  UserRound,
} from "lucide-react-native";
import {
  StyleSheet,
  View,
} from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
};

function SettingRow({
  icon,
  title,
  description,
  onPress,
}: SettingRowProps) {
  const { colors } = useAppTheme();

  return (
    <AppCard
      compact
      variant="soft"
      onTouchEnd={onPress}
      style={styles.rowCard}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        {icon}
      </View>

      <View style={styles.rowCopy}>
        <AppText variant="bodyStrong">
          {title}
        </AppText>

        <AppText variant="caption" tone="muted">
          {description}
        </AppText>
      </View>

      <ChevronRight
        color={colors.textSoft}
        size={20}
      />
    </AppCard>
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
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        eyebrow="TELEFYA"
        title="Settings"
        subtitle="Manage your account, meeting preferences, and security."
      />

      <AppCard
        variant="tinted"
        style={styles.identityCard}
      >
        <View
          style={[
            styles.identityIcon,
            { backgroundColor: colors.primary },
          ]}
        >
          <UserRound color="#FFFFFF" size={22} />
        </View>

        <View style={styles.identityCopy}>
          <AppText variant="bodyStrong">
            {displayName}
          </AppText>

          <AppText variant="caption" tone="muted">
            Personal Telefya workspace
          </AppText>
        </View>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="label" tone="muted">
          ACCOUNT
        </AppText>

        <SettingRow
          icon={
            <UserRound
              color={colors.primary}
              size={20}
            />
          }
          title="Account settings"
          description="Profile details, contact information, and photo."
          onPress={() =>
            router.push("/settings/account" as Href)
          }
        />
      </View>

      <View style={styles.section}>
        <AppText variant="label" tone="muted">
          MEETINGS
        </AppText>

        <SettingRow
          icon={
            <SlidersHorizontal
              color={colors.primary}
              size={20}
            />
          }
          title="Meeting defaults"
          description="Set your preferred meeting behavior."
          onPress={() =>
            router.push(
              "/settings/meeting-default" as Href,
            )
          }
        />
      </View>

      <View style={styles.section}>
        <AppText variant="label" tone="muted">
          PREFERENCES
        </AppText>

        <SettingRow
          icon={
            <Bell
              color={colors.primary}
              size={20}
            />
          }
          title="Notifications"
          description="Control reminders and meeting alerts."
          onPress={() =>
            router.push(
              "/settings/notifications" as Href,
            )
          }
        />

        <SettingRow
          icon={
            <LockKeyhole
              color={colors.primary}
              size={20}
            />
          }
          title="Security"
          description="Review account security and sign-in settings."
          onPress={() =>
            router.push("/settings/security" as Href)
          }
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  identityIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  identityCopy: {
    flex: 1,
    gap: 2,
  },

  section: {
    gap: Spacing.three,
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});