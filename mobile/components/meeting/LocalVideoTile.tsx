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

type Props = {
  name: string;
  stream?: any;
  muted?: boolean;
  cameraOff?: boolean;
  featured?: boolean;
  compact?: boolean;
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
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
}: Props) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  let RTCView: any = null;

  if (Platform.OS !== "web") {
    try {
      RTCView = require("react-native-webrtc").RTCView;
    } catch {
      RTCView = null;
    }
  }

  const canRenderVideo =
    !cameraOff &&
    RTCView &&
    stream &&
    typeof stream.toURL === "function";

  const tileStyle = featured
    ? styles.featuredTile
    : compact
      ? styles.compactTile
      : styles.tile;

  const fallbackStyle = featured
    ? styles.featuredFallback
    : compact
      ? styles.compactFallback
      : styles.fallback;

  return (
    <Animated.View
      accessibilityLabel={`${name}, local video`}
      style={[
        tileStyle,
        {
          opacity,
          transform: [{ scale }],
          borderColor: colors.primary,
        },
      ]}
    >
      {canRenderVideo ? (
        <RTCView
          streamURL={stream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          mirror
        />
      ) : (
        <View
          style={[
            fallbackStyle,
            { backgroundColor: colors.surfaceStrong },
          ]}
        >
          <View
            style={[
              styles.avatar,
              compact && styles.compactAvatar,
              featured && styles.featuredAvatar,
              { backgroundColor: colors.primary },
            ]}
          >
            {cameraOff ? (
              <VideoOff
                color="#FFFFFF"
                size={compact ? 16 : 27}
              />
            ) : (
              <AppText
                variant={compact ? "bodyStrong" : "title"}
                style={styles.white}
              >
                {getInitials(name)}
              </AppText>
            )}
          </View>

          {!compact ? (
            <AppText
              variant="caption"
              style={styles.fallbackText}
            >
              {cameraOff
                ? "Camera off"
                : "Preparing video"}
            </AppText>
          ) : null}
        </View>
      )}

      {!compact ? (
        <LinearGradient
          pointerEvents="none"
          colors={[
            "transparent",
            "rgba(3, 10, 24, 0.9)",
          ]}
          style={styles.gradient}
        />
      ) : null}

      <View
        style={[
          styles.topBadge,
          compact && styles.compactBadge,
        ]}
      >
        <View style={styles.liveDot} />

        {!compact ? (
          <AppText
            variant="label"
            style={styles.badgeText}
          >
            You
          </AppText>
        ) : null}
      </View>

      <View
        style={[
          styles.bottomOverlay,
          compact && styles.compactOverlay,
        ]}
      >
        <View style={styles.namePill}>
          <AppText
            variant="caption"
            numberOfLines={1}
            style={[
              styles.name,
              compact && styles.compactName,
            ]}
          >
            {compact ? "You" : name}
          </AppText>
        </View>

        <View
          style={[
            styles.status,
            compact && styles.compactStatus,
            {
              backgroundColor: muted
                ? "rgba(220, 38, 38, 0.88)"
                : "rgba(15, 107, 255, 0.9)",
            },
          ]}
        >
          {muted ? (
            <MicOff
              color="#FFFFFF"
              size={compact ? 12 : 15}
            />
          ) : (
            <Mic
              color="#FFFFFF"
              size={compact ? 12 : 15}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: "46%",
    minHeight: 210,
    overflow: "hidden",
    borderWidth: 1.5,
    borderRadius: Radius.xLarge,
    backgroundColor: "#0B1220",
  },

  featuredTile: {
    width: "100%",
    minHeight: 290,
    overflow: "hidden",
    borderWidth: 1.5,
    borderRadius: Radius.xLarge,
    backgroundColor: "#0B1220",
  },

  compactTile: {
    width: 148,
    minWidth: 148,
    height: 104,
    minHeight: 104,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: Radius.medium,
    backgroundColor: "#0B1220",
  },

  fallback: {
    flex: 1,
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },

  featuredFallback: {
    flex: 1,
    minHeight: 290,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },

  compactFallback: {
    flex: 1,
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  featuredAvatar: {
    width: 88,
    height: 88,
  },

  compactAvatar: {
    width: 36,
    height: 36,
  },

  fallbackText: {
    color: "#B7C2D5",
    fontWeight: "700",
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
    top: "42%",
  },

  topBadge: {
    position: "absolute",
    top: Spacing.three,
    left: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(3, 10, 24, 0.72)",
  },

  compactBadge: {
    top: 7,
    left: 7,
    padding: 0,
    backgroundColor: "transparent",
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: "#38D996",
  },

  badgeText: {
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },

  bottomOverlay: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },

  compactOverlay: {
    left: 7,
    right: 7,
    bottom: 7,
  },

  namePill: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  compactName: {
    fontSize: 12,
  },

  status: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  compactStatus: {
    width: 24,
    height: 24,
  },

  white: {
    color: "#FFFFFF",
  },
});