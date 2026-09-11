import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { BRAND_GRADIENT } from "@/components/ui/AppButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type { RemoteStream } from "@/store/meetingStore";
import type { MeetingParticipant } from "@/types/meeting.types";

import { LocalVideoTile } from "./LocalVideoTile";
import { RemoteVideoTile } from "./RemoteVideoTile";

type Props = {
  localStream?: any;
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

  const hasRemoteMedia = remoteStreams.length > 0;
  const hasMedia = Boolean(localStream) || hasRemoteMedia;
  const compact = width < 380;

  const featuredRemote =
    remoteStreams.find((stream) => stream.isScreen) ??
    remoteStreams.find((stream) => stream.kind === "video") ??
    remoteStreams[0] ??
    null;

  const remainingRemoteStreams = featuredRemote
    ? remoteStreams.filter(
        (stream) => stream.producerId !== featuredRemote.producerId,
      )
    : remoteStreams;

  const featuredIsRemote = Boolean(featuredRemote);
  const totalTiles = Math.max(participants.length, remoteStreams.length + 1);

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
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
  }, [opacity, remoteStreams.length, translateY]);

  function getParticipant(userId?: string) {
    return participants.find(
      (participant) => participant.userId === userId,
    );
  }

  if (!hasMedia) {
    return (
      <View
        accessibilityLabel="Camera preview unavailable"
        style={[
          fullScreen ? styles.emptyFullScreen : styles.empty,
          {
            backgroundColor: colors.surfaceStrong,
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
          <Video color="#FFFFFF" size={24} />
        </LinearGradient>

        <AppText variant="bodyStrong">Camera preview unavailable</AppText>

        <AppText
          variant="caption"
          tone="muted"
          style={styles.emptyCopy}
        >
          Enable camera and microphone permissions to join with video.
        </AppText>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        fullScreen ? styles.fullScreenRoot : styles.root,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {!fullScreen ? (
        <View style={styles.header}>
          <AppText variant="caption" tone="muted">
            Participants
          </AppText>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${colors.success}18` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: colors.success },
              ]}
            />

            <AppText
              variant="caption"
              style={[styles.statusText, { color: colors.success }]}
            >
              {totalTiles}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={fullScreen ? styles.fullScreenStage : styles.stage}>
        {featuredIsRemote && featuredRemote ? (
          <RemoteVideoTile
            remote={featuredRemote}
            featured={!fullScreen}
            fill={fullScreen}
            muted={
              getParticipant(featuredRemote.userId)?.isMuted ?? false
            }
            cameraOff={
              getParticipant(featuredRemote.userId)?.isCameraOff ?? false
            }
          />
        ) : (
          <LocalVideoTile
            name={localName}
            stream={localStream}
            muted={localMuted}
            cameraOff={localCameraOff}
            featured={!fullScreen}
          />
        )}
      </View>

      {remainingRemoteStreams.length > 0 || featuredIsRemote ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={fullScreen ? styles.fullScreenRail : undefined}
          contentContainerStyle={[
            styles.thumbnailRail,
            compact && styles.compactRail,
          ]}
        >
          {featuredIsRemote ? (
            <LocalVideoTile
              name={localName}
              stream={localStream}
              muted={localMuted}
              cameraOff={localCameraOff}
              compact
            />
          ) : null}

          {remainingRemoteStreams.map((remote) => {
            const participant = getParticipant(remote.userId);

            return (
              <RemoteVideoTile
                key={remote.producerId}
                remote={remote}
                compact
                muted={participant?.isMuted ?? false}
                cameraOff={participant?.isCameraOff ?? false}
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
  },

  statusPill: {
    minHeight: 28,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },

  statusText: {
    fontWeight: "800",
  },

  stage: {
    width: "100%",
    minHeight: 290,
    borderRadius: Radius.xLarge,
    overflow: "hidden",
  },

  fullScreenStage: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },

  thumbnailRail: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },

  fullScreenRail: {
    position: "absolute",
    left: Spacing.three,
    right: 0,
    bottom: 112,
  },

  compactRail: {
    gap: Spacing.one,
  },

  empty: {
    minHeight: 230,
    borderWidth: 1,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.five,
  },

  emptyFullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.five,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCopy: {
    maxWidth: 280,
    textAlign: "center",
  },
});