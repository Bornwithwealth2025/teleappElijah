import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type StreamLike = {
  toURL?: () => string;
};

type RtcViewProps = {
  streamURL: string;
  objectFit?: "cover" | "contain";
  style?: object;
  mirror?: boolean;
};

type Props = {
  name: string;
  stream?: StreamLike | null;
  muted?: boolean;
  cameraOff?: boolean;
  featured?: boolean;
  compact?: boolean;
  fill?: boolean;
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "Y"
  );
}

export function LocalVideoTile({
  name,
  stream,
  muted = false,
  cameraOff = false,
  featured = false,
  compact = false,
  fill = false,
}: Props) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 18,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, scale]);

  let RTCView: React.ComponentType<RtcViewProps> | null = null;

  if (Platform.OS !== "web") {
    try {
      const webrtc = require("@stream-io/react-native-webrtc") as {
        RTCView?: React.ComponentType<RtcViewProps>;
      };

      RTCView = webrtc.RTCView ?? null;
    } catch {
      RTCView = null;
    }
  }

  const streamURL = stream?.toURL?.();
  const canRenderVideo =
    !cameraOff && Boolean(RTCView) && Boolean(streamURL);

  const tileStyle = [
    styles.root,
    featured && styles.featured,
    compact && styles.compact,
    fill && styles.fill,
    {
      backgroundColor: colors.surfaceStrong,
      borderColor: canRenderVideo
        ? `${colors.primary}75`
        : colors.border,
    },
  ];

  return (
    <Animated.View
      style={[
        tileStyle,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {canRenderVideo && RTCView && streamURL ? (
        <RTCView
          streamURL={streamURL}
          mirror
          objectFit="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <LinearGradient
          colors={
            cameraOff
              ? [colors.surfaceStrong, colors.surfaceHover]
              : [colors.primaryDeep, colors.secondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fallback}
        >
          <View
            style={[
              styles.initials,
              {
                backgroundColor: `${colors.card}24`,
                borderColor: `${colors.card}52`,
              },
            ]}
          >
            {cameraOff ? (
              <VideoOff color="#FFFFFF" size={compact ? 16 : 24} />
            ) : (
              <AppText
                style={[
                  styles.initialsText,
                  compact && styles.compactInitialsText,
                ]}
              >
                {getInitials(name)}
              </AppText>
            )}
          </View>
        </LinearGradient>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(2, 6, 24, 0)", "rgba(2, 6, 24, 0.82)"]}
        style={styles.bottomShade}
      />

      <View style={styles.topRow}>
        <View
          style={[
            styles.youBadge,
            {
              backgroundColor: "rgba(2, 6, 24, 0.62)",
              borderColor: "rgba(255, 255, 255, 0.16)",
            },
          ]}
        >
          <View
            style={[
              styles.liveDot,
              {
                backgroundColor: cameraOff
                  ? colors.textSoft
                  : colors.success,
              },
            ]}
          />
          <AppText style={styles.youBadgeText}>You</AppText>
        </View>

        {cameraOff ? (
          <View style={styles.statusButton}>
            <VideoOff color="#FFFFFF" size={compact ? 13 : 16} />
          </View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.nameWrap}>
          <AppText
            numberOfLines={1}
            style={[
              styles.name,
              compact && styles.compactName,
            ]}
          >
            {name || "You"}
          </AppText>

          {!compact ? (
            <AppText
              numberOfLines={1}
              style={styles.subLabel}
            >
              {cameraOff ? "Camera off" : "Local preview"}
            </AppText>
          ) : null}
        </View>

        <View
          style={[
            styles.micStatus,
            {
              backgroundColor: muted
                ? `${colors.danger}E6`
                : "rgba(2, 6, 24, 0.66)",
            },
          ]}
        >
          {muted ? (
            <MicOff color="#FFFFFF" size={compact ? 13 : 16} />
          ) : (
            <Mic color="#FFFFFF" size={compact ? 13 : 16} />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    minHeight: 236,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    overflow: "hidden",
  },

  featured: {
    minHeight: 300,
  },

  fill: {
    flex: 1,
    minHeight: 0,
    borderWidth: 0,
    borderRadius: 0,
  },

  compact: {
    width: 132,
    height: 94,
    minHeight: 94,
    borderRadius: Radius.medium,
  },

  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    width: 74,
    height: 74,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  initialsText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  compactInitialsText: {
    fontSize: 17,
  },

  bottomShade: {
    ...StyleSheet.absoluteFill,
  },

  topRow: {
    position: "absolute",
    top: Spacing.two,
    left: Spacing.two,
    right: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  youBadge: {
    minHeight: 25,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  statusButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(2, 6, 24, 0.66)",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomRow: {
    position: "absolute",
    left: Spacing.two,
    right: Spacing.two,
    bottom: Spacing.two,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  nameWrap: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  compactName: {
    fontSize: 11,
  },

  subLabel: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 10,
    marginTop: 2,
  },

  micStatus: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});