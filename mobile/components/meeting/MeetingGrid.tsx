import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Video } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/constants/theme";
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
};

export function MeetingGrid({
  localStream,
  localName,
  localMuted = false,
  localCameraOff = false,
  remoteStreams,
  participants,
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
        (stream) =>
          stream.producerId !== featuredRemote.producerId,
      )
    : remoteStreams;

  const featuredIsRemote = Boolean(featuredRemote);
  const totalTiles = remoteStreams.length + 1;

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
  }, [
    opacity,
    translateY,
    remoteStreams.length,
  ]);

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
          styles.empty,
          {
            backgroundColor: colors.surfaceStrong,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Video color={colors.primary} size={22} />
        </View>

        <AppText variant="bodyStrong">Camera preview</AppText>

        <AppText
          variant="caption"
          tone="muted"
          style={styles.emptyCopy}
        >
          Connect your camera and microphone to preview your feed.
        </AppText>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.header}>
        <AppText variant="caption" tone="muted">
          Participants
        </AppText>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: colors.success + "18" },
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
            style={[
              styles.statusText,
              { color: colors.success },
            ]}
          >
            {totalTiles}
          </AppText>
        </View>
      </View>

      <View style={styles.stage}>
        {featuredIsRemote && featuredRemote ? (
          <RemoteVideoTile
            remote={featuredRemote}
            featured
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
            stream={localStream}
            muted={localMuted}
            cameraOff={localCameraOff}
            featured
          />
        )}
      </View>

      {remainingRemoteStreams.length > 0 || featuredIsRemote ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
            const participant = getParticipant(
              remote.userId,
            );

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

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  statusPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  statusText: {
    fontWeight: "800",
  },

  stage: {
    width: "100%",
    minHeight: 290,
    borderRadius: 22,
    overflow: "hidden",
  },

  thumbnailRail: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },

  compactRail: {
    gap: Spacing.one,
  },

  empty: {
    minHeight: 230,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.five,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },

  emptyCopy: {
    maxWidth: 260,
    textAlign: "center",
  },
});