import React from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { ProfileAvatar } from "@/components/shared/ProfileAvatar";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { BASE_URL } from "@/api/client";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useAuthStore from "@/store/authStore";
import useUserStore from "@/store/userStore";

function getProfileName(profile: any) {
  const fullName = [
    profile?.first_name,
    profile?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    profile?.name ||
    profile?.email ||
    "Telefya user"
  );
}

function resolveImageUrl(value?: string | null) {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BASE_URL.replace(
    "/api/v2",
    "",
  )}/${value.replace(/^\/+/, "")}`;
}

export default function AccountSettingsScreen() {
  const { colors } = useAppTheme();

  const authUser = useAuthStore(
    (state) => state.user,
  );

  const profile = useUserStore(
    (state) => state.profile,
  );
  const isLoading = useUserStore(
    (state) => state.isLoading,
  );
  const isUploading = useUserStore(
    (state) => state.isUploading,
  );
  const error = useUserStore(
    (state) => state.error,
  );
  const fetchProfile = useUserStore(
    (state) => state.fetchProfile,
  );
  const uploadProfileImage = useUserStore(
    (state) => state.uploadProfileImage,
  );

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const activeProfile = {
    ...(authUser ?? {}),
    ...(profile ?? {}),
  };

  const profileName = getProfileName(activeProfile);

  const email = String(
    activeProfile.email ?? "Not provided",
  );

  const phone = String(
    activeProfile.phone_number ??
      activeProfile.phoneNumber ??
      "Not provided",
  );

  const location = [
    activeProfile.city,
    activeProfile.state,
    activeProfile.country,
  ]
    .filter(Boolean)
    .join(", ");

  const imageUrl = resolveImageUrl(
    activeProfile.profile_image ??
      activeProfile.profileImage ??
      null,
  );

  const isVerified =
    activeProfile.is_verified === true ||
    activeProfile.is_verified === 1;

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
      <AppHeader
        eyebrow="SETTINGS"
        title="Account settings"
        subtitle="Manage your profile details and contact information."
        leftSlot={
          <View style={styles.headerBack}>
            <AppText
              variant="bodyStrong"
              tone="primary"
              onPress={() => router.back()}
            >
              ← Back
            </AppText>
          </View>
        }
      />

      <AppCard
        variant="tinted"
        style={styles.avatarCard}
      >
        <ProfileAvatar
          name={profileName}
          imageUri={imageUrl}
          editable
          uploading={isUploading}
          size={88}
          onImageSelected={uploadProfileImage}
        />

        <View style={styles.avatarCopy}>
          <View style={styles.nameRow}>
            <AppText variant="bodyStrong">
              {profileName}
            </AppText>

            {isVerified ? (
              <ShieldCheck
                color={colors.success}
                size={18}
              />
            ) : null}
          </View>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.avatarHelp}
          >
            Upload a clear photo for your Telefya account.
          </AppText>

          {isUploading ? (
            <AppText variant="caption" tone="primary">
              Uploading profile photo...
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
          <AppText
            variant="caption"
            style={{ color: colors.danger }}
          >
            {error}
          </AppText>
        </AppCard>
      ) : null}

      <AppCard style={styles.detailsCard}>
        <AppText variant="sectionTitle">
          Personal information
        </AppText>

        <View style={styles.fields}>
          <AppTextInput
            label="Full name"
            value={profileName}
            editable={false}
            leftSlot={
              <UserRound
                color={colors.textSoft}
                size={18}
              />
            }
          />

          <AppTextInput
            label="Email address"
            value={email}
            editable={false}
            autoCapitalize="none"
            keyboardType="email-address"
            leftSlot={
              <Mail
                color={colors.textSoft}
                size={18}
              />
            }
          />

          <AppTextInput
            label="Phone number"
            value={phone}
            editable={false}
            keyboardType="phone-pad"
            leftSlot={
              <Phone
                color={colors.textSoft}
                size={18}
              />
            }
          />

          <AppTextInput
            label="Location"
            value={location || "Not provided"}
            editable={false}
            leftSlot={
              <MapPin
                color={colors.textSoft}
                size={18}
              />
            }
          />
        </View>
      </AppCard>

      <AppCard
        compact
        variant="soft"
        style={styles.noticeCard}
      >
        <ShieldCheck
          color={colors.success}
          size={20}
        />

        <AppText
          variant="caption"
          tone="muted"
          style={styles.noticeText}
        >
          Your account information is securely loaded from your Telefya
          workspace.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  headerBack: {
    marginBottom: Spacing.two,
  },

  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },

  avatarCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  avatarHelp: {
    lineHeight: 20,
  },

  errorCard: {
    borderWidth: 1,
  },

  detailsCard: {
    gap: Spacing.four,
  },

  fields: {
    gap: Spacing.three,
  },

  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  noticeText: {
    flex: 1,
    lineHeight: 20,
  },
});