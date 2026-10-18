import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import {
  Alert,
  RefreshControl,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import {
  Bell,
  ChevronRight,
  Contrast,
  CreditCard,
  LogOut,
  Settings2,
  ShieldCheck,
  UserRound,
  Video,
} from "lucide-react-native";

import { BASE_URL } from "@/api/client";
import { ProfileAvatar } from "@/components/shared/ProfileAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Tap } from "@/components/ui/Tap";
import { TelefyaGradients } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useUserStore from "@/store/userStore";

function getValue(...values: Array<unknown>) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== "",
  );
}

function getProfileName(profile: any) {
  const fullName = [
    profile?.first_name ?? profile?.firstName,
    profile?.last_name ?? profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || profile?.name || profile?.full_name || "Telefya user";
}

function resolveImageUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BASE_URL.replace("/api/v2", "")}/${value.replace(
    /^\/+/,
    "",
  )}`;
}

type MenuRowProps = {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightSlot?: React.ReactNode;
};

function MenuRow({
  icon,
  label,
  subtitle,
  onPress,
  rightSlot,
}: MenuRowProps) {
  const { colors, isDark } = useAppTheme();

  const content = (
    <View
      style={[
        styles.menuRow,
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
      <View style={[styles.menuIcon, { backgroundColor: colors.primary }]}>
        {icon}
      </View>

      <View style={styles.menuCopy}>
        <AppText
          numberOfLines={1}
          style={[styles.menuLabel, { color: colors.text }]}
        >
          {label}
        </AppText>

        {subtitle ? (
          <AppText
            numberOfLines={1}
            style={[styles.menuSubtitle, { color: colors.textMuted }]}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {rightSlot ?? (
        <View style={styles.menuArrow}>
          <ChevronRight color={colors.textMuted} size={22} />
        </View>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Tap label={`Open ${label}`} onPress={onPress} style={styles.fullWidth}>
      {content}
    </Tap>
  );
}

export default function ProfileScreen() {
  const {
    colors,
    isDark,
    preference,
    setPreference,
  } = useAppTheme();

  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const profile = useUserStore((state) => state.profile);
  const isLoading = useUserStore((state) => state.isLoading);
  const isUploading = useUserStore((state) => state.isUploading);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const uploadProfileImage = useUserStore(
    (state) => state.uploadProfileImage,
  );
  const clearProfile = useUserStore((state) => state.clearProfile);

  React.useEffect(() => {
    if (isAuthenticated) {
      void fetchProfile();
    }
  }, [fetchProfile, isAuthenticated]);

  const activeProfile = {
    ...(authUser ?? {}),
    ...(profile ?? {}),
  };

  const profileName = getProfileName(activeProfile);

  const imageUrl = resolveImageUrl(
    String(
      getValue(
        activeProfile.profile_image,
        activeProfile.profileImage,
        activeProfile.avatar,
      ) ?? "",
    ),
  );

  const email = String(
    getValue(activeProfile.email, authUser?.email) ??
      "No email available",
  );

  async function handleLogout() {
    clearProfile();
    await logout();
    router.replace("/welcome" as Href);
  }

  function confirmLogout() {
    Alert.alert(
      "Log out of Telefya?",
      "You will need to sign in again to access your meetings and workspace.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => void handleLogout(),
        },
      ],
    );
  }

  if (!isAuthenticated) {
    return (
      <AppScreen tone="aurora" contentStyle={styles.guestContent}>
        <View
          style={[
            styles.guestIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <UserRound color={colors.primary} size={30} />
        </View>

        <AppText variant="title" style={styles.guestTitle}>
          Your Telefya workspace
        </AppText>

        <AppText
          variant="body"
          tone="muted"
          style={styles.guestDescription}
        >
          Sign in to manage your profile, meeting preferences, recordings, and security settings.
        </AppText>

        <View style={styles.guestActions}>
          <AppButton
            title="Sign in"
            onPress={() => router.push("/auth/login" as Href)}
          />

          <AppButton
            title="Create account"
            variant="outline"
            onPress={() => router.push("/auth/register" as Href)}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      tone="aurora"
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => void fetchProfile()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppText variant="overline" tone="primary">
        PERSONAL WORKSPACE
      </AppText>

      <LinearGradient
        colors={TelefyaGradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHero}
      >
        <View style={styles.profileTop}>
          <ProfileAvatar
            name={profileName}
            imageUri={imageUrl}
            editable
            uploading={isUploading}
            size={72}
            onImageSelected={uploadProfileImage}
          />

          <View style={styles.profileCopy}>
            <AppText
              variant="sectionTitle"
              numberOfLines={1}
              style={styles.profileHeroTitle}
            >
              {isLoading && !profile ? "Loading profile…" : profileName}
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={1}
              style={styles.profileHeroEmail}
            >
              {email}
            </AppText>

            <Tap
              label="Edit profile"
              onPress={() => router.push("/settings/account" as Href)}
              style={styles.editProfilePressable}
            >
              <View style={styles.editProfile}>
                <AppText style={styles.profileHeroAction}>
                  Edit profile
                </AppText>
                <ChevronRight color="#FFFFFF" size={15} strokeWidth={2.6} />
              </View>
            </Tap>
          </View>
        </View>

        <View style={styles.workspaceStatus}>
          <View style={styles.statusDot} />

          <AppText variant="caption" style={styles.workspaceStatusText}>
            Your Telefya workspace is active
          </AppText>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          WORKSPACE
        </AppText>

        <MenuRow
          icon={<Settings2 color="#FFFFFF" size={21} />}
          label="Settings"
          subtitle="Account, preferences, billing, and privacy"
          onPress={() => router.push("/settings" as Href)}
        />

        <MenuRow
          icon={<Video color="#FFFFFF" size={21} />}
          label="Meeting defaults"
          subtitle="Camera, microphone, and joining preferences"
          onPress={() =>
            router.push("/settings/meeting-default" as Href)
          }
        />

        <MenuRow
          icon={<CreditCard color="#FFFFFF" size={21} />}
          label="Billing and plan"
          subtitle="Subscription, invoices, and plan details"
          onPress={() => router.push("/settings/billing" as Href)}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="overline" tone="muted">
          PREFERENCES
        </AppText>

        <MenuRow
          icon={<Bell color="#FFFFFF" size={21} />}
          label="Notifications"
          subtitle="Meeting invitations, reminders, and recordings"
          onPress={() =>
            router.push("/settings/notifications" as Href)
          }
        />

        <MenuRow
          icon={<ShieldCheck color="#FFFFFF" size={21} />}
          label="Privacy and security"
          subtitle="Sign-in security and account protection"
          onPress={() => router.push("/settings/security" as Href)}
        />

        <MenuRow
          icon={<Contrast color="#FFFFFF" size={21} />}
          label="Appearance"
          subtitle={
            preference === "system"
              ? "Using device setting"
              : isDark
                ? "Dark mode"
                : "Light mode"
          }
          rightSlot={
            <Switch
              value={isDark}
              onValueChange={(enabled) =>
                setPreference(enabled ? "dark" : "light")
              }
              trackColor={{
                false: colors.borderStrong,
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle dark mode"
            />
          }
        />
      </View>

      <Tap label="Log out" onPress={confirmLogout} style={styles.fullWidth}>
        <View
          style={[
            styles.logout,
            {
              backgroundColor: `${colors.danger}0D`,
              borderColor: `${colors.danger}30`,
            },
          ]}
        >
          <LogOut color={colors.danger} size={19} />

          <AppText
            variant="bodyStrong"
            style={{ color: colors.danger }}
          >
            Log out
          </AppText>
        </View>
      </Tap>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  fullWidth: {
    width: "100%",
  },
  profileHero: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.xLarge,
    shadowColor: "#0F6BFF",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  profileHeroTitle: {
    color: "#FFFFFF",
  },
  profileHeroEmail: {
    color: "rgba(255, 255, 255, 0.78)",
  },
  profileHeroAction: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  editProfilePressable: {
    alignSelf: "flex-start",
    marginTop: Spacing.one,
  },
  editProfile: {
    height: 32,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(3, 15, 40, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  workspaceStatus: {
    minHeight: 40,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    backgroundColor: "rgba(3, 15, 40, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  workspaceStatusText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: "#42E5A0",
  },
  section: {
    width: "100%",
    gap: Spacing.three,
  },
  menuRow: {
    width: "100%",
    height: 84,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 4,
  },
  menuLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  menuSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  menuArrow: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  logout: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.two,
  },
  guestContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  guestIcon: {
    width: 76,
    height: 76,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
  },
  guestTitle: {
    textAlign: "center",
    marginTop: Spacing.one,
  },
  guestDescription: {
    maxWidth: 320,
    textAlign: "center",
    lineHeight: 22,
  },
  guestActions: {
    width: "100%",
    maxWidth: 360,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});