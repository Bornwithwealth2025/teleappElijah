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
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
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
  return `${pad(value.getHours())}:${pad(
    value.getMinutes(),
  )}`;
}

function buildIsoDate(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  if (!/^\d{2}:\d{2}$/.test(time)) return "";

  const parsed = new Date(`${date}T${time}:00`);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString();
}

export function ScheduleForm() {
  const { colors } = useAppTheme();

  const isCreating = useSchedulerStore(
    (state) => state.isCreating,
  );
  const error = useSchedulerStore((state) => state.error);
  const clearError = useSchedulerStore(
    (state) => state.clearError,
  );
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
    (
      event: DateTimePickerEvent,
      selectedDate?: Date,
    ) => {
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
    if (!isoDate || isCreating) return;

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

  return (
    <AppCard variant="tinted" style={styles.card}>
      <View style={styles.headingRow}>
        <View
          style={[
            styles.headingIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <CalendarDays
            color={colors.primary}
            size={21}
          />
        </View>

        <View style={styles.headingCopy}>
          <AppText variant="sectionTitle">
            Schedule a meeting
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.copy}
          >
            Choose when your secure Telefya room should be
            available.
          </AppText>
        </View>
      </View>

      <View style={styles.fields}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose meeting date"
          onPress={() => {
            setIsSuccess(false);
            clearError();
            setPickerMode("date");
          }}
          style={[
            styles.pickerField,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <CalendarDays
            color={colors.textSoft}
            size={19}
          />

          <View style={styles.pickerCopy}>
            <AppText variant="caption" tone="muted">
              Date
            </AppText>

            <AppText
              variant="body"
              style={{
                color: date
                  ? colors.text
                  : colors.textMuted,
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
            setIsSuccess(false);
            clearError();
            setPickerMode("time");
          }}
          style={[
            styles.pickerField,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Clock3
            color={colors.textSoft}
            size={19}
          />

          <View style={styles.pickerCopy}>
            <AppText variant="caption" tone="muted">
              Time
            </AppText>

            <AppText
              variant="body"
              style={{
                color: time
                  ? colors.text
                  : colors.textMuted,
              }}
            >
              {time || "Select time"}
            </AppText>
          </View>
        </Pressable>
      </View>

      {pickerMode && Platform.OS !== "web" ? (
        <DateTimePicker
          value={pickerValue}
          mode={pickerMode}
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          minimumDate={
            pickerMode === "date"
              ? new Date()
              : undefined
          }
          onChange={handlePickerChange}
          accentColor={colors.primary}
        />
      ) : null}

      {error ? (
        <AppText
          variant="caption"
          style={[
            styles.error,
            { color: colors.danger },
          ]}
        >
          {error}
        </AppText>
      ) : null}

      {isSuccess ? (
        <View
          style={[
            styles.successBox,
            {
              backgroundColor: `${colors.success}18`,
              borderColor: `${colors.success}40`,
            },
          ]}
        >
          <CheckCircle2
            color={colors.success}
            size={17}
          />

          <AppText
            variant="caption"
            style={{ color: colors.success }}
          >
            Meeting scheduled successfully.
          </AppText>
        </View>
      ) : null}

      <AppButton
        title={
          isCreating
            ? "Creating meeting..."
            : "Create secure schedule"
        }
        disabled={!canSubmit}
        loading={isCreating}
        onPress={() => void handleSubmit()}
        leftIcon={
          <CalendarDays
            color="#FFFFFF"
            size={18}
          />
        }
        containerStyle={styles.button}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  headingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  headingCopy: {
    flex: 1,
    gap: 2,
  },

  copy: {
    marginTop: Spacing.one,
  },

  fields: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },

  pickerField: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  pickerCopy: {
    flex: 1,
    gap: 2,
  },

  error: {
    textAlign: "center",
    fontWeight: "700",
  },

  successBox: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  button: {
    marginTop: Spacing.two,
  },
});