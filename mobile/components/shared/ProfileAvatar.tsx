import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";

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
  return uri.split("/").pop() || `profile-${Date.now()}.jpg`;
}

function getMimeType(uri: string) {
  const extension = uri.split(".").pop()?.toLowerCase();

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
  const [previewUri, setPreviewUri] = React.useState(imageUri ?? undefined);

  React.useEffect(() => {
    setPreviewUri(imageUri ?? undefined);
  }, [imageUri]);

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  async function handlePickImage() {
    if (!editable || uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    setPreviewUri(asset.uri);

    await onImageSelected?.({
      uri: asset.uri,
      name: asset.fileName ?? getFileName(asset.uri),
      type: asset.mimeType ?? getMimeType(asset.uri),
    });
  }

  return (
    <Pressable
      onPress={handlePickImage}
      disabled={!editable || uploading}
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
        <Image source={{ uri: previewUri }} style={styles.image} />
      ) : (
        <AppText variant="subtitle" tone="primary">
          {initial}
        </AppText>
      )}

      {editable ? (
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
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});