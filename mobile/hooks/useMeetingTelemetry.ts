import { useEffect, useRef } from "react";

import MeetingTelemetryService from "@/api/meeting-telemetry.service";
import useMeetingStore from "@/store/meetingStore";

const POOR_NETWORK_REPORT_INTERVAL_MS = 5 * 60 * 1000;

export function useMeetingTelemetry(enabled: boolean) {
  const roomId = useMeetingStore((state) => state.roomId);
  const status = useMeetingStore((state) => state.status);
  const error = useMeetingStore((state) => state.error);
  const networkQuality = useMeetingStore(
    (state) => state.networkQuality,
  );

  const reportedJoinFailure = useRef(false);
  const lastPoorNetworkReportAt = useRef(0);

  useEffect(() => {
    if (!enabled) {
      reportedJoinFailure.current = false;
      lastPoorNetworkReportAt.current = 0;
      return;
    }

    if (
      status !== "error" ||
      !roomId ||
      reportedJoinFailure.current
    ) {
      return;
    }

    reportedJoinFailure.current = true;

    void MeetingTelemetryService.reportMeetingTelemetry({
      roomId,
      eventType: "meeting_join_failed",
      networkQuality,
      metadata: {
        reason: String(error ?? "unknown").slice(0, 180),
      },
    });
  }, [
    enabled,
    error,
    networkQuality,
    roomId,
    status,
  ]);

  useEffect(() => {
    if (
      !enabled ||
      !roomId ||
      networkQuality.level !== "poor"
    ) {
      return;
    }

    const now = Date.now();

    if (
      now - lastPoorNetworkReportAt.current <
      POOR_NETWORK_REPORT_INTERVAL_MS
    ) {
      return;
    }

    lastPoorNetworkReportAt.current = now;

    void MeetingTelemetryService.reportMeetingTelemetry({
      roomId,
      eventType: "poor_network",
      networkQuality,
    });
  }, [enabled, networkQuality, roomId]);
}