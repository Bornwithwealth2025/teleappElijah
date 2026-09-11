import React from "react";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react-native";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useSchedulerStore from "@/store/schedulerStore";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(value: Date) {
  return `${value.getFullYear()}-${pad(
    value.getMonth() + 1,
  )}-${pad(value.getDate())}`;
}

function formatTime(value: Date) {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
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

      if (!Number.isNaN(selected.getTime())) {
        return selected;
      }
    }

    return new Date();
  }, [date, time]);

  const handlePickerChange = React.useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== "ios") {
        setPickerMode(null);
      }

      if (event.type === "dismissed" || !selectedDate) {
        return;
      }

      if (pickerMode === "date") {
        setDate(formatDate(selectedDate));
      }

      if (pickerMode === "time") {
        setTime(formatTime(selectedDate));
      }

      setIsSuccess(false);
      clearError();
    },
    [clearError, pickerMode],
  );

  const handleSubmit = async () => {
    if (!isoDate || isCreating) {
      return;
    }

    setIsSuccess(false);
    clearError();

    await scheduleMeeting(isoDate);

    const latestError = useSchedulerStore.getState().error;

    if (!latestError) {
      setDate("");
      setTime("");
      setIsSuccess(true);
    }
  };

  const resetFeedback = () => {
    setIsSuccess(false);
    clearError();
  };

  return (
    <AppCard variant="tinted" style={styles.card}>
      <View style={styles.headingRow}>
        <View
          style={[
            styles.headingIcon,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}28`,
            },
          ]}
        >
          <CalendarDays color={colors.primary} size={21} />
        </View>

        <View style={styles.headingCopy}>
          <AppText variant="sectionTitle">
            Schedule a meeting
          </AppText>

          <AppText variant="caption" tone="muted">
            Choose a time and create a secure shareable meeting room.
          </AppText>
        </View>
      </View>

      <View style={styles.fields}>
        {Platform.OS === "web" ? (
          <>
            <View
              style={[
                styles.webField,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <CalendarDays color={colors.primary} size={19} />

              <View style={styles.pickerCopy}>
                <AppText variant="caption" tone="muted">
                  Date
                </AppText>

                <TextInput
                  value={date}
                  onChangeText={(value) => {
                    resetFeedback();
                    setDate(value);
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSoft}
                  accessibilityLabel="Meeting date"
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
              <Clock3 color={colors.secondary} size={19} />

              <View style={styles.pickerCopy}>
                <AppText variant="caption" tone="muted">
                  Time
                </AppText>

                <TextInput
                  value={time}
                  onChangeText={(value) => {
                    resetFeedback();
                    setTime(value);
                  }}
                  placeholder="HH:mm"
                  placeholderTextColor={colors.textSoft}
                  accessibilityLabel="Meeting time"
                  style={[styles.webInput, { color: colors.text }]}
                />
              </View>
            </View>
          </>
        ) : (
          <>
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
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <CalendarDays color={colors.primary} size={19} />

              <View style={styles.pickerCopy}>
                <AppText variant="caption" tone="muted">
                  Date
                </AppText>

                <AppText
                  variant="body"
                  style={{
                    color: date ? colors.text : colors.textMuted,
                  }}
                >
                  {date || "Select date"}
                </AppText>
              </View>
            </Pressable>

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
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <Clock3 color={colors.secondary} size={19} />

              <View style={styles.pickerCopy}>
                <AppText variant="caption" tone="muted">
                  Time
                </AppText>

                <AppText
                  variant="body"
                  style={{
                    color: time ? colors.text : colors.textMuted,
                  }}
                >
                  {time || "Select time"}
                </AppText>
              </View>
            </Pressable>
          </>
        )}
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
            styles.errorBox,
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
            styles.successBox,
            {
              backgroundColor: `${colors.success}14`,
              borderColor: `${colors.success}38`,
            },
          ]}
        >
          <CheckCircle2 color={colors.success} size={17} />

          <AppText
            variant="caption"
            style={{ color: colors.success, fontWeight: "700" }}
          >
            Meeting scheduled successfully.
          </AppText>
        </View>
      ) : null}

      <AppButton
        title={
          isCreating
            ? "Creating meeting..."
            : "Schedule meeting"
        }
        disabled={!canSubmit}
        loading={isCreating}
        onPress={() => void handleSubmit()}
        leftIcon={<CalendarDays color="#FFFFFF" size={18} />}
        containerStyle={styles.button}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  headingIcon: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  headingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  fields: {
    gap: Spacing.two,
  },

  pickerField: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  webField: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  pickerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  webInput: {
    minHeight: 25,
    padding: 0,
    fontSize: 15,
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },

  successBox: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  button: {
    marginTop: Spacing.one,
  },
});