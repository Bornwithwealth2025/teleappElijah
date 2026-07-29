import { Monitor, MonitorOff } from "lucide-react-native";
import { Platform, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type Props = {
  stream?: any;
  userName?: string;
  active?: boolean;
  isLocal?: boolean;
};

export function ScreenShareTile({
  stream,
  userName = "Participant",
  active = true,
  isLocal = false,
}: Props) {
  const { colors } = useAppTheme();

  let RTCView: any = null;

  if (Platform.OS !== "web") {
    try {
      RTCView = require("react-native-webrtc").RTCView;
    } catch {}
  }

  const canRender =
    active &&
    RTCView &&
    stream &&
    typeof stream.toURL === "function";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {canRender ? (
        <RTCView
          streamURL={stream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="contain"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { backgroundColor: colors.surfaceStrong },
          ]}
        >
          {active ? (
            <Monitor color={colors.primary} size={30} />
          ) : (
            <MonitorOff color={colors.textMuted} size={30} />
          )}

          <AppText variant="bodyStrong">
            {active ? "Screen sharing" : "Screen sharing stopped"}
          </AppText>

          {active ? (
            <AppText variant="caption" tone="muted">
              {isLocal ? "Your screen" : `${userName}'s screen`}
            </AppText>
          ) : null}
        </View>
      )}

      {active ? (
        <View style={styles.badge}>
          <Monitor color="#FFFFFF" size={14} />
          <AppText variant="caption" style={styles.badgeText}>
            {isLocal ? "You are presenting" : `${userName} is presenting`}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 220,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.large,
  },
  fallback: {
    flex: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.four,
  },
  badge: {
    position: "absolute",
    left: Spacing.two,
    bottom: Spacing.two,
    minHeight: 30,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: "rgba(7,22,51,0.78)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});