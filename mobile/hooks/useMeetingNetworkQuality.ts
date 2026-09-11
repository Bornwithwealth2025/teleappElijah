import { useEffect } from "react";

import {
  startNetworkQualityMonitoring,
} from "@/services/networkQuality.service";
import useMeetingStore from "@/store/meetingStore";

export function useMeetingNetworkQuality(enabled: boolean) {
  const setNetworkQuality = useMeetingStore(
    (state) => state.setNetworkQuality,
  );

  useEffect(() => {
    if (!enabled) return;

    return startNetworkQualityMonitoring(setNetworkQuality);
  }, [enabled, setNetworkQuality]);
}