import React, { useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  Film,
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
  const [isLoading, setIsLoading] =
    React.useState(true);
  const [error, setError] = React.useState<string | null>(
    null,
  );

  const entrance = useRef(new Animated.Value(0)).current;

  const loadRecordings = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items =
        await RecordingService.listRecordings();

      setRecordings(Array.isArray(items) ? items : []);

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
        <AppHeader title="Recordings" />

        {error ? (
          <AppCard
            style={[
              styles.errorCard,
              {
                backgroundColor:
                  colors.danger + "10",
                borderColor:
                  colors.danger + "35",
              },
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.errorText,
                { color: colors.danger },
              ]}
            >
              {error}
            </AppText>

            <AppButton
              title="Try again"
              variant="secondary"
              size="md"
              onPress={() => void loadRecordings()}
            />
          </AppCard>
        ) : null}

        {isLoading && recordings.length === 0 ? (
          <AppCard style={styles.loadingCard}>
            <View
              style={[
                styles.loadingIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Film color={colors.primary} size={24} />
            </View>

            <AppText variant="bodyStrong">
              Loading recordings
            </AppText>
          </AppCard>
        ) : null}

        {!isLoading &&
        !error &&
        recordings.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.primarySoft,
                },
              ]}
            >
              <Film color={colors.primary} size={26} />
            </View>

            <AppText variant="subtitle">
              No recordings yet
            </AppText>
          </AppCard>
        ) : null}

        <View style={styles.list}>
          {recordings.map((recording) => (
            <Pressable
              key={recording.recordingId}
              onPress={() =>
                router.push(
                  `/recordings/${recording.recordingId}` as any,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${
                recording.title ||
                recording.fileName ||
                "meeting recording"
              }`}
              style={({ pressed }) =>
                pressed ? styles.pressed : undefined
              }
            >
              <AppCard
                elevated
                variant="soft"
                style={styles.recordingCard}
              >
                <View
                  style={[
                    styles.thumbnail,
                    {
                      backgroundColor:
                        colors.primarySoft,
                    },
                  ]}
                >
                  <Film
                    color={colors.primary}
                    size={26}
                  />
                </View>

                <View style={styles.copy}>
                  <AppText
                    variant="bodyStrong"
                    numberOfLines={1}
                  >
                    {recording.title ||
                      recording.fileName ||
                      "Telefya meeting recording"}
                  </AppText>

                  <View style={styles.meta}>
                    <CalendarDays
                      color={colors.textSoft}
                      size={14}
                    />

                    <AppText
                      variant="caption"
                      tone="muted"
                      numberOfLines={1}
                    >
                      {formatDate(
                        recording.createdAt ||
                          recording.startedAt,
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="muted"
                    >
                      •
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="muted"
                      numberOfLines={1}
                    >
                      {formatDuration(
                        recording.durationSeconds,
                      )}
                    </AppText>
                  </View>

                  <RecordingStatusBadge
                    status={recording.status}
                  />
                </View>

                <ChevronRight
                  color={colors.textSoft}
                  size={20}
                />
              </AppCard>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
  },

  animatedContent: {
    width: "100%",
    gap: Spacing.five,
  },

  list: {
    gap: Spacing.three,
  },

  recordingCard: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },

  loadingCard: {
    minHeight: 150,
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
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  errorCard: {
    gap: Spacing.three,
    borderWidth: 1,
  },

  errorText: {
    textAlign: "center",
    fontWeight: "700",
  },
});