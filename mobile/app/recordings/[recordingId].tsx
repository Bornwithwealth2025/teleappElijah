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
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

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
    if (isLoading || !recording) return;

    Animated.spring(entrance, {
      toValue: 1,
      speed: 16,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }, [entrance, isLoading, recording]);

  const isReady = recording?.status === "ready";
  const isProcessing =
    recording?.status === "recording" ||
    recording?.status === "processing";

  const title =
    recording?.title ||
    recording?.fileName ||
    "Telefya meeting recording";

  const handlePlay = async () => {
    if (!recording || !isReady) {
      Alert.alert(
        "Recording unavailable",
        "This recording is still being processed.",
      );
      return;
    }

    const url =
      recording.fileUrl ||
      RecordingService.getPlaybackUrl(recording.recordingId);

    await Linking.openURL(url);
  };

  const handleDownload = async () => {
    if (!recording || !isReady) {
      Alert.alert(
        "Download unavailable",
        "The recording must finish processing before it can be downloaded.",
      );
      return;
    }

    const url = RecordingService.getDownloadUrl(recording.recordingId);
    await Linking.openURL(url);
  };

  const handleShare = async () => {
    if (!recording) return;

    const url =
      recording.fileUrl ||
      RecordingService.getPlaybackUrl(recording.recordingId);

    await Share.share({
      title,
      message: `Watch this Telefya recording: ${url}`,
    });
  };

  if (isLoading && !recording) {
    return (
      <AppScreen
        contentStyle={styles.loadingScreen}
        refreshControl={
          <RefreshControl
            refreshing
            onRefresh={() => void loadRecording()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View
          style={[
            styles.loadingIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Film color={colors.primary} size={28} />
        </View>

        <AppText variant="subtitle">
          Loading recording
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

        <AppCard style={styles.errorCard}>
          <View
            style={[
              styles.errorIcon,
              { backgroundColor: `${colors.danger}18` },
            ]}
          >
            <FileVideo color={colors.danger} size={26} />
          </View>

          <AppText variant="subtitle">
            Recording unavailable
          </AppText>

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
        </AppCard>
      </AppScreen>
    );
  }

  if (!recording) return null;

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
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <AppCard
          elevated
          variant="soft"
          style={styles.previewCard}
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
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Film color={colors.primary} size={42} />
              </View>
            )}

            <View style={styles.previewOverlay} />

            <IconButton
              icon={<Play color="#FFFFFF" size={24} />}
              variant="solid"
              size={58}
              accessibilityLabel="Play recording"
              disabled={!isReady}
              onPress={() => void handlePlay()}
            />

            {!isReady ? (
              <View style={styles.processingLabel}>
                <AppText
                  variant="caption"
                  style={styles.processingText}
                >
                  {isProcessing
                    ? "Processing"
                    : "Unavailable"}
                </AppText>
              </View>
            ) : null}
          </View>
        </AppCard>

        <View style={styles.titleBlock}>
          <AppText variant="title" numberOfLines={2}>
            {title}
          </AppText>

          <AppText variant="caption" tone="muted">
            Room {recording.roomId || "Unavailable"}
          </AppText>
        </View>

        {error ? (
          <AppCard
            compact
            style={[
              styles.errorNotice,
              {
                backgroundColor: `${colors.danger}12`,
                borderColor: `${colors.danger}40`,
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
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <CalendarDays color={colors.primary} size={18} />
              <View style={styles.detailCopy}>
                <AppText variant="caption" tone="muted">
                  Created
                </AppText>
                <AppText variant="bodyStrong">
                  {formatDate(
                    recording.createdAt || recording.startedAt,
                  )}
                </AppText>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Clock3 color={colors.secondary} size={18} />
              <View style={styles.detailCopy}>
                <AppText variant="caption" tone="muted">
                  Duration
                </AppText>
                <AppText variant="bodyStrong">
                  {formatDuration(recording.durationSeconds)}
                </AppText>
              </View>
            </View>

            <View style={styles.detailItem}>
              <FileVideo color={colors.success} size={18} />
              <View style={styles.detailCopy}>
                <AppText variant="caption" tone="muted">
                  File size
                </AppText>
                <AppText variant="bodyStrong">
                  {formatBytes(recording.sizeBytes)}
                </AppText>
              </View>
            </View>
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title="Play recording"
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
              leftIcon={
                <Share2 color={colors.text} size={18} />
              }
              onPress={() => void handleShare()}
              containerStyle={styles.secondaryButton}
            />
          </View>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
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
    marginBottom: Spacing.two,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  animatedContent: {
    gap: Spacing.five,
  },

  previewCard: {
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
    width: 84,
    height: 84,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
  },

  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 10, 24, 0.3)",
  },

  processingLabel: {
    position: "absolute",
    left: Spacing.three,
    bottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(3, 10, 24, 0.72)",
  },

  processingText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  titleBlock: {
    gap: Spacing.one,
  },

  detailsCard: {
    gap: Spacing.four,
  },

  detailGrid: {
    gap: Spacing.four,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  detailCopy: {
    flex: 1,
    gap: 2,
  },

  actions: {
    gap: Spacing.three,
  },

  secondaryActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  secondaryButton: {
    flex: 1,
  },

  errorCard: {
    alignItems: "center",
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
  },

  centerText: {
    textAlign: "center",
  },
});