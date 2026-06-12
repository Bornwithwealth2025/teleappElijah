import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { MicOff, MonitorUp, VideoOff } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

type VideoTile = {
  id: string;
  name: string;
  stream?: unknown;
  isLocal?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isScreenShare?: boolean;
};

type MeetingVideoGridProps = {
  tiles: VideoTile[];
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

function NativeVideoView({ stream }: { stream?: any }) {
  const [RTCView, setRTCView] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadRtcView() {
      if (Platform.OS === "web") return;

      try {
        const webrtc = await import("react-native-webrtc");
        if (mounted) setRTCView(() => webrtc.RTCView);
      } catch {}
    }

    loadRtcView();

    return () => {
      mounted = false;
    };
  }, []);

  if (!RTCView || !stream?.toURL) return null;

  return (
    <RTCView
      streamURL={stream.toURL()}
      objectFit="cover"
      mirror
      style={StyleSheet.absoluteFill}
    />
  );
}

function VideoTileView({ tile, compact }: { tile: VideoTile; compact: boolean }) {
  const { colors } = useAppTheme();
  const showFallback = !tile.stream || tile.isCameraOff || Platform.OS === "web";

  return (
    <View
      style={[
        styles.tile,
        compact ? styles.tileCompact : undefined,
        { backgroundColor: colors.primarySoft },
      ]}
    >
      {!showFallback ? <NativeVideoView stream={tile.stream} /> : null}

      {showFallback ? (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <AppText variant="subtitle" style={styles.avatarText}>
            {getInitial(tile.name)}
          </AppText>
        </View>
      ) : null}

      {tile.isScreenShare ? (
        <View style={[styles.screenBadge, { backgroundColor: colors.card }]}>
          <MonitorUp color={colors.primary} size={14} />
          <AppText variant="caption" tone="primary" style={styles.badgeText}>
            Screen
          </AppText>
        </View>
      ) : null}

      <View style={[styles.nameBar, { backgroundColor: "rgba(15, 23, 42, 0.62)" }]}>
        <AppText numberOfLines={1} variant="caption" style={styles.nameText}>
          {tile.isLocal ? `${tile.name} (You)` : tile.name}
        </AppText>

        <View style={styles.statusIcons}>
          {tile.isMuted ? <MicOff color="#FFFFFF" size={14} /> : null}
          {tile.isCameraOff ? <VideoOff color="#FFFFFF" size={14} /> : null}
        </View>
      </View>
    </View>
  );
}

export function MeetingVideoGrid({ tiles }: MeetingVideoGridProps) {
  const { colors } = useAppTheme();

  if (tiles.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.primarySoft }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <AppText variant="subtitle" style={styles.avatarText}>
            T
          </AppText>
        </View>
        <AppText variant="bodyStrong" tone="primary" style={styles.emptyTitle}>
          Waiting for video
        </AppText>
        <AppText variant="caption" tone="primary" style={styles.emptyCopy}>
          Camera streams will appear here when the meeting starts.
        </AppText>
      </View>
    );
  }

  const compact = tiles.length > 1;

  return (
    <View style={styles.grid}>
      {tiles.slice(0, 4).map((tile) => (
        <VideoTileView key={tile.id} tile={tile} compact={compact} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  tile: {
    minHeight: 240,
    flexBasis: "100%",
    flexGrow: 1,
    borderRadius: Radius.large,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  tileCompact: {
    minHeight: 156,
    flexBasis: "48%",
  },
  empty: {
    minHeight: 220,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  emptyTitle: {
    marginTop: Spacing.three,
    textAlign: "center",
    fontWeight: "800",
  },
  emptyCopy: {
    marginTop: Spacing.one,
    textAlign: "center",
    maxWidth: 240,
    fontWeight: "700",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  nameBar: {
    position: "absolute",
    left: Spacing.two,
    right: Spacing.two,
    bottom: Spacing.two,
    minHeight: 34,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  nameText: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  screenBadge: {
    position: "absolute",
    top: Spacing.two,
    left: Spacing.two,
    minHeight: 28,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: {
    fontWeight: "800",
  },
});