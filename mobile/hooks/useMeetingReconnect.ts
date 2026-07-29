import React from "react";

import { getConfMeetingSocket } from "@/services/confMeetingSocket";
import useMeetingStore from "@/store/meetingStore";

type Options = {
  enabled?: boolean;
  maxAttempts?: number;
};

export function useMeetingReconnect({
  enabled = true,
  maxAttempts = 5,
}: Options = {}) {
  const status = useMeetingStore((state) => state.status);
  const roomId = useMeetingStore((state) => state.roomId);
  const userId = useMeetingStore((state) => state.userId);
  const userName = useMeetingStore((state) => state.userName);
  const isHost = useMeetingStore((state) => state.isHost);
  const joinMeeting = useMeetingStore(
    (state) => state.joinMeeting,
  );

  const [reconnecting, setReconnecting] =
    React.useState(false);
  const [attempts, setAttempts] = React.useState(0);

  const statusRef = React.useRef(status);
  const roomIdRef = React.useRef(roomId);
  const userIdRef = React.useRef(userId);
  const userNameRef = React.useRef(userName);
  const isHostRef = React.useRef(isHost);

  const attemptsRef = React.useRef(0);
  const disposedRef = React.useRef(false);
  const retryTimerRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  React.useEffect(() => {
    statusRef.current = status;
  }, [status]);

  React.useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  React.useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  React.useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  React.useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    disposedRef.current = false;
    attemptsRef.current = 0;
    setAttempts(0);
    setReconnecting(false);

    let socket: any = null;
    let cleanupSocket: (() => void) | null = null;

    const clearRetry = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (disposedRef.current) {
        return;
      }

      if (
        statusRef.current !== "joined" &&
        statusRef.current !== "joining"
      ) {
        return;
      }

      if (
        !roomIdRef.current ||
        !userIdRef.current ||
        !userNameRef.current
      ) {
        return;
      }

      if (attemptsRef.current >= maxAttempts) {
        setReconnecting(false);
        return;
      }

      if (retryTimerRef.current) {
        return;
      }

      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);
      setReconnecting(true);

      const delay = Math.min(
        1000 * 2 ** (attemptsRef.current - 1),
        15000,
      );

      retryTimerRef.current = setTimeout(async () => {
        retryTimerRef.current = null;

        if (disposedRef.current) {
          return;
        }

        try {
          await joinMeeting({
            roomId: roomIdRef.current!,
            userId: userIdRef.current!,
            userName: userNameRef.current!,
            isHost: isHostRef.current,
          });

          if (
            useMeetingStore.getState().status === "joined"
          ) {
            attemptsRef.current = 0;
            setAttempts(0);
            setReconnecting(false);
          } else {
            scheduleReconnect();
          }
        } catch {
          scheduleReconnect();
        }
      }, delay);
    };

    const attach = async () => {
      try {
        socket = await getConfMeetingSocket();

        if (disposedRef.current || !socket) {
          return;
        }

        const handleConnect = () => {
          if (
            statusRef.current === "joined" ||
            statusRef.current === "joining"
          ) {
            scheduleReconnect();
          }
        };

        const handleDisconnect = () => {
          if (statusRef.current === "joined") {
            scheduleReconnect();
          }
        };

        const handleConnectError = () => {
          if (statusRef.current === "joined") {
            scheduleReconnect();
          }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        cleanupSocket = () => {
          socket?.off("connect", handleConnect);
          socket?.off("disconnect", handleDisconnect);
          socket?.off(
            "connect_error",
            handleConnectError,
          );
        };
      } catch {
        scheduleReconnect();
      }
    };

    void attach();

    return () => {
      disposedRef.current = true;
      clearRetry();
      cleanupSocket?.();
      setReconnecting(false);
    };
  }, [enabled, joinMeeting, maxAttempts]);

  return {
    reconnecting,
    attempts,
  };
}