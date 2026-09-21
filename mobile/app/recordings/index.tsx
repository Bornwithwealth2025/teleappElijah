import React, { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Film,
  Play,
  RefreshCw,
  Search,
  X,
} from "lucide-react-native";
import {
  Animated,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import RecordingService, {
  type Recording,
} from "@/api/recording.service";
import { RecordingStatusBadge } from "@/components/meeting/RecordingStatusBadge";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type Filter = "all" | "ready" | "processing";

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

function getRecordingTitle(recording: Recording) {
  return (
    recording.title ||
    recording.fileName ||
    "Telefya meeting recording"
  );
}

function isProcessing(recording: Recording) {
  return (
    recording.status === "recording" ||
    recording.status === "processing"
  );
}

export default function RecordingsScreen() {
  const { colors } = useAppTheme();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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
        bounciness: 4,
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

  const visibleRecordings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recordings.filter((recording) => {
      const title = getRecordingTitle(recording).toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        String(recording.roomId ?? "")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "ready"
            ? recording.status === "ready"
            : isProcessing(recording);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, recordings]);

  const readyCount = recordings.filter(
    (recording) => recording.status === "ready",
  ).length;

  return (
    <AppScreen
      tone="aurora"
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
      <AppHeader
        eyebrow="MEETING LIBRARY"
        title="Recordings"
        subtitle="Review meeting outcomes, share sessions, and keep your team aligned."
        size="page"
        rightSlot={
          <IconButton
            icon={<RefreshCw color={colors.primary} size={19} />}
            variant="soft"
            accessibilityLabel="Refresh recordings"
            onPress={() => void loadRecordings()}
          />
        }
      />

      <View
        style={[
          styles.librarySummary,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Film color={colors.primary} size={23} />
        </View>

        <View style={styles.summaryCopy}>
          <AppText variant="bodyStrong">
            {recordings.length
              ? `${recordings.length} recording${recordings.length === 1 ? "" : "s"} in your library`
              : "Your meeting library"}
          </AppText>

          <AppText variant="caption" tone="muted">
            {readyCount
              ? `${readyCount} ready to replay, download, or share.`
              : "Finished meetings will appear here once processing is complete."}
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.searchField,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Search color={colors.textSoft} size={19} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search recordings or room IDs"
          placeholderTextColor={colors.textSoft}
          accessibilityLabel="Search recordings"
          style={[styles.searchInput, { color: colors.text }]}
        />

        {query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear recording search"
            hitSlop={10}
            onPress={() => setQuery("")}
          >
            <X color={colors.textSoft} size={18} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filters}>
        {(
          [
            ["all", "All"],
            ["ready", "Ready"],
            ["processing", "Processing"],
          ] as const
        ).map(([value, label]) => {
          const active = filter === value;

          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(value)}
              style={[
                styles.filter,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.card,
                  borderColor: active
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={{
                  color: active ? "#FFFFFF" : colors.textMuted,
                  fontWeight: "800",
                }}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
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
            style={{ color: colors.danger, fontWeight: "700" }}
          >
            {error}
          </AppText>

          <Pressable
            accessibilityRole="button"
            onPress={() => void loadRecordings()}
          >
            <AppText
              variant="caption"
              style={{ color: colors.primary, fontWeight: "800" }}
            >
              Try again
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {isLoading && recordings.length === 0 ? (
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.stateIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Film color={colors.primary} size={25} />
          </View>

          <AppText variant="bodyStrong">Loading recordings</AppText>

          <AppText variant="caption" tone="muted">
            Fetching your saved meeting sessions.
          </AppText>
        </View>
      ) : null}

      {!isLoading && !error && recordings.length === 0 ? (
        <EmptyState
          title="No recordings yet"
          description="When a hosted meeting finishes recording and processing, it will appear here."
        />
      ) : null}

      {!isLoading &&
      !error &&
      recordings.length > 0 &&
      visibleRecordings.length === 0 ? (
        <EmptyState
          title="No matching recordings"
          description="Try another search term or change the recording filter."
        />
      ) : null}

      {visibleRecordings.length > 0 ? (
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
          <View style={styles.listTitleRow}>
            <AppText variant="sectionTitle">
              {filter === "all" ? "All recordings" : `${filter === "ready" ? "Ready" : "Processing"} recordings`}
            </AppText>

            <AppText variant="caption" tone="muted">
              {visibleRecordings.length}
            </AppText>
          </View>

          {visibleRecordings.map((recording) => {
            const title = getRecordingTitle(recording);
            const ready = recording.status === "ready";

            return (
              <Pressable
                key={recording.recordingId}
                accessibilityRole="button"
                accessibilityLabel={`Open ${title}`}
                onPress={() =>
                  router.push(
                    `/recordings/${recording.recordingId}` as any,
                  )
                }
                style={({ pressed }) => [
                  styles.pressable,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.recordingCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.thumbnail,
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
                      <Film color={colors.primary} size={25} />
                    )}

                    {ready ? (
                      <View
                        style={[
                          styles.playBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Play
                          color="#FFFFFF"
                          size={11}
                          fill="#FFFFFF"
                        />
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.recordingCopy}>
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.stateCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.stateIcon,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <Film color={colors.primary} size={25} />
      </View>

      <AppText variant="sectionTitle">{title}</AppText>

      <AppText
        variant="caption"
        tone="muted"
        style={styles.stateDescription}
      >
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  librarySummary: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  searchField: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
  },
  filters: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  filter: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  pressable: {
    borderRadius: Radius.large,
  },
  recordingCard: {
    minHeight: 104,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  thumbnail: {
    width: 62,
    height: 62,
    overflow: "hidden",
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  playBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingCopy: {
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
  stateCard: {
    minHeight: 225,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  stateDescription: {
    maxWidth: 290,
    textAlign: "center",
    lineHeight: 20,
  },
});