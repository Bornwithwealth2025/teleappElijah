import React from "react";
import { router, type Href } from "expo-router";
import {
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ProfileAvatar } from "@/components/shared/ProfileAvatar";
import { StatCard } from "@/components/shared/StatCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { BASE_URL } from "@/api/client";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useSchedulerStore from "@/store/schedulerStore";
import useUserStore from "@/store/userStore";

const menuItems: Array<{ label: string; href?: Href }> = [
  { label: "Account settings" },
  { label: "Notification preferences" },
  { label: "Meeting defaults" },
  { label: "Security" },
];

function getValue(...values: Array<any>) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function unwrapProfileData(value: any) {
  return (
    value?.data?.user ??
    value?.data?.profile ??
    value?.data ??
    value?.user ??
    value?.profile ??
    value ??
    {}
  );
}

function getProfileName(profile: any) {
  const fullName = `${profile?.first_name ?? profile?.firstName ?? ""} ${
    profile?.last_name ?? profile?.lastName ?? ""
  }`.trim();

  return fullName || profile?.name || profile?.full_name || "User";
}

function resolveImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  return `${BASE_URL.replace("/api/v2", "")}/${path.replace(/^\/+/, "")}`;
}

function formatBirthDate(value?: string) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfileScreen() {
  const { colors } = useAppTheme();

  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const profile = useUserStore((state) => state.profile);
  const isLoading = useUserStore((state) => state.isLoading);
  const isUploading = useUserStore((state) => state.isUploading);
  const error = useUserStore((state) => state.error);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const uploadProfileImage = useUserStore((state) => state.uploadProfileImage);

  const meetings = useSchedulerStore((state) => state.meetings);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    if (isAuthenticated) {
      void fetchProfile();
      void fetchMeetings();
    }
  }, [fetchMeetings, fetchProfile, isAuthenticated]);

  const backendProfile = unwrapProfileData(profile);

  const activeProfile = {
    ...(authUser ?? {}),
    ...(backendProfile ?? {}),
  };

  const profileName = getProfileName(activeProfile);

  const imageUrl = resolveImageUrl(
    getValue(
      activeProfile?.profile_image,
      activeProfile?.profileImage,
      activeProfile?.avatar,
      authUser?.profile_image,
      authUser?.profileImage,
      authUser?.avatar,
    ),
  );

  const email = getValue(
    activeProfile?.email,
    authUser?.email,
    "No email available",
  );

  const phone = getValue(
    activeProfile?.phone_number,
    activeProfile?.phoneNumber,
    activeProfile?.phone,
    authUser?.phone_number,
    authUser?.phoneNumber,
    authUser?.phone,
  );

  const country = getValue(activeProfile?.country, authUser?.country);
  const state = getValue(activeProfile?.state, authUser?.state);
  const city = getValue(activeProfile?.city, authUser?.city);
  const location = [city, state, country].filter(Boolean).join(", ");

  const dob = getValue(
    activeProfile?.date_of_birth,
    activeProfile?.dateOfBirth,
    authUser?.date_of_birth,
    authUser?.dateOfBirth,
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome" as Href);
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <AppHeader
        eyebrow="PROFILE"
        title="Your Telifier account"
        subtitle="Manage your identity, preferences, and meeting defaults."
      />

      <AppCard style={styles.profileCard}>
        <ProfileAvatar
          name={profileName}
          imageUri={imageUrl}
          editable={isAuthenticated}
          uploading={isUploading}
          size={72}
          onImageSelected={uploadProfileImage}
        />

        <View style={styles.profileCopy}>
          <View style={styles.nameRow}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {isLoading && !authUser && !profile ? "Loading profile..." : profileName}
            </AppText>

            {activeProfile?.is_verified || activeProfile?.isVerified ? (
              <ShieldCheck color={colors.primary} size={17} />
            ) : null}
          </View>

          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {email}
          </AppText>

          {isUploading ? (
            <AppText
              variant="caption"
              tone="primary"
              style={styles.uploadingText}
            >
              Uploading image...
            </AppText>
          ) : null}
        </View>
      </AppCard>

      {error ? (
        <AppText
          variant="caption"
          style={[styles.errorText, { color: colors.danger }]}
        >
          {error}
        </AppText>
      ) : null}

      <AppCard style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Phone color={colors.textSoft} size={18} />
          <View style={styles.detailCopy}>
            <AppText variant="caption" tone="muted">
              Phone
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {phone ?? "Not provided"}
            </AppText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MapPin color={colors.textSoft} size={18} />
          <View style={styles.detailCopy}>
            <AppText variant="caption" tone="muted">
              Location
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {location || "Not provided"}
            </AppText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Mail color={colors.textSoft} size={18} />
          <View style={styles.detailCopy}>
            <AppText variant="caption" tone="muted">
              Date of birth
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {formatBirthDate(dob)}
            </AppText>
          </View>
        </View>
      </AppCard>

      <View style={styles.statsGrid}>
        <StatCard value={meetings.length} label="Meetings" />
        <StatCard value={meetings.length} label="Scheduled" />
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            disabled={!item.href}
            onPress={() => {
              if (item.href) router.push(item.href);
            }}
          >
            <AppCard elevated style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <UserRound color={colors.textSoft} size={18} />
                <AppText variant="bodyStrong">{item.label}</AppText>
              </View>

              <AppText variant="caption" tone="muted">
                Coming soon
              </AppText>
            </AppCard>
          </Pressable>
        ))}
      </View>

      {isAuthenticated ? (
        <AppButton
          title="Sign out"
          variant="danger"
          leftIcon={<LogOut color="#FFFFFF" size={18} />}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      ) : (
        <View style={styles.authActions}>
          <AppButton
            title="Sign in"
            variant="secondary"
            onPress={() => router.push("/auth/login")}
            containerStyle={styles.authButton}
          />
          <AppButton
            title="Create account"
            onPress={() => router.push("/auth/register")}
            containerStyle={styles.authButton}
          />
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  uploadingText: {
    marginTop: Spacing.one,
    fontWeight: "700",
  },
  errorText: {
    textAlign: "center",
    fontWeight: "700",
  },
  detailsCard: {
    gap: Spacing.three,
  },
  detailRow: {
    flexDirection: "row",
    gap: Spacing.three,
    alignItems: "center",
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  menuList: {
    gap: Spacing.three,
  },
  menuItem: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  menuLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  logoutButton: {
    minHeight: 56,
    borderRadius: 999,
  },
  authActions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  authButton: {
    flex: 1,
  },
});