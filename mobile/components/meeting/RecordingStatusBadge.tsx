import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import {
  CheckCircle2,
  LoaderCircle,
  Radio,
  XCircle,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { RecordingStatus } from "@/api/recording.service";

type Props = {
  status: RecordingStatus | "idle";
};

export function RecordingStatusBadge({ status }: Props) {
  const { colors } = useAppTheme();
  const pulse = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.stopAnimation();
    rotation.stopAnimation();

    if (status === "recording") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.12,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulse.setValue(1);
    }

    if (status === "processing") {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotation.setValue(0);
    }

    return () => {
      pulse.stopAnimation();
      rotation.stopAnimation();
    };
  }, [pulse, rotation, status]);

  if (status === "idle") {
    return null;
  }

  const config = {
    recording: {
      label: "Recording",
      color: colors.danger,
      icon: <Radio color={colors.danger} size={14} />,
    },
    processing: {
      label: "Processing",
      color: colors.warning,
      icon: <LoaderCircle color={colors.warning} size={14} />,
    },
    ready: {
      label: "Ready",
      color: colors.success,
      icon: <CheckCircle2 color={colors.success} size={14} />,
    },
    failed: {
      label: "Failed",
      color: colors.danger,
      icon: <XCircle color={colors.danger} size={14} />,
    },
  }[status];

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${config.color}18`,
          borderColor: `${config.color}45`,
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [
            { scale: pulse },
            { rotate: spin },
          ],
        }}
      >
        {config.icon}
      </Animated.View>

      <AppText
        variant="caption"
        style={[
          styles.label,
          { color: config.color },
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  label: {
    fontWeight: "800",
  },
});