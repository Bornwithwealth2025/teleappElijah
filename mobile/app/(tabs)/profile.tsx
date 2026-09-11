import React from "react";
import { router, type Href } from "expo-router";
import {
  Bell,
  ChevronRight,
  Contrast,
  CreditCard,
  UserRound,
  Video,
  Volume2,
} from "lucide-react-native";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import { BASE_URL } from "@/api/client";
import { ProfileAvatar } from "@/components/shared/ProfileAvatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
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

  return `${BASE_URL.replace("/api/v2", "")}/${value.replace(/^\/+/, "")}`;
}

type SettingsRow = {
  key: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  rightSlot?: React.ReactNode;
};

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
    getValue(activeProfile.email, authUser?.email) ?? "No email available",
  );

  const handleLogout = async () => {
    clearProfile();
    await logout();
    router.replace("/welcome" as Href);
  };

  const settingsRows: SettingsRow[] = [
    {
      key: "account",
      label: "Account",
      icon: <UserRound color={colors.text} size={20} />,
      onPress: () => router.push("/settings/account" as Href),
    },
    {
      key: "billing",
      label: "Billing",
      icon: <CreditCard color={colors.text} size={20} />,
      onPress: () => router.push("/settings/billing" as Href),
    },
    {
      key: "meetings",
      label: "Meetings",
      icon: <Video color={colors.text} size={20} />,
      onPress: () => router.push("/(tabs)/meetings" as Href),
    },
    {
      key: "audio-video",
      label: "Audio & Video",
      subtitle: "Meeting defaults",
      icon: <Volume2 color={colors.text} size={20} />,
      onPress: () => router.push("/settings/meeting-default" as Href),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <Bell color={colors.text} size={20} />,
      onPress: () => router.push("/settings/notifications" as Href),
    },
    {
      key: "appearance",
      label: "Appearance",
      subtitle:
        preference === "system"
          ? "Use device setting"
          : isDark
            ? "Dark mode"
            : "Light mode",
      icon: <Contrast color={colors.text} size={20} />,
      rightSlot: (
        <Switch
          value={isDark}
          onValueChange={(enabled) =>
            setPreference(enabled ? "dark" : "light")
          }
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Toggle dark mode"
        />
      ),
    },
  ];

  return (
    <AppScreen
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
      <View style={styles.header}>
        <ProfileAvatar
          name={profileName}
          imageUri={imageUrl}
          editable={isAuthenticated}
          uploading={isUploading}
          size={64}
          onImageSelected={uploadProfileImage}
        />

        <View style={styles.headerCopy}>
          <AppText
            numberOfLines={1}
            style={[styles.name, { color: colors.text }]}
          >
            {isLoading && !profile ? "Loading profile…" : profileName}
          </AppText>

          <AppText
            numberOfLines={1}
            style={[styles.email, { color: colors.textMuted }]}
          >
            {email}
          </AppText>

          {isAuthenticated ? (
            <Pressable
              onPress={() =>
                router.push("/settings/account" as Href)
              }
              hitSlop={8}
            >
              <AppText
                style={[styles.editLink, { color: colors.primary }]}
              >
                Edit Profile
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {isAuthenticated ? (
        <View style={styles.menu}>
          {settingsRows.map((row) => {
            const content = (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  {row.icon}

                  <View style={styles.rowCopy}>
                    <AppText
                      style={[styles.rowLabel, { color: colors.text }]}
                    >
                      {row.label}
                    </AppText>

                    {row.subtitle ? (
                      <AppText
                        style={[
                          styles.rowSubtitle,
                          { color: colors.textMuted },
                        ]}
                      >
                        {row.subtitle}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                {row.rightSlot ?? (
                  <ChevronRight color={colors.textSoft} size={19} />
                )}
              </View>
            );

            if (!row.onPress) {
              return (
                <View key={row.key} style={styles.rowWrap}>
                  {content}
                </View>
              );
            }

            return (
              <Pressable
                key={row.key}
                onPress={row.onPress}
                style={({ pressed }) => [
                  styles.rowWrap,
                  pressed && styles.pressed,
                ]}
              >
                {content}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.authActions}>
          <AppButton
            title="Sign in"
            variant="secondary"
            onPress={() => router.push("/auth/login" as Href)}
            containerStyle={styles.authButton}
          />

          <AppButton
            title="Create account"
            onPress={() => router.push("/auth/register" as Href)}
            containerStyle={styles.authButton}
          />
        </View>
      )}

      {isAuthenticated ? (
        <Pressable
          onPress={() => void handleLogout()}
          style={({ pressed }) => [
            styles.logoutWrap,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            style={[styles.logoutText, { color: colors.danger }]}
          >
            Log Out
          </AppText>
        </Pressable>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
  },

  email: {
    fontSize: 12,
  },

  editLink: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  menu: {
    gap: Spacing.one,
  },

  rowWrap: {
    borderRadius: 14,
  },

  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flex: 1,
    minWidth: 0,
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },

  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  rowSubtitle: {
    fontSize: 11,
  },

  authActions: {
    flexDirection: "row",
    gap: Spacing.three,
  },

  authButton: {
    flex: 1,
  },

  logoutWrap: {
    alignItems: "center",
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
  },
});