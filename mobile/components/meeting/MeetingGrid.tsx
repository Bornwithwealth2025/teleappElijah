import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ShieldCheck,
  Users,
  Video,
} from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { RemoteStream } from "@/store/meetingStore";
import type { MeetingParticipant } from "@/types/meeting.types";

import { LocalVideoTile } from "./LocalVideoTile";
import { RemoteVideoTile } from "./RemoteVideoTile";

type Props = {
  localStream?: unknown;
  localName: string;
  localMuted?: boolean;
  localCameraOff?: boolean;
  remoteStreams: RemoteStream[];
  participants: MeetingParticipant[];
  fullScreen?: boolean;
};

export function MeetingGrid({
  localStream,
  localName,
  localMuted = false,
  localCameraOff = false,
  remoteStreams,
  participants,
  fullScreen = false,
}: Props) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const compact = width < 380;

  const visualRemoteStreams = remoteStreams.filter(
    (stream) =>
      stream.isScreen || stream.kind === "video",
  );

  const featuredRemote =
    visualRemoteStreams.find((stream) => stream.isScreen) ??
    visualRemoteStreams[0] ??
    null;

  const galleryRemoteStreams = featuredRemote
    ? visualRemoteStreams.filter(
        (stream) =>
          stream.producerId !== featuredRemote.producerId,
      )
    : [];

  const hasMedia =
    Boolean(localStream) ||
    visualRemoteStreams.length > 0;

  const peopleCount = Math.max(
    participants.length,
    new Set(
      [
        "local-user",
        ...remoteStreams.map(
          (stream) => stream.userId ?? stream.producerId,
        ),
      ].filter(Boolean),
    ).size,
  );

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [
    opacity,
    remoteStreams.length,
    translateY,
  ]);

  function getParticipant(userId?: string) {
    return participants.find(
      (participant) => participant.userId === userId,
    );
  }

  if (!hasMedia) {
    return (
      <View
        accessibilityLabel="Meeting camera preview"
        style={[
          fullScreen
            ? styles.emptyFullScreen
            : styles.empty,
          {
            backgroundColor: fullScreen
              ? colors.background
              : colors.surfaceStrong,
            borderColor: colors.border,
          },
        ]}
      >
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIcon}
        >
          <Video color="#FFFFFF" size={25} />
        </LinearGradient>

        <View style={styles.emptyCopyWrap}>
          <AppText
            variant="bodyStrong"
            style={styles.emptyTitle}
          >
            {fullScreen
              ? "Waiting for video"
              : "Your camera preview"}
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={styles.emptyCopy}
          >
            {fullScreen
              ? "Video will appear here as participants join."
              : "Allow camera and microphone access to preview how you will appear."}
          </AppText>
        </View>

        {!fullScreen ? (
          <View
            style={[
              styles.previewSecurePill,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.border,
              },
            ]}
          >
            <ShieldCheck
              color={colors.primary}
              size={14}
            />

            <AppText
              style={[
                styles.previewSecureText,
                { color: colors.primary },
              ]}
            >
              Secure preview
            </AppText>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        fullScreen
          ? styles.fullScreenRoot
          : styles.root,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {!fullScreen ? (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <AppText variant="bodyStrong">
              Meeting preview
            </AppText>

            <AppText variant="caption" tone="muted">
              Check your camera and microphone before joining.
            </AppText>
          </View>

          <View
            style={[
              styles.participantsPill,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Users
              color={colors.primary}
              size={14}
            />

            <AppText
              style={[
                styles.participantCount,
                { color: colors.primary },
              ]}
            >
              {peopleCount}
            </AppText>
          </View>
        </View>
      ) : null}

      <View
        style={[
          fullScreen
            ? styles.fullScreenStage
            : styles.stage,
          {
            backgroundColor: colors.surfaceStrong,
          },
        ]}
      >
        {featuredRemote ? (
          <RemoteVideoTile
            remote={featuredRemote}
            fill={fullScreen}
            featured={!fullScreen}
            muted={
              getParticipant(featuredRemote.userId)
                ?.isMuted ?? false
            }
            cameraOff={
              getParticipant(featuredRemote.userId)
                ?.isCameraOff ?? false
            }
          />
        ) : (
          <LocalVideoTile
            name={localName}
            stream={
              localStream as {
                toURL?: () => string;
              }
            }
            muted={localMuted}
            cameraOff={localCameraOff}
            featured={!fullScreen}
            fill={fullScreen}
          />
        )}

        {fullScreen && featuredRemote ? (
          <View style={styles.presenterLabel}>
            <View
              style={[
                styles.presenterDot,
                { backgroundColor: colors.success },
              ]}
            />

            <AppText style={styles.presenterText}>
              Active speaker
            </AppText>
          </View>
        ) : null}
      </View>

      {fullScreen &&
      (featuredRemote || galleryRemoteStreams.length > 0) ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fullScreenRail}
          contentContainerStyle={[
            styles.thumbnailRail,
            compact && styles.compactRail,
          ]}
        >
          {featuredRemote ? (
            <LocalVideoTile
              name={localName}
              stream={
                localStream as {
                  toURL?: () => string;
                }
              }
              muted={localMuted}
              cameraOff={localCameraOff}
              compact
            />
          ) : null}

          {galleryRemoteStreams.map((remote) => {
            const participant = getParticipant(remote.userId);

            return (
              <RemoteVideoTile
                key={remote.producerId}
                remote={remote}
                compact
                muted={participant?.isMuted ?? false}
                cameraOff={
                  participant?.isCameraOff ?? false
                }
              />
            );
          })}
        </ScrollView>
      ) : null}

      {!fullScreen &&
      (featuredRemote || galleryRemoteStreams.length > 0) ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.thumbnailRail,
            compact && styles.compactRail,
          ]}
        >
          {featuredRemote ? (
            <LocalVideoTile
              name={localName}
              stream={
                localStream as {
                  toURL?: () => string;
                }
              }
              muted={localMuted}
              cameraOff={localCameraOff}
              compact
            />
          ) : null}

          {galleryRemoteStreams.map((remote) => {
            const participant = getParticipant(remote.userId);

            return (
              <RemoteVideoTile
                key={remote.producerId}
                remote={remote}
                compact
                muted={participant?.isMuted ?? false}
                cameraOff={
                  participant?.isCameraOff ?? false
                }
              />
            );
          })}
        </ScrollView>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: Spacing.three,
  },

  fullScreenRoot: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  participantsPill: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  participantCount: {
    fontSize: 12,
    fontWeight: "800",
  },

  stage: {
    width: "100%",
    minHeight: 292,
    borderRadius: Radius.xLarge,
    overflow: "hidden",
  },

  fullScreenStage: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },

  presenterLabel: {
    position: "absolute",
    top: Spacing.three,
    left: Spacing.three,
    minHeight: 28,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    backgroundColor: "rgba(2, 6, 24, 0.66)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  presenterDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  presenterText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  thumbnailRail: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingRight: Spacing.four,
  },

  fullScreenRail: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 120,
  },

  compactRail: {
    gap: Spacing.one,
  },

  empty: {
    minHeight: 286,
    borderWidth: 1,
    borderRadius: Radius.xLarge,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.six,
  },

  emptyFullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.six,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCopyWrap: {
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.three,
  },

  emptyTitle: {
    textAlign: "center",
  },

  emptyCopy: {
    maxWidth: 286,
    textAlign: "center",
    lineHeight: 19,
  },

  previewSecurePill: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  previewSecureText: {
    fontSize: 11,
    fontWeight: "800",
  },
});