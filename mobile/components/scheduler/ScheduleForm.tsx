import React from "react";
import { Calendar, Clock } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import useSchedulerStore from "@/store/schedulerStore";

function buildIsoDate(date: string, time: string) {
  const normalizedDate = date.trim();
  const normalizedTime = time.trim();

  if (!normalizedDate || !normalizedTime) return "";

  const localDate = new Date(`${normalizedDate}T${normalizedTime}:00`);

  if (Number.isNaN(localDate.getTime())) return "";

  return localDate.toISOString();
}

export function ScheduleForm() {
  const { colors } = useAppTheme();

  const isCreating = useSchedulerStore((state) => state.isCreating);
  const error = useSchedulerStore((state) => state.error);
  const clearError = useSchedulerStore((state) => state.clearError);
  const scheduleMeeting = useSchedulerStore((state) => state.scheduleMeeting);

  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");

  const isoDate = buildIsoDate(date, time);
  const canSubmit = Boolean(isoDate) && !isCreating;

  const handleSubmit = async () => {
    if (!isoDate) return;

    await scheduleMeeting(isoDate);

    setDate("");
    setTime("");
  };

  return (
    <AppCard>
      <AppText variant="bodyStrong">New scheduled meeting</AppText>
      <AppText variant="caption" tone="muted" style={styles.copy}>
        Enter a date and time to generate a backend meeting link.
      </AppText>

      <View style={styles.fields}>
        <AppTextInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={(value) => {
            setDate(value);
            clearError();
          }}
          leftSlot={<Calendar color={colors.textSoft} size={18} />}
        />

        <AppTextInput
          label="Time"
          placeholder="HH:mm"
          value={time}
          onChangeText={(value) => {
            setTime(value);
            clearError();
          }}
          leftSlot={<Clock color={colors.textSoft} size={18} />}
        />
      </View>

      {error ? (
        <AppText
          variant="caption"
          style={[styles.error, { color: colors.danger }]}
        >
          {error}
        </AppText>
      ) : null}

      <AppButton
        title={isCreating ? "Creating..." : "Create schedule"}
        disabled={!canSubmit}
        loading={isCreating}
        onPress={handleSubmit}
        containerStyle={styles.button}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  copy: {
    marginTop: Spacing.two,
  },
  fields: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  error: {
    marginTop: Spacing.three,
    textAlign: "center",
    fontWeight: "700",
  },
  button: {
    marginTop: Spacing.four,
  },
});