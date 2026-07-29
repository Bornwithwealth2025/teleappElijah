import React from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, LoaderCircle } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type ProfileAvatarProps = {
  name?: string;
  imageUri?: string | null;
  editable?: boolean;
  uploading?: boolean;
  size?: number;
  style?: ViewStyle;
  onImageSelected?: (image: {
    uri: string;
    name?: string;
    type?: string;
  }) => Promise<void> | void;
};

function getFileName(uri: string) {
  const fileName = uri.split("/").pop();

  return fileName || `profile-${Date.now()}.jpg`;
}

function getMimeType(uri: string) {
  const extension = uri
    .split("?")[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";

  return "image/jpeg";
}

export function ProfileAvatar({
  name = "User",
  imageUri,
  editable = false,
  uploading = false,
  size = 64,
  style,
  onImageSelected,
}: ProfileAvatarProps) {
  const { colors } = useAppTheme();
  const [previewUri, setPreviewUri] = React.useState<
    string | undefined
  >(imageUri ?? undefined);

  React.useEffect(() => {
    setPreviewUri(imageUri ?? undefined);
  }, [imageUri]);

  const initial =
    name.trim().charAt(0).toUpperCase() || "U";

  async function handlePickImage() {
    if (!editable || uploading) return;

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo access to update your profile image.",
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        allowsMultipleSelection: false,
        aspect: [1, 1],
        quality: 0.85,
      });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const previousUri = previewUri;

    setPreviewUri(asset.uri);

    try {
      await onImageSelected?.({
        uri: asset.uri,
        name: asset.fileName ?? getFileName(asset.uri),
        type: asset.mimeType ?? getMimeType(asset.uri),
      });
    } catch (error) {
      setPreviewUri(previousUri);

      Alert.alert(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to update your profile image.",
      );
    }
  }

  return (
    <Pressable
      onPress={handlePickImage}
      disabled={!editable || uploading}
      accessibilityRole="button"
      accessibilityLabel={
        editable
          ? "Change profile image"
          : "Profile image"
      }
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor: colors.primarySoft,
          borderColor: colors.border,
          opacity: uploading ? 0.72 : 1,
        },
        style,
      ]}
    >
      {previewUri ? (
        <Image
          source={{ uri: previewUri }}
          style={styles.image}
          accessibilityLabel={`${name} profile image`}
        />
      ) : (
        <AppText
          variant="subtitle"
          tone="primary"
          style={styles.initial}
        >
          {initial}
        </AppText>
      )}

      {uploading ? (
        <View
          style={[
            styles.uploadOverlay,
            { backgroundColor: colors.primary },
          ]}
        >
          <LoaderCircle color="#FFFFFF" size={18} />
        </View>
      ) : editable ? (
        <View
          style={[
            styles.cameraBadge,
            {
              backgroundColor: colors.primary,
              borderColor: colors.card,
            },
          ]}
        >
          <Camera color="#FFFFFF" size={13} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.pill,
  },
  initial: {
    fontWeight: "900",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 25,
    height: 25,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});