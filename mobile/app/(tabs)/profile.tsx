import React from "react";
import { router, type Href } from "expo-router";
import {
  Film,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react-native";
import { RefreshControl, Pressable, StyleSheet, View } from "react-native";

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

function getValue(...values: Array<unknown>) {
  return values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
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
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  return `${BASE_URL.replace("/api/v2", "")}/${value.replace(/^\/+/, "")}`;
}

function formatBirthDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

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
  const clearProfile = useUserStore((state) => state.clearProfile);

  const meetings = useSchedulerStore((state) => state.meetings);
  const meetingsLoading = useSchedulerStore((state) => state.isLoading);
  const fetchMeetings = useSchedulerStore((state) => state.fetchMeetings);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    void Promise.allSettled([fetchProfile(), fetchMeetings()]);
  }, [fetchMeetings, fetchProfile, isAuthenticated]);

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

  const phone = getValue(
    activeProfile.phone_number,
    activeProfile.phoneNumber,
    activeProfile.phone,
  );

  const location = [
    activeProfile.city,
    activeProfile.state,
    activeProfile.country,
  ]
    .filter(Boolean)
    .join(", ");

  const dateOfBirth = getValue(
    activeProfile.date_of_birth,
    activeProfile.dateOfBirth,
  );

  const isVerified =
    activeProfile.is_verified === 1 ||
    activeProfile.is_verified === true ||
    activeProfile.isVerified === true;

  const handleLogout = async () => {
    clearProfile();
    await logout();
    router.replace("/welcome" as Href);
  };

  const refresh = async () => {
    if (!isAuthenticated) return;

    await Promise.allSettled([fetchProfile(), fetchMeetings()]);
  };

  return (
    <AppScreen
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || meetingsLoading}
          onRefresh={() => void refresh()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader title="Profile" />

      <AppCard variant="tinted" style={styles.profileCard}>
        <ProfileAvatar
          name={profileName}
          imageUri={imageUrl}
          editable={isAuthenticated}
          uploading={isUploading}
          size={78}
          onImageSelected={uploadProfileImage}
        />

        <View style={styles.profileCopy}>
          <View style={styles.nameRow}>
            <AppText variant="subtitle" numberOfLines={1}>
              {isLoading && !profile ? "Loading profile..." : profileName}
            </AppText>

            {isVerified ? (
              <ShieldCheck color={colors.success} size={18} strokeWidth={2.4} />
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
              Uploading...
            </AppText>
          ) : null}
        </View>
      </AppCard>

      {error ? (
        <AppCard
          compact
          style={[
            styles.errorCard,
            {
              backgroundColor: colors.danger + "12",
              borderColor: colors.danger + "45",
            },
          ]}
        >
          <AppText variant="caption" style={{ color: colors.danger }}>
            {error}
          </AppText>
        </AppCard>
      ) : null}

      <AppCard style={styles.detailsCard}>
        <AppText variant="sectionTitle">Personal details</AppText>

        <View style={styles.detailRow}>
          <View
            style={[styles.detailIcon, { backgroundColor: colors.primarySoft }]}
          >
            <Phone color={colors.primary} size={17} />
          </View>

          <View style={styles.detailCopy}>
            <AppText variant="caption" tone="muted">
              Phone
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {String(phone ?? "Not provided")}
            </AppText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: colors.secondarySoft },
            ]}
          >
            <MapPin color={colors.secondary} size={17} />
          </View>

          <View style={styles.detailCopy}>
            <AppText variant="caption" tone="muted">
              Location
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {location || "Not provided"}
            </AppText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: colors.surfaceStrong },
            ]}
          >
            <Mail color={colors.textMuted} size={17} />
          </View>

          <View style={styles.detailCopy}>
            <AppText variant="caption" tone="muted">
              Date of birth
            </AppText>
            <AppText variant="bodyStrong">
              {formatBirthDate(String(dateOfBirth ?? ""))}
            </AppText>
          </View>
        </View>
      </AppCard>

      <View style={styles.statsGrid}>
        <StatCard value={meetings.length} label="Scheduled meetings" />

        <StatCard
          value={isVerified ? "Verified" : "Pending"}
          label="Account status"
        />
      </View>

      <Pressable
        onPress={() => router.push("/recordings" as Href)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <AppCard
          variant="soft"
          style={styles.recordingsCard}
        >
          <View
            style={[
              styles.recordingsIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Film color={colors.primary} size={21} />
          </View>

          <View style={styles.recordingsCopy}>
            <AppText variant="bodyStrong">
              Recordings
            </AppText>

            <AppText variant="caption" tone="muted">
              View and play saved meeting recordings.
            </AppText>
          </View>
        </AppCard>
      </Pressable>

      {isAuthenticated ? (
        <AppButton
          title="Sign out"
          variant="danger"
          leftIcon={<LogOut color="#FFFFFF" size={18} />}
          onPress={handleLogout}
          containerStyle={styles.logoutButton}
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
    gap: Spacing.three,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  uploadingText: {
    fontWeight: "700",
  },
  errorCard: {
    borderWidth: 1,
  },
  detailsCard: {
    gap: Spacing.four,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  recordingsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  recordingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingsCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  logoutButton: {
    marginTop: Spacing.two,
  },
  authActions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  authButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
});