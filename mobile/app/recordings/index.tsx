import React, { useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Film,
  Play,
} from "lucide-react-native";
import {
  Animated,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import RecordingService, {
  type Recording,
} from "@/api/recording.service";
import { RecordingStatusBadge } from "@/components/meeting/RecordingStatusBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return "Duration unavailable";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function RecordingsScreen() {
  const { colors } = useAppTheme();

  const [recordings, setRecordings] = React.useState<Recording[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const entrance = useRef(new Animated.Value(0)).current;

  const loadRecordings = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await RecordingService.listRecordings();

      setRecordings(Array.isArray(items) ? items : []);

      entrance.setValue(0);

      Animated.spring(entrance, {
        toValue: 1,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }).start();
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load recordings.",
      );
      entrance.setValue(1);
    } finally {
      setIsLoading(false);
    }
  }, [entrance]);

  useEffect(() => {
    void loadRecordings();
  }, [loadRecordings]);

  return (
    <AppScreen
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => void loadRecordings()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader title="Recordings" />

      <View style={styles.hero}>
        <View
          style={[
            styles.heroIcon,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}28`,
            },
          ]}
        >
          <Film color={colors.primary} size={22} />
        </View>

        <View style={styles.heroCopy}>
          <AppText variant="bodyStrong">
            Your meeting library
          </AppText>

          <AppText variant="caption" tone="muted">
            Replay, download, and share recordings from your meetings.
          </AppText>
        </View>
      </View>

      {error ? (
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: `${colors.danger}10`,
              borderColor: `${colors.danger}35`,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={[styles.errorText, { color: colors.danger }]}
          >
            {error}
          </AppText>

          <AppButton
            title="Try again"
            variant="secondary"
            size="md"
            onPress={() => void loadRecordings()}
          />
        </View>
      ) : null}

      {isLoading && recordings.length === 0 ? (
        <View
          style={[
            styles.loadingCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View
            style={[
              styles.loadingIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Film color={colors.primary} size={25} />
          </View>

          <AppText variant="bodyStrong">Loading recordings</AppText>

          <AppText variant="caption" tone="muted">
            Fetching your saved meetings.
          </AppText>
        </View>
      ) : null}

      {!isLoading && !error && recordings.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Film color={colors.primary} size={28} />
          </View>

          <AppText variant="subtitle">No recordings yet</AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.emptyDescription}
          >
            Record a meeting as host and it will appear here when processing
            finishes.
          </AppText>
        </View>
      ) : null}

      {recordings.length > 0 ? (
        <Animated.View
          style={[
            styles.list,
            {
              opacity: entrance,
              transform: [
                {
                  translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.listHeader}>
            <AppText variant="sectionTitle">
              All recordings
            </AppText>

            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: colors.secondarySoft,
                  borderColor: `${colors.secondary}26`,
                },
              ]}
            >
              <AppText
                variant="label"
                style={{ color: colors.secondary }}
              >
                {recordings.length}
              </AppText>
            </View>
          </View>

          {recordings.map((recording) => {
            const title =
              recording.title ||
              recording.fileName ||
              "Telefya meeting recording";

            const isReady = recording.status === "ready";

            return (
              <Pressable
                key={recording.recordingId}
                onPress={() =>
                  router.push(
                    `/recordings/${recording.recordingId}` as any,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Open ${title}`}
                style={({ pressed }) => [
                  styles.pressable,
                  { opacity: pressed ? 0.78 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.recordingCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.glassBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.thumbnail,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <Film color={colors.primary} size={25} />

                    {isReady ? (
                      <View
                        style={[
                          styles.playBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Play color="#FFFFFF" size={11} fill="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.copy}>
                    <View style={styles.titleRow}>
                      <AppText
                        variant="bodyStrong"
                        numberOfLines={1}
                        style={styles.title}
                      >
                        {title}
                      </AppText>

                      <RecordingStatusBadge status={recording.status} />
                    </View>

                    <View style={styles.meta}>
                      <CalendarDays color={colors.textSoft} size={14} />

                      <AppText
                        variant="caption"
                        tone="muted"
                        numberOfLines={1}
                      >
                        {formatDate(
                          recording.createdAt || recording.startedAt,
                        )}
                      </AppText>
                    </View>

                    <View style={styles.meta}>
                      <Clock3 color={colors.textSoft} size={14} />

                      <AppText variant="caption" tone="muted">
                        {formatDuration(recording.durationSeconds)}
                      </AppText>
                    </View>
                  </View>

                  <ChevronRight color={colors.textSoft} size={20} />
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  list: {
    gap: Spacing.three,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  countBadge: {
    minWidth: 32,
    height: 30,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },

  pressable: {
    borderRadius: Radius.xLarge,
  },

  recordingCard: {
    minHeight: 102,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  thumbnail: {
    width: 62,
    height: 62,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  playBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 23,
    height: 23,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  title: {
    flex: 1,
    minWidth: 0,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  loadingCard: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    minHeight: 240,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  emptyDescription: {
    textAlign: "center",
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },

  errorText: {
    textAlign: "center",
    fontWeight: "700",
  },
});