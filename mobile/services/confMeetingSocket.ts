import { io, Socket } from "socket.io-client";

import { authStorage, BASE_URL, STORAGE_KEYS } from "@/api/client";

type JsonRecord = Record<string, unknown>;

type AckResponse<T> = T & {
  success?: boolean;
  error?: string;
  message?: string;
};

type JoinPayload = {
  roomId: string;
  userId: string;
  userName: string;
  isHost?: boolean;
  isBot?: boolean;
  micOn?: boolean;
  cameraOn?: boolean;
};

const SOCKET_URL = (
  process.env.EXPO_PUBLIC_SOCKET_URL ?? BASE_URL.replace("/api/v2", "")
).replace(/\/+$/, "");

let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

function connectSocket(activeSocket: Socket) {
  return new Promise<Socket>((resolve, reject) => {
    let settled = false;

    const timeout = setTimeout(() => {
      finish();
      reject(new Error("Meeting server connection timed out."));
    }, 12000);

    const finish = () => {
      clearTimeout(timeout);
      activeSocket.off("connect", handleConnect);
      activeSocket.off("connect_error", handleConnectError);
    };

    const handleConnect = () => {
      if (settled) return;

      settled = true;
      finish();
      resolve(activeSocket);
    };

    const handleConnectError = (error: Error) => {
      if (settled) return;

      settled = true;
      finish();

      reject(
        new Error(
          error?.message ||
            "Unable to authenticate with the Telefya meeting server.",
        ),
      );
    };

    activeSocket.once("connect", handleConnect);
    activeSocket.once("connect_error", handleConnectError);
    activeSocket.connect();
  });
}

export async function getConfMeetingSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const token = await authStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("Please sign in before joining a meeting.");
  }

  if (!socket) {
    socket = io(`${SOCKET_URL}/conf_meeting`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      timeout: 12000,
    });
  } else {
    socket.auth = { token };
    socket.io.opts.extraHeaders = {
      Authorization: `Bearer ${token}`,
    };
  }

  connectionPromise = connectSocket(socket);

  try {
    return await connectionPromise;
  } catch (error) {
    socket?.disconnect();
    socket = null;
    throw error;
  } finally {
    connectionPromise = null;
  }
}

export function getActiveConfMeetingSocket() {
  return socket;
}

export function disconnectConfMeetingSocket() {
  connectionPromise = null;
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export async function emitWithAck<TResponse = unknown, TPayload = unknown>(
  event: string,
  payload?: TPayload,
  timeoutMs = 15000,
): Promise<TResponse> {
  const activeSocket = await getConfMeetingSocket();

  return new Promise<TResponse>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;

      settled = true;
      reject(new Error(`${event} timed out.`));
    }, timeoutMs);

    activeSocket.emit(event, payload, (response: AckResponse<TResponse>) => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);

      if (!response) {
        reject(new Error(`${event} returned no response.`));
        return;
      }

      if (response.error || response.success === false) {
        reject(
          new Error(response.error || response.message || `${event} failed.`),
        );
        return;
      }

      resolve(response as TResponse);
    });
  });
}

export async function emitFireAndForget<TPayload = unknown>(
  event: string,
  payload?: TPayload,
) {
  const activeSocket = await getConfMeetingSocket();
  activeSocket.emit(event, payload);
}

export const ConfMeetingSocketCommands = {
  join: <TResponse>(payload: JoinPayload) =>
    emitWithAck<TResponse, JoinPayload>("join", payload),

  requestWaitingRoomAccess: (payload: {
    roomId: string;
    userId: string;
    userName: string;
  }) =>
    emitWithAck<{
      success: boolean;
      status?: "host" | "pending" | "approved";
      requestId?: string;
      hostIsConnected?: boolean;
      code?: string;
      message?: string;
    }>("waiting-room:request", payload),

  respondToWaitingRoomRequest: (payload: {
    roomId: string;
    requestId: string;
    decision: "approve" | "decline";
  }) =>
    emitWithAck<{
      success: boolean;
      requestId?: string;
      status?: "approved" | "declined";
      message?: string;
    }>("waiting-room:respond", payload),

  admitAllWaitingParticipants: (payload: { roomId: string }) =>
    emitWithAck<{
      success: boolean;
      approvedRequestIds?: string[];
      approvedCount?: number;
      remainingCount?: number;
      code?: string;
      message?: string;
    }>("waiting-room:admit-all", payload),

  createTransport: (payload: { direction: "send" | "recv" }) =>
    emitWithAck("create-transport", payload),

  connectTransport: (payload: {
    transportId: string;
    dtlsParameters: JsonRecord;
  }) => emitWithAck<{ success: boolean }>("connect-transport", payload),

  produce: (payload: {
    transportId: string;
    kind: "audio" | "video";
    rtpParameters: JsonRecord;
    appData?: JsonRecord;
  }) => emitWithAck<{ producerId: string }>("transport-produce", payload),

  consume: (payload: {
    transportId: string;
    producerId: string;
    rtpCapabilities: JsonRecord;
    appData?: JsonRecord;
  }) => emitWithAck<{ success: boolean }>("consume", payload),

  resumeConsume: (payload: { consumerId: string }) =>
    emitWithAck<{ success: boolean }>("resume-consume", payload),

  saveRtpCapabilities: (payload: { rtpCapabilities: JsonRecord }) =>
    emitFireAndForget("save-rtp-capabilities", payload),

  leave: (payload: { roomId: string; userId: string }) =>
    emitWithAck<{ success: boolean }>("leave", payload),

  sendMessage: (payload: {
    roomId: string;
    message: string;
    time: string;
    userName: string;
    socketId: string;
    messageId: string;
  }) => emitFireAndForget("send-message", payload),

  editMessage: (payload: {
    roomId: string;
    messageId: string;
    newMessage: string;
    socketId: string;
  }) => emitFireAndForget("edit-message", payload),

  deleteMessage: (payload: { roomId: string; messageId: string }) =>
    emitFireAndForget("delete-message", payload),

  raiseHand: (payload: { roomId: string; userId: string; userName: string }) =>
    emitWithAck<{ success: boolean }>("raise-hand", payload),

  lowerHand: (payload: { roomId: string; userId: string; userName: string }) =>
    emitWithAck<{ success: boolean }>("lower-hand", payload),

  muteAll: (payload: { roomId: string }) =>
    emitWithAck<{
      success: boolean;
      mutedUserIds?: string[];
      message?: string;
    }>("mute-all", payload),

  toggleMic: (payload: { userId: string; isMicMuted: boolean }) =>
    emitFireAndForget("user-toggle-mic", payload),

  toggleCamera: (payload: { userId: string; isCameraOff: boolean }) =>
    emitFireAndForget("user-toggle-camera", payload),

  startRecording: (payload: { roomId: string }) =>
    emitWithAck<{
      success: boolean;
      data?: {
        recordingId: string;
        roomId: string;
        fileName?: string;
        mimeType?: string;
        startedAt?: string;
        alreadyRecording?: boolean;
      };
    }>("start-recording", payload),

  stopRecording: (payload: { roomId: string }) =>
    emitWithAck<{
      success: boolean;
      data?: {
        recordingId: string;
        roomId: string;
        fileName?: string;
        mimeType?: string;
        finalizing?: boolean;
      };
    }>("stop-recording", payload),
};