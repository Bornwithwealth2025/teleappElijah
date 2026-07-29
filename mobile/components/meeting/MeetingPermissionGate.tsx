import React, {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import {
  Camera,
  Mic,
  ShieldAlert,
} from "lucide-react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import { useMeetingPermissions } from "@/hooks/useMeetingPermission";

type Props = {
  children: ReactNode;
  autoRequest?: boolean;
  onGranted?: () => void;
};

export function MeetingPermissionGate({
  children,
  autoRequest = true,
  onGranted,
}: Props) {
  const { colors } = useAppTheme();
  const {
    status,
    error,
    granted,
    requestPermissions,
  } = useMeetingPermissions();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  useEffect(() => {
    if (!autoRequest || status !== "idle") {
      return;
    }

    void requestPermissions().then((success) => {
      if (success) {
        onGranted?.();
      }
    });
  }, [
    autoRequest,
    onGranted,
    requestPermissions,
    status,
  ]);

  if (granted) {
    return <>{children}</>;
  }

  const checking = status === "checking";
  const denied = status === "denied";

  async function handleRequest() {
    const success = await requestPermissions();

    if (success) {
      onGranted?.();
    }
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <AppCard elevated style={styles.card}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: denied
                ? `${colors.danger}18`
                : colors.primarySoft,
            },
          ]}
        >
          {denied ? (
            <ShieldAlert
              color={colors.danger}
              size={26}
            />
          ) : (
            <View style={styles.iconRow}>
              <Camera color={colors.primary} size={21} />
              <Mic color={colors.primary} size={21} />
            </View>
          )}
        </View>

        <View style={styles.copy}>
          <AppText variant="sectionTitle">
            {denied
              ? "Permission required"
              : "Prepare your meeting"}
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.description}
          >
            {denied
              ? "Camera and microphone access is disabled. Enable both permissions in your Android settings to join."
              : "Telefya needs access to your camera and microphone before you join a live meeting."}
          </AppText>
        </View>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: `${colors.danger}12`,
                borderColor: `${colors.danger}35`,
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

        <AppButton
          title={
            checking
              ? "Checking permissions..."
              : denied
                ? "Try again"
                : "Allow camera and microphone"
          }
          loading={checking}
          disabled={checking}
          onPress={() => void handleRequest()}
        />
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  card: {
    gap: Spacing.four,
    alignItems: "center",
  },

  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  iconRow: {
    flexDirection: "row",
    gap: Spacing.one,
  },

  copy: {
    width: "100%",
    gap: Spacing.one,
    alignItems: "center",
  },

  description: {
    maxWidth: 320,
    textAlign: "center",
    lineHeight: 21,
  },

  errorBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
});