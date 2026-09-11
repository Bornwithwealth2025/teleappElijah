import apiClient from "@/api/client";
import type {
  NetworkQualitySnapshot,
} from "@/services/networkQuality.service";

export type MeetingTelemetryEventType =
  | "poor_network"
  | "meeting_join_failed"
  | "meeting_reconnected";

type ReportMeetingTelemetryInput = {
  roomId: string;
  eventType: MeetingTelemetryEventType;
  networkQuality?: NetworkQualitySnapshot;
  metadata?: Record<string, string | number | boolean | null>;
};

async function reportMeetingTelemetry({
  roomId,
  eventType,
  networkQuality,
  metadata,
}: ReportMeetingTelemetryInput) {
  const safeRoomId = roomId.trim();

  if (!safeRoomId) return;

  await apiClient.post("/user/meeting-telemetry", {
    roomId: safeRoomId,
    eventType,
    qualityLevel: networkQuality?.level ?? "unknown",
    roundTripTimeMs: networkQuality?.roundTripTimeMs ?? null,
    jitterMs: networkQuality?.jitterMs ?? null,
    packetLossPercent:
      networkQuality?.packetLossPercent ?? null,
    bitrateKbps: networkQuality?.bitrateKbps ?? null,
    metadata,
  });
}

const MeetingTelemetryService = {
  reportMeetingTelemetry,
};

export default MeetingTelemetryService;