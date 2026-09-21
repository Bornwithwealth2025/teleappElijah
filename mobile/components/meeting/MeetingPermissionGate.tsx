import React, {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  Alert,
  Animated,
  Linking,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Constants from "expo-constants";
import {
  Camera,
  CircleAlert,
  LockKeyhole,
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
  const translateY = useRef(new Animated.Value(16)).current;

  // WebRTC camera/video requires Telefya's custom development build.
  // It cannot run inside the standard Expo Go client.
  const isExpoGo = Constants.appOwnership === "expo";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 210,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  useEffect(() => {
    if (
      isExpoGo ||
      !autoRequest ||
      status !== "idle"
    ) {
      return;
    }

    void requestPermissions().then((success) => {
      if (success) {
        onGranted?.();
      }
    });
  }, [
    autoRequest,
    isExpoGo,
    onGranted,
    requestPermissions,
    status,
  ]);

  if (granted && !isExpoGo) {
    return <>{children}</>;
  }

  const checking = status === "checking";
  const denied = status === "denied";

  async function handleAllowPermissions() {
    const success = await requestPermissions();

    if (success) {
      onGranted?.();
    }
  }

  function openAndroidSettings() {
    void Linking.openSettings().catch(() => {
      Alert.alert(
        "Unable to open Settings",
        "Open Android Settings, select Apps, choose Telefya, then allow Camera and Microphone.",
      );
    });
  }

  function explainDevelopmentBuild() {
    Alert.alert(
      "Open Telefya development build",
      "Live meeting video uses native WebRTC. Close Expo Go and open the installed Telefya development build created with npx expo run:android.",
    );
  }

  const title = isExpoGo
    ? "Open the Telefya development build"
    : denied
      ? "Camera and microphone are blocked"
      : "Prepare your meeting";

  const description = isExpoGo
    ? "Expo Go cannot load Telefya’s native WebRTC meeting camera. Use the installed Telefya development build to test video meetings."
    : denied
      ? Platform.OS === "android"
        ? "Camera and microphone access was denied. Enable both permissions in Android Settings, then return here and continue."
        : "Camera and microphone access was denied. Enable both permissions in Settings, then return here and continue."
      : "Telefya needs your camera and microphone before you can preview or join a live meeting.";

  const buttonTitle = isExpoGo
    ? "Why do I need the Telefya build?"
    : checking
      ? "Checking permissions..."
      : denied
        ? "Open device settings"
        : "Allow camera and microphone";

  function handlePrimaryAction() {
    if (isExpoGo) {
      explainDevelopmentBuild();
      return;
    }

    if (denied) {
      openAndroidSettings();
      return;
    }

    void handleAllowPermissions();
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
              backgroundColor: isExpoGo
                ? colors.secondarySoft
                : denied
                  ? `${colors.danger}18`
                  : colors.primarySoft,
            },
          ]}
        >
          {isExpoGo ? (
            <LockKeyhole color={colors.secondary} size={27} />
          ) : denied ? (
            <ShieldAlert color={colors.danger} size={27} />
          ) : (
            <View style={styles.iconRow}>
              <Camera color={colors.primary} size={22} />
              <Mic color={colors.primary} size={22} />
            </View>
          )}
        </View>

        <View style={styles.copy}>
          <AppText variant="sectionTitle" style={styles.title}>
            {title}
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.description}
          >
            {description}
          </AppText>
        </View>

        {!isExpoGo ? (
          <View
            style={[
              styles.requirements,
              {
                backgroundColor: colors.surfaceStrong,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.requirementRow}>
              <Camera color={colors.primary} size={16} />
              <AppText variant="caption" style={styles.requirementText}>
                Camera for your video preview
              </AppText>
            </View>

            <View style={styles.requirementRow}>
              <Mic color={colors.primary} size={16} />
              <AppText variant="caption" style={styles.requirementText}>
                Microphone for meeting audio
              </AppText>
            </View>
          </View>
        ) : null}

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: `${colors.danger}12`,
                borderColor: `${colors.danger}38`,
              },
            ]}
          >
            <CircleAlert color={colors.danger} size={17} />

            <AppText
              variant="caption"
              style={[styles.errorText, { color: colors.danger }]}
            >
              {error}
            </AppText>
          </View>
        ) : null}

        <AppButton
          title={buttonTitle}
          loading={checking}
          disabled={checking}
          onPress={handlePrimaryAction}
        />

        {denied && !isExpoGo ? (
          <AppText
            variant="caption"
            tone="muted"
            style={styles.helpText}
          >
            After enabling permissions, return to Telefya and tap Try again.
          </AppText>
        ) : null}
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
    paddingVertical: Spacing.five,
  },

  icon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  copy: {
    width: "100%",
    gap: Spacing.one,
    alignItems: "center",
  },

  title: {
    textAlign: "center",
  },

  description: {
    maxWidth: 330,
    textAlign: "center",
    lineHeight: 21,
  },

  requirements: {
    width: "100%",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  requirementText: {
    flex: 1,
    fontWeight: "700",
  },

  errorBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },

  errorText: {
    flex: 1,
    lineHeight: 19,
    fontWeight: "700",
  },

  helpText: {
    marginTop: -Spacing.two,
    textAlign: "center",
  },
});