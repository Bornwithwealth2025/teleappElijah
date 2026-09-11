import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  Film,
  FileVideo,
  Play,
  Share2,
} from "lucide-react-native";
import {
  Alert,
  Animated,
  Image,
  Linking,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from "react-native";

import RecordingService, {
  type Recording,
} from "@/api/recording.service";
import { RecordingStatusBadge } from "@/components/meeting/RecordingStatusBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

function formatDate(value?: string) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return "Not available";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return "Size unavailable";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RecordingDetailScreen() {
  const { colors } = useAppTheme();

  const { recordingId: routeRecordingId } =
    useLocalSearchParams<{ recordingId?: string | string[] }>();

  const recordingId = Array.isArray(routeRecordingId)
    ? routeRecordingId[0]
    : routeRecordingId;

  const [recording, setRecording] =
    React.useState<Recording | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const entrance = React.useRef(new Animated.Value(0)).current;

  const loadRecording = React.useCallback(async () => {
    if (!recordingId) {
      setError("Recording ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await RecordingService.getRecording(recordingId);
      setRecording(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load this recording.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [recordingId]);

  React.useEffect(() => {
    void loadRecording();
  }, [loadRecording]);

  React.useEffect(() => {
    if (isLoading || !recording) {
      return;
    }

    entrance.setValue(0);

    const animation = Animated.spring(entrance, {
      toValue: 1,
      speed: 16,
      bounciness: 5,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [entrance, isLoading, recording]);

  const isReady = recording?.status === "ready";
  const isProcessing =
    recording?.status === "recording" ||
    recording?.status === "processing";

  const title =
    recording?.title ||
    recording?.fileName ||
    "Telefya meeting recording";

  const getPlaybackUrl = () => {
    if (!recording) {
      return null;
    }

    return (
      recording.fileUrl ||
      RecordingService.getPlaybackUrl(recording.recordingId)
    );
  };

  const handlePlay = async () => {
    const url = getPlaybackUrl();

    if (!recording || !isReady || !url) {
      Alert.alert(
        "Recording unavailable",
        "This recording is still being processed.",
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open recording",
        "Please try again in a moment.",
      );
    }
  };

  const handleDownload = async () => {
    if (!recording || !isReady) {
      Alert.alert(
        "Download unavailable",
        "The recording must finish processing before it can be downloaded.",
      );
      return;
    }

    try {
      await Linking.openURL(
        RecordingService.getDownloadUrl(recording.recordingId),
      );
    } catch {
      Alert.alert(
        "Unable to download recording",
        "Please try again in a moment.",
      );
    }
  };

  const handleShare = async () => {
    const url = getPlaybackUrl();

    if (!recording || !url) {
      return;
    }

    try {
      await Share.share({
        title,
        message: `Watch this Telefya recording: ${url}`,
      });
    } catch {
      // The native share sheet can be dismissed without an error message.
    }
  };

  if (isLoading && !recording) {
    return (
      <AppScreen contentStyle={styles.loadingScreen}>
        <View
          style={[
            styles.loadingIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Film color={colors.primary} size={28} />
        </View>

        <AppText variant="subtitle">Loading recording</AppText>

        <AppText variant="caption" tone="muted">
          Getting your meeting details ready.
        </AppText>
      </AppScreen>
    );
  }

  if (error && !recording) {
    return (
      <AppScreen contentStyle={styles.content}>
        <View style={styles.topBar}>
          <IconButton
            icon={<ArrowLeft color={colors.text} size={20} />}
            variant="surface"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
        </View>

        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: colors.card,
              borderColor: `${colors.danger}38`,
            },
          ]}
        >
          <View
            style={[
              styles.errorIcon,
              { backgroundColor: `${colors.danger}18` },
            ]}
          >
            <FileVideo color={colors.danger} size={27} />
          </View>

          <AppText variant="subtitle">Recording unavailable</AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.centerText}
          >
            {error}
          </AppText>

          <AppButton
            title="Try again"
            variant="secondary"
            onPress={() => void loadRecording()}
          />
        </View>
      </AppScreen>
    );
  }

  if (!recording) {
    return null;
  }

  return (
    <AppScreen
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => void loadRecording()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.topBar}>
        <IconButton
          icon={<ArrowLeft color={colors.text} size={20} />}
          variant="surface"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />

        <RecordingStatusBadge status={recording.status} />
      </View>

      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View
            style={[
              styles.preview,
              { backgroundColor: colors.surfaceStrong },
            ]}
          >
            {recording.thumbnailUrl ? (
              <Image
                source={{ uri: recording.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Film color={colors.primary} size={40} />
              </View>
            )}

            <View
              style={[
                styles.previewOverlay,
                { backgroundColor: colors.overlay },
              ]}
            />

            <View
              style={[
                styles.playButtonShell,
                { backgroundColor: colors.primary },
              ]}
            >
              <IconButton
                icon={<Play color="#FFFFFF" size={25} />}
                variant="solid"
                size={58}
                accessibilityLabel="Play recording"
                disabled={!isReady}
                onPress={() => void handlePlay()}
              />
            </View>

            {!isReady ? (
              <View
                style={[
                  styles.processingLabel,
                  { backgroundColor: colors.glassStrong },
                ]}
              >
                <Clock3 color={colors.warning} size={14} />

                <AppText
                  variant="caption"
                  style={{ color: colors.text, fontWeight: "800" }}
                >
                  {isProcessing ? "Processing recording" : "Unavailable"}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.titleBlock}>
          <AppText variant="title" numberOfLines={2}>
            {title}
          </AppText>

          <AppText variant="caption" tone="muted">
            Room {recording.roomId || "Unavailable"}
          </AppText>
        </View>

        {error ? (
          <View
            style={[
              styles.errorNotice,
              {
                backgroundColor: `${colors.danger}12`,
                borderColor: `${colors.danger}38`,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ color: colors.danger }}
            >
              {error}
            </AppText>
          </View>
        ) : null}

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <AppText variant="bodyStrong">Recording details</AppText>

          <View style={styles.detailGrid}>
            <DetailItem
              icon={<CalendarDays color={colors.primary} size={18} />}
              label="Created"
              value={formatDate(
                recording.createdAt || recording.startedAt,
              )}
            />

            <DetailItem
              icon={<Clock3 color={colors.secondary} size={18} />}
              label="Duration"
              value={formatDuration(recording.durationSeconds)}
            />

            <DetailItem
              icon={<FileVideo color={colors.success} size={18} />}
              label="File size"
              value={formatBytes(recording.sizeBytes)}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            title={isReady ? "Play recording" : "Recording processing"}
            leftIcon={<Play color="#FFFFFF" size={18} />}
            disabled={!isReady}
            onPress={() => void handlePlay()}
          />

          <View style={styles.secondaryActions}>
            <AppButton
              title="Download"
              variant="secondary"
              size="md"
              disabled={!isReady}
              leftIcon={
                <Download color={colors.primaryDeep} size={18} />
              }
              onPress={() => void handleDownload()}
              containerStyle={styles.secondaryButton}
            />

            <AppButton
              title="Share"
              variant="outline"
              size="md"
              leftIcon={<Share2 color={colors.text} size={18} />}
              onPress={() => void handleShare()}
              containerStyle={styles.secondaryButton}
            />
          </View>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.detailItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.detailIcon,
          { backgroundColor: colors.card },
        ]}
      >
        {icon}
      </View>

      <View style={styles.detailCopy}>
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>

        <AppText variant="bodyStrong" numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  animatedContent: {
    gap: Spacing.four,
  },

  previewCard: {
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.two,
  },

  preview: {
    minHeight: 230,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  previewIcon: {
    width: 82,
    height: 82,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
  },

  previewOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.52,
  },

  playButtonShell: {
    borderRadius: Radius.pill,
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },

  processingLabel: {
    position: "absolute",
    left: Spacing.three,
    bottom: Spacing.three,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  titleBlock: {
    gap: Spacing.one,
  },

  detailsCard: {
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  detailGrid: {
    gap: Spacing.two,
  },

  detailItem: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  actions: {
    gap: Spacing.two,
  },

  secondaryActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  secondaryButton: {
    flex: 1,
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },

  errorIcon: {
    width: 62,
    height: 62,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  errorNotice: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
  },

  centerText: {
    textAlign: "center",
  },
});