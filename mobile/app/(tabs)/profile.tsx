import React from "react";
import { router, type Href } from "expo-router";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ProfileAvatar } from "@/components/shared/ProfileAvatar";
import { StatCard } from "@/components/shared/StatCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { BASE_URL } from "@/api/client";
import { useAppTheme } from "@/hooks/use-app-themes";
import useSchedulerStore from "@/store/schedulerStore";
import useUserStore from "@/store/userStore";

const menuItems: Array<{ label: string; href: Href }> = [
  {
    label: "Account settings",
    href: "/settings/account",
  },
  {
    label: "Notification preferences",
    href: "/settings/notifications",
  },
  {
    label: "Meeting defaults",
    href: "/settings/meeting-default",
  },
  {
    label: "Security",
    href: "/settings/security",
  },
];

function getProfileName(profile: any) {
  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  return fullName || "User";
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

  const profile = useUserStore((state) => state.profile);
  const isLoading = useUserStore((state) => state.isLoading);
  const isUploading = useUserStore((state) => state.isUploading);
  const error = useUserStore((state) => state.error);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const uploadProfileImage = useUserStore((state) => state.uploadProfileImage);

  const meetings = useSchedulerStore((state) => state.meetings);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    fetchProfile();
    fetchMeetings();
  }, [fetchMeetings, fetchProfile]);

  const profileName = getProfileName(profile);
  const imageUrl = resolveImageUrl(profile?.profile_image);
  const scheduledCount = meetings.length;

  return (
    <AppScreen>
      <AppHeader
        eyebrow="PROFILE"
        title="Your Telifier account"
        subtitle="Manage your identity, preferences, and meeting defaults."
      />

      <AppCard style={styles.profileCard}>
        <ProfileAvatar
          name={profileName}
          imageUri={imageUrl}
          editable
          uploading={isUploading}
          size={68}
          onImageSelected={uploadProfileImage}
        />

        <View style={styles.profileCopy}>
          <View style={styles.nameRow}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {isLoading ? "Loading profile..." : profileName}
            </AppText>

            {profile?.is_verified ? (
              <ShieldCheck color={colors.primary} size={17} />
            ) : null}
          </View>

          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {profile?.email ?? "No email available"}
          </AppText>

          {isUploading ? (
            <AppText variant="caption" tone="primary" style={styles.uploadingText}>
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
              {profile?.phone_number ?? "Not provided"}
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
              {[profile?.city, profile?.state, profile?.country]
                .filter(Boolean)
                .join(", ") || "Not provided"}
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
              {formatBirthDate(profile?.date_of_birth)}
            </AppText>
          </View>
        </View>
      </AppCard>

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

      <View style={styles.statsGrid}>
        <StatCard value={meetings.length} label="Meetings" />
        <StatCard value={scheduledCount} label="Scheduled" />
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable key={item.label} onPress={() => router.push(item.href)}>
            <AppCard elevated style={styles.menuItem}>
              <AppText variant="bodyStrong">{item.label}</AppText>
              <AppText variant="bodyStrong" tone="muted">
                ›
              </AppText>
            </AppCard>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
  authActions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  authButton: {
    flex: 1,
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
  },
});