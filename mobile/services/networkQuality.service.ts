import MediasoupClient from "@/services/mediasoupClient";

export type NetworkQualityLevel =
  | "unknown"
  | "good"
  | "fair"
  | "poor";

export type NetworkQualitySnapshot = {
  level: NetworkQualityLevel;
  label: string;
  roundTripTimeMs: number | null;
  jitterMs: number | null;
  packetLossPercent: number | null;
  bitrateKbps: number | null;
  updatedAt: number | null;
};

const UNKNOWN_QUALITY: NetworkQualitySnapshot = {
  level: "unknown",
  label: "Checking connection",
  roundTripTimeMs: null,
  jitterMs: null,
  packetLossPercent: null,
  bitrateKbps: null,
  updatedAt: null,
};

let previousBytes: number | null = null;
let previousSampleAt: number | null = null;

function average(values: number[]) {
  if (!values.length) return null;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number | null) {
  return value === null ? null : Math.round(value);
}

function getQualityLevel(input: {
  roundTripTimeMs: number | null;
  jitterMs: number | null;
  packetLossPercent: number | null;
}): NetworkQualityLevel {
  const { roundTripTimeMs, jitterMs, packetLossPercent } = input;

  if (
    roundTripTimeMs === null &&
    jitterMs === null &&
    packetLossPercent === null
  ) {
    return "unknown";
  }

  if (
    (packetLossPercent !== null && packetLossPercent > 8) ||
    (roundTripTimeMs !== null && roundTripTimeMs > 800) ||
    (jitterMs !== null && jitterMs > 80)
  ) {
    return "poor";
  }

  if (
    (packetLossPercent !== null && packetLossPercent > 3) ||
    (roundTripTimeMs !== null && roundTripTimeMs > 350) ||
    (jitterMs !== null && jitterMs > 40)
  ) {
    return "fair";
  }

  return "good";
}

function getQualityLabel(level: NetworkQualityLevel) {
  switch (level) {
    case "good":
      return "Good connection";
    case "fair":
      return "Fair connection";
    case "poor":
      return "Poor connection";
    default:
      return "Checking connection";
  }
}

async function sampleNetworkQuality(): Promise<NetworkQualitySnapshot> {
  const stats = await MediasoupClient.getTransportStats();

  if (!stats.length) {
    return UNKNOWN_QUALITY;
  }

  const rttValues: number[] = [];
  const jitterValues: number[] = [];
  let packetsLost = 0;
  let packetsReceived = 0;
  let totalBytes = 0;

  for (const stat of stats) {
    const type = String(stat?.type ?? "");

    if (type === "candidate-pair") {
      const rtt = Number(stat?.currentRoundTripTime);

      if (Number.isFinite(rtt) && rtt >= 0) {
        rttValues.push(rtt * 1000);
      }
    }

    if (type === "inbound-rtp") {
      const jitter = Number(stat?.jitter);

      if (Number.isFinite(jitter) && jitter >= 0) {
        jitterValues.push(jitter * 1000);
      }

      const lost = Number(stat?.packetsLost);
      const received = Number(stat?.packetsReceived);

      if (Number.isFinite(lost) && lost > 0) {
        packetsLost += lost;
      }

      if (Number.isFinite(received) && received > 0) {
        packetsReceived += received;
      }

      const bytes = Number(stat?.bytesReceived);

      if (Number.isFinite(bytes) && bytes > 0) {
        totalBytes += bytes;
      }
    }

    if (type === "outbound-rtp") {
      const bytes = Number(stat?.bytesSent);

      if (Number.isFinite(bytes) && bytes > 0) {
        totalBytes += bytes;
      }
    }
  }

  const now = Date.now();

  let bitrateKbps: number | null = null;

  if (
    previousBytes !== null &&
    previousSampleAt !== null &&
    totalBytes >= previousBytes
  ) {
    const elapsedSeconds = (now - previousSampleAt) / 1000;

    if (elapsedSeconds > 0) {
      bitrateKbps =
        ((totalBytes - previousBytes) * 8) /
        elapsedSeconds /
        1000;
    }
  }

  previousBytes = totalBytes;
  previousSampleAt = now;

  const roundTripTimeMs = round(average(rttValues));
  const jitterMs = round(average(jitterValues));
  const packetTotal = packetsLost + packetsReceived;

  const packetLossPercent =
    packetTotal > 0
      ? Math.round((packetsLost / packetTotal) * 1000) / 10
      : null;

  const level = getQualityLevel({
    roundTripTimeMs,
    jitterMs,
    packetLossPercent,
  });

  return {
    level,
    label: getQualityLabel(level),
    roundTripTimeMs,
    jitterMs,
    packetLossPercent,
    bitrateKbps: round(bitrateKbps),
    updatedAt: now,
  };
}

export function resetNetworkQualitySampler() {
  previousBytes = null;
  previousSampleAt = null;
}

export function startNetworkQualityMonitoring(
  onUpdate: (snapshot: NetworkQualitySnapshot) => void,
) {
  let disposed = false;
  let sampling = false;

  async function sample() {
    if (disposed || sampling) return;

    sampling = true;

    try {
      const snapshot = await sampleNetworkQuality();

      if (!disposed) {
        onUpdate(snapshot);
      }
    } catch {
      if (!disposed) {
        onUpdate(UNKNOWN_QUALITY);
      }
    } finally {
      sampling = false;
    }
  }

  resetNetworkQualitySampler();
  void sample();

  const interval = setInterval(() => {
    void sample();
  }, 5000);

  return () => {
    disposed = true;
    clearInterval(interval);
    resetNetworkQualitySampler();
  };
}