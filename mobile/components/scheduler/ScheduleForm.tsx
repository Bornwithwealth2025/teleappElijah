import React from "react";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
} from "lucide-react-native";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppButton,
  BRAND_GRADIENT,
} from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useSchedulerStore from "@/store/schedulerStore";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateValue(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
    value.getDate(),
  )}`;
}

function formatTimeValue(value: Date) {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function formatReadableDate(value?: string) {
  if (!value) {
    return "Choose a date";
  }

  const parsed = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatReadableTime(value?: string) {
  if (!value) {
    return "Choose a time";
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const parsed = new Date();
  parsed.setHours(hours, minutes, 0, 0);

  return parsed.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildIsoDate(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "";
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return "";
  }

  const parsed = new Date(`${date}T${time}:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString();
}

export function ScheduleForm() {
  const { colors } = useAppTheme();

  const isCreating = useSchedulerStore((state) => state.isCreating);
  const error = useSchedulerStore((state) => state.error);
  const clearError = useSchedulerStore((state) => state.clearError);
  const scheduleMeeting = useSchedulerStore(
    (state) => state.scheduleMeeting,
  );

  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [pickerMode, setPickerMode] = React.useState<
    "date" | "time" | null
  >(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const isoDate = buildIsoDate(date, time);
  const canSubmit = Boolean(isoDate) && !isCreating;

  const pickerValue = React.useMemo(() => {
    if (date && time) {
      const selected = new Date(`${date}T${time}:00`);

              <View style={styles.pickerLeading}>
                <View
                  style={[
                    styles.fieldIcon,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <CalendarDays color={colors.primary} size={19} />
                </View>

                <View style={styles.pickerCopy}>
                  <AppText variant="caption" tone="muted">
                    Date
                  </AppText>

                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.pickerValue,
                      { color: date ? colors.text : colors.textMuted },
                    ]}
                  >
                    {formatReadableDate(date)}
                  </AppText>
                </View>
              </View>
      if (!Number.isNaN(selected.getTime())) {
        return selected;
      }
    }

    if (date) {
      const selected = new Date(`${date}T12:00:00`);

      if (!Number.isNaN(selected.getTime())) {
        return selected;
      }
    }

    return new Date();
  }, [date, time]);

  function resetFeedback() {
    setIsSuccess(false);
    clearError();
  }

  const handlePickerChange = React.useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== "ios") {
        setPickerMode(null);
      }

      if (event.type === "dismissed" || !selectedDate) {
        return;
              <View style={styles.pickerLeading}>
                <View
                  style={[
                    styles.fieldIcon,
                    { backgroundColor: colors.secondarySoft },
                  ]}
                >
                  <Clock3 color={colors.secondary} size={19} />
                </View>

                <View style={styles.pickerCopy}>
                  <AppText variant="caption" tone="muted">
                    Start time
                  </AppText>

                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.pickerValue,
                      { color: time ? colors.text : colors.textMuted },
                    ]}
                  >
                    {formatReadableTime(time)}
                  </AppText>
                </View>
              </View>
      }

      if (pickerMode === "date") {
        setDate(formatDateValue(selectedDate));
      }

      if (pickerMode === "time") {
        setTime(formatTimeValue(selectedDate));
      }

      resetFeedback();
    },
    [pickerMode],
  );

  async function handleSubmit() {
    if (!isoDate || isCreating) {
      return;
    }

    resetFeedback();
    await scheduleMeeting(isoDate);

    if (!useSchedulerStore.getState().error) {
      setDate("");
      setTime("");
      setIsSuccess(true);
    }
  }

  const selectedSummary =
    date && time
      ? `${formatReadableDate(date)} at ${formatReadableTime(time)}`
      : null;

  return (
    <AppCard elevated style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}26`,
            },
          ]}
        >
          <CalendarDays color={colors.primary} size={22} />
        </View>

        <View style={styles.headerCopy}>
          <AppText variant="sectionTitle">
            Schedule a meeting
          </AppText>

          <AppText variant="caption" tone="muted">
            Create a secure room, then share the invitation when ready.
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.scheduleSurface,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sectionLabelRow}>
          <AppText variant="overline" tone="primary">
            Meeting time
          </AppText>

          <AppText variant="caption" tone="muted">
            Your local time
          </AppText>
        </View>

        {Platform.OS === "web" ? (
          <View style={styles.webFields}>
            <View
              style={[
                styles.webField,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <CalendarDays color={colors.primary} size={18} />

              <View style={styles.fieldCopy}>
                <AppText variant="caption" tone="muted">
                  Date
                </AppText>

                <TextInput
                  value={date}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSoft}
                  accessibilityLabel="Meeting date"
                  onChangeText={(value) => {
                    resetFeedback();
                    setDate(value);
                  }}
                  style={[styles.webInput, { color: colors.text }]}
                />
              </View>
            </View>

            <View
              style={[
                styles.webField,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Clock3 color={colors.secondary} size={18} />

              <View style={styles.fieldCopy}>
                <AppText variant="caption" tone="muted">
                  Time
                </AppText>

                <TextInput
                  value={time}
                  placeholder="HH:mm"
                  placeholderTextColor={colors.textSoft}
                  accessibilityLabel="Meeting time"
                  onChangeText={(value) => {
                    resetFeedback();
                    setTime(value);
                  }}
                  style={[styles.webInput, { color: colors.text }]}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.nativeFields}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose meeting date"
              onPress={() => {
                resetFeedback();
                setPickerMode("date");
              }}
              style={({ pressed }) => [
                styles.pickerField,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <View style={styles.pickerLeading}>
                <View
                  style={[
                    styles.fieldIcon,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <CalendarDays color={colors.primary} size={19} />
                </View>

                <View style={styles.pickerCopy}>
                  <AppText variant="caption" tone="muted">
                    Date
                  </AppText>

                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.pickerValue,
                      { color: date ? colors.text : colors.textMuted },
                    ]}
                  >
                    {formatReadableDate(date)}
                  </AppText>
                </View>
              </View>

              <View style={styles.pickerAction}>
                <AppText style={[styles.pickerHint, { color: colors.primary }]}>
                  {date ? "Change" : "Select"}
                </AppText>
                <ChevronRight color={colors.primary} size={18} />
              </View>
            </Pressable>

            <View
              style={[
                styles.pickerDivider,
                { backgroundColor: colors.divider },
              ]}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose meeting time"
              onPress={() => {
                resetFeedback();
                setPickerMode("time");
              }}
              style={({ pressed }) => [
                styles.pickerField,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <View style={styles.pickerLeading}>
                <View
                  style={[
                    styles.fieldIcon,
                    { backgroundColor: colors.secondarySoft },
                  ]}
                >
                  <Clock3 color={colors.secondary} size={19} />
                </View>

                <View style={styles.pickerCopy}>
                  <AppText variant="caption" tone="muted">
                    Start time
                  </AppText>

                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.pickerValue,
                      { color: time ? colors.text : colors.textMuted },
                    ]}
                  >
                    {formatReadableTime(time)}
                  </AppText>
                </View>
              </View>

              <View style={styles.pickerAction}>
                <AppText style={[styles.pickerHint, { color: colors.secondary }]}>
                  {time ? "Change" : "Select"}
                </AppText>
                <ChevronRight color={colors.secondary} size={18} />
              </View>
            </Pressable>
          </View>
        )}

        {selectedSummary ? (
          <View
            style={[
              styles.summary,
              {
                backgroundColor: `${colors.success}12`,
                borderColor: `${colors.success}30`,
              },
            ]}
          >
            <CheckCircle2 color={colors.success} size={16} />

            <AppText
              variant="caption"
              style={{ color: colors.success, fontWeight: "700" }}
            >
              {selectedSummary}
            </AppText>
          </View>
        ) : null}
      </View>

      {pickerMode && Platform.OS !== "web" ? (
        <DateTimePicker
          value={pickerValue}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={pickerMode === "date" ? new Date() : undefined}
          onChange={handlePickerChange}
          accentColor={colors.primary}
        />
      ) : null}

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

      {isSuccess ? (
        <View
          style={[
            styles.feedback,
            {
              backgroundColor: `${colors.success}12`,
              borderColor: `${colors.success}35`,
            },
          ]}
        >
          <CheckCircle2 color={colors.success} size={17} />

          <AppText
            variant="caption"
            style={{ color: colors.success, fontWeight: "700" }}
          >
            Meeting scheduled. Your secure link is ready to share.
          </AppText>
        </View>
      ) : null}

      <AppButton
        title={isCreating ? "Creating meeting..." : "Create scheduled meeting"}
        variant="gradient"
        gradientColors={BRAND_GRADIENT}
        loading={isCreating}
        disabled={!canSubmit}
        onPress={() => void handleSubmit()}
        leftIcon={<CalendarDays color="#FFFFFF" size={18} />}
        rightIcon={<ChevronRight color="#FFFFFF" size={19} />}
        contentAlign="spaceBetween"
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  iconShell: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  scheduleSurface: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nativeFields: {
    width: "100%",
    gap: Spacing.two,
  },
  pickerDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  pickerField: {
    width: "100%",
    minHeight: 76,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerLeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  pickerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  pickerValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  pickerAction: {
    minWidth: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
  },
  pickerHint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  fieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  webFields: {
    gap: Spacing.two,
  },
  webField: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  webInput: {
    minHeight: 25,
    padding: 0,
    fontSize: 15,
  },
  summary: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  feedback: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});