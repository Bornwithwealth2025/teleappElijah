import React from "react";
import {
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { BASE_URL } from "@/api/client";
import {
  AppButton,
  BRAND_GRADIENT,
} from "@/components/ui/AppButton";
import { ProfileAvatar } from "@/components/shared/ProfileAvatar";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
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

function resolveImageUrl(value?: string | null) {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BASE_URL.replace("/api/v2", "")}/${value.replace(
    /^\/+/,
    "",
  )}`;
}

function splitPhone(value?: string | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      countryCode: "+234",
      phoneNumber: "",
    };
  }

  const match = raw.match(/^(\+\d{1,4})(\d+)$/);

  if (!match) {
    return {
      countryCode: "+234",
      phoneNumber: raw.replace(/[^\d]/g, ""),
    };
  }

  return {
    countryCode: match[1],
    phoneNumber: match[2],
  };
}

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad";
  autoCapitalize?: "none" | "words";
  editable?: boolean;
  helper?: string;
};

function FormField({
  label,
  value,
  placeholder,
  icon,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "words",
  editable = true,
  helper,
}: FormFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.fieldGroup}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>

      <View
        style={[
          styles.field,
          {
            backgroundColor: editable ? colors.card : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.fieldIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          {icon}
        </View>

        <TextInput
          value={value}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.textSoft}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onChangeText={onChangeText}
          style={[
            styles.input,
            {
              color: editable ? colors.text : colors.textMuted,
            },
          ]}
        />
      </View>

      {helper ? (
        <AppText variant="caption" tone="muted" style={styles.helper}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

export default function AccountSettingsScreen() {
  const { colors } = useAppTheme();

  const authUser = useAuthStore((state) => state.user);

  const profile = useUserStore((state) => state.profile);
  const isLoading = useUserStore((state) => state.isLoading);
  const isUploading = useUserStore((state) => state.isUploading);
  const isUpdating = useUserStore((state) => state.isUpdating);
  const error = useUserStore((state) => state.error);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const uploadProfileImage = useUserStore(
    (state) => state.uploadProfileImage,
  );

  const activeProfile = {
    ...(authUser ?? {}),
    ...(profile ?? {}),
  };

  const email = String(
    getValue(activeProfile.email, authUser?.email) ?? "Not provided",
  );

  const imageUrl = resolveImageUrl(
    String(
      getValue(
        activeProfile.profile_image,
        activeProfile.profileImage,
        activeProfile.avatar,
      ) ?? "",
    ),
  );

  const isVerified =
    activeProfile.is_verified === true ||
    activeProfile.is_verified === 1;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+234");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [state, setState] = React.useState("");
  const [city, setCity] = React.useState("");
  const [success, setSuccess] = React.useState("");

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  React.useEffect(() => {
    const phone = splitPhone(
      getValue(
        activeProfile.phone_number,
        activeProfile.phoneNumber,
        activeProfile.phone,
      ) as string | null,
    );

    setFirstName(String(activeProfile.first_name ?? ""));
    setLastName(String(activeProfile.last_name ?? ""));
    setCountryCode(phone.countryCode);
    setPhoneNumber(phone.phoneNumber);
    setCountry(String(activeProfile.country ?? ""));
    setState(String(activeProfile.state ?? ""));
    setCity(String(activeProfile.city ?? ""));
  }, [
    activeProfile.city,
    activeProfile.country,
    activeProfile.first_name,
    activeProfile.last_name,
    activeProfile.phone,
    activeProfile.phoneNumber,
    activeProfile.phone_number,
    activeProfile.state,
  ]);

  const profileName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    email ||
    "Telefya user";

  const canSave =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    !isUpdating;

  async function handleSave() {
    if (!canSave) return;

    setSuccess("");

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        country_code: countryCode.trim(),
        phone_number: phoneNumber.trim(),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
      });

      setSuccess("Profile changes saved.");
    } catch {
      // The store displays the API error in the screen-level error card.
    }
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
      <AppHeader
        eyebrow="ACCOUNT"
        title="Your profile"
        subtitle="Manage the information connected to your Telefya workspace."
        size="page"
        leftSlot={
          <IconButton
            icon={<ArrowLeft color={colors.text} size={20} />}
            variant="soft"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
        }
      />

      <AppCard elevated style={styles.identityCard}>
        <ProfileAvatar
          name={profileName}
          imageUri={imageUrl}
          editable
          uploading={isUploading}
          size={78}
          onImageSelected={uploadProfileImage}
        />

        <View style={styles.identityCopy}>
          <View style={styles.nameRow}>
            <AppText variant="sectionTitle" numberOfLines={1}>
              {isLoading && !profile ? "Loading profile…" : profileName}
            </AppText>

            {isVerified ? (
              <BadgeCheck color={colors.success} size={19} />
            ) : null}
          </View>

          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {email}
          </AppText>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isUploading
                  ? colors.primarySoft
                  : `${colors.success}12`,
                borderColor: isUploading
                  ? `${colors.primary}28`
                  : `${colors.success}30`,
              },
            ]}
          >
            <ShieldCheck
              color={isUploading ? colors.primary : colors.success}
              size={14}
            />

            <AppText
              variant="caption"
              style={{
                color: isUploading ? colors.primary : colors.success,
                fontWeight: "800",
              }}
            >
              {isUploading ? "Uploading photo…" : "Workspace verified"}
            </AppText>
          </View>
        </View>
      </AppCard>

      {error ? (
        <View
          style={[
            styles.feedback,
            {
              backgroundColor: `${colors.danger}10`,
              borderColor: `${colors.danger}35`,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: colors.danger, fontWeight: "700" }}
          >
            {error}
          </AppText>
        </View>
      ) : null}

      {success ? (
        <View
          style={[
            styles.feedback,
            {
              backgroundColor: `${colors.success}12`,
              borderColor: `${colors.success}35`,
            },
          ]}
        >
          <CheckCircle2 color={colors.success} size={18} />

          <AppText
            variant="caption"
            style={{ color: colors.success, fontWeight: "800" }}
          >
            {success}
          </AppText>
        </View>
      ) : null}

      <AppCard style={styles.formCard}>
        <View style={styles.formHeader}>
          <View
            style={[
              styles.formHeaderIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <UserRound color={colors.primary} size={20} />
          </View>

          <View style={styles.formHeaderCopy}>
            <AppText variant="bodyStrong">
              Personal information
            </AppText>

            <AppText variant="caption" tone="muted">
              Keep your meeting profile current for invitations and workspace access.
            </AppText>
          </View>
        </View>

        <FormField
          label="First name"
          value={firstName}
          placeholder="Your first name"
          icon={<UserRound color={colors.primary} size={18} />}
          onChangeText={(value) => {
            setSuccess("");
            setFirstName(value);
          }}
        />

        <FormField
          label="Last name"
          value={lastName}
          placeholder="Your last name"
          icon={<UserRound color={colors.primary} size={18} />}
          onChangeText={(value) => {
            setSuccess("");
            setLastName(value);
          }}
        />

        <FormField
          label="Email address"
          value={email}
          placeholder=""
          editable={false}
          autoCapitalize="none"
          icon={<Mail color={colors.textMuted} size={18} />}
          onChangeText={() => undefined}
          helper="Email changes require verification through account support."
        />

        <View style={styles.phoneRow}>
          <View style={styles.countryCodeField}>
            <FormField
              label="Code"
              value={countryCode}
              placeholder="+234"
              keyboardType="phone-pad"
              autoCapitalize="none"
              icon={<Globe2 color={colors.primary} size={18} />}
              onChangeText={(value) => {
                setSuccess("");
                setCountryCode(value);
              }}
            />
          </View>

          <View style={styles.phoneField}>
            <FormField
              label="Phone number"
              value={phoneNumber}
              placeholder="801 234 5678"
              keyboardType="phone-pad"
              autoCapitalize="none"
              icon={<Phone color={colors.success} size={18} />}
              onChangeText={(value) => {
                setSuccess("");
                setPhoneNumber(value);
              }}
            />
          </View>
        </View>

        <FormField
          label="Country"
          value={country}
          placeholder="Nigeria"
          icon={<Globe2 color={colors.primary} size={18} />}
          onChangeText={(value) => {
            setSuccess("");
            setCountry(value);
          }}
        />

        <FormField
          label="State"
          value={state}
          placeholder="Lagos"
          icon={<MapPin color={colors.secondary} size={18} />}
          onChangeText={(value) => {
            setSuccess("");
            setState(value);
          }}
        />

        <FormField
          label="City"
          value={city}
          placeholder="Lagos"
          icon={<MapPin color={colors.secondary} size={18} />}
          onChangeText={(value) => {
            setSuccess("");
            setCity(value);
          }}
        />

        <AppButton
          title={isUpdating ? "Saving changes..." : "Save profile changes"}
          variant="gradient"
          gradientColors={BRAND_GRADIENT}
          loading={isUpdating}
          disabled={!canSave}
          leftIcon={<Save color="#FFFFFF" size={18} />}
          rightIcon={<CheckCircle2 color="#FFFFFF" size={18} />}
          contentAlign="spaceBetween"
          onPress={() => void handleSave()}
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },

  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  statusPill: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: Spacing.one,
  },

  feedback: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  formCard: {
    gap: Spacing.four,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  formHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  formHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  fieldGroup: {
    gap: Spacing.one,
  },

  field: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },

  helper: {
    lineHeight: 18,
  },

  phoneRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  countryCodeField: {
    width: 112,
  },

  phoneField: {
    flex: 1,
    minWidth: 0,
  },
});