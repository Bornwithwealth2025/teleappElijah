import React from "react";
import {
  AppState,
  type AppStateStatus,
} from "react-native";

import useMeetingStore from "@/store/meetingStore";

type Options = {
  enabled?: boolean;
  pauseMediaInBackground?: boolean;
};

export function useMeetingLifecycle({
  enabled = true,
  pauseMediaInBackground = true,
}: Options = {}) {
  const leaveMeeting = useMeetingStore(
    (state) => state.leaveMeeting,
  );
  const status = useMeetingStore(
    (state) => state.status,
  );
  const localStream = useMeetingStore(
    (state) => state.localStream,
  );

  const previousAppState =
    React.useRef<AppStateStatus>(
      AppState.currentState,
    );

  const statusRef = React.useRef(status);
  const leavingRef = React.useRef(false);

  React.useEffect(() => {
    statusRef.current = status;
  }, [status]);

  React.useEffect(() => {
    if (!enabled || !pauseMediaInBackground) {
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const previousState =
          previousAppState.current;

        previousAppState.current = nextState;

        if (!localStream) {
          return;
        }

        const enteringBackground =
          nextState === "background" ||
          nextState === "inactive";

        const returningToForeground =
          previousState !== "active" &&
          nextState === "active";

        const tracks =
          localStream.getTracks?.() ?? [];

        if (enteringBackground) {
          tracks.forEach((track: any) => {
            track.__telefyaWasEnabled =
              track.enabled;
            track.enabled = false;
          });
        }

        if (returningToForeground) {
          tracks.forEach((track: any) => {
            if (
              track.__telefyaWasEnabled !== undefined
            ) {
              track.enabled =
                track.__telefyaWasEnabled;
              delete track.__telefyaWasEnabled;
            }
          });
        }
      },
    );

    return () => subscription.remove();
  }, [
    enabled,
    localStream,
    pauseMediaInBackground,
  ]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    return () => {
      if (leavingRef.current) {
        return;
      }

      const currentStatus = statusRef.current;

      if (
        currentStatus === "idle" ||
        currentStatus === "leaving"
      ) {
        return;
      }

      leavingRef.current = true;
      void leaveMeeting();
    };
  }, [enabled, leaveMeeting]);

  return {
    isActive: status === "joined",
    isLeaving: status === "leaving",
  };
}