import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

import { BASE_URL, STORAGE_KEYS } from "@/api/client";

type AckResponse<T> = T & {
  error?: string;
  success?: boolean;
};

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? BASE_URL.replace("/api/v2", "");

let socket: Socket | null = null;

export async function getConfMeetingSocket() {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

  socket = io(`${SOCKET_URL}/conf_meeting`, {
    transports: ["websocket"],
    autoConnect: false,
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
    timeout: 12000,
  });

  socket.connect();

  return socket;
}

export function getActiveConfMeetingSocket() {
  return socket;
}

export function disconnectConfMeetingSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export async function emitWithAck<TResponse = unknown, TPayload = unknown>(
  event: string,
  payload?: TPayload,
  timeoutMs = 15000
): Promise<TResponse> {
  const activeSocket = await getConfMeetingSocket();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${event} timed out`));
    }, timeoutMs);

    activeSocket.emit(event, payload, (response: AckResponse<TResponse>) => {
      clearTimeout(timer);

      if (response?.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response as TResponse);
    });
  });
}

export async function emitFireAndForget<TPayload = unknown>(
  event: string,
  payload?: TPayload
): Promise<void> {
  const activeSocket = await getConfMeetingSocket();
  activeSocket.emit(event, payload);
}

export const ConfMeetingSocketCommands = {
  join: <TResponse,>(payload: unknown) =>
    emitWithAck<TResponse>("join", payload),

  createTransport: (payload: { direction: "send" | "recv" }) =>
    emitFireAndForget("create-transport", payload),

  connectTransport: (payload: {
    transportId: string;
    dtlsParameters: Record<string, unknown>;
  }) => emitWithAck<{ success: boolean }>("connect-transport", payload),

  produce: (payload: {
    transportId: string;
    kind: "audio" | "video";
    rtpParameters: Record<string, unknown>;
    appData?: Record<string, unknown>;
  }) => emitWithAck<{ producerId: string }>("transport-produce", payload),

  consume: (payload: {
    transportId: string;
    producerId: string;
    rtpCapabilities: Record<string, unknown>;
    appData?: Record<string, unknown>;
  }) => emitWithAck<{ success: boolean }>("consume", payload),

  resumeConsume: (payload: { consumerId: string; userId: string }) =>
    emitFireAndForget("resume-consume", payload),

  saveRtpCapabilities: (payload: { rtpCapabilities: Record<string, unknown> }) =>
    emitFireAndForget("save-rtp-capabilities", payload),

  leave: (payload: { roomId: string; userId: string }) =>
    emitFireAndForget("leave", payload),

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

  raiseHand: (payload: { userId: string; handup: boolean }) =>
    emitFireAndForget("raise-hand", payload),

  muteAll: (payload: { roomId: string; userId: string; mute: boolean }) =>
    emitFireAndForget("mute-all", payload),

  toggleMic: (payload: { userId: string; isMicMuted: boolean }) =>
    emitFireAndForget("user-toggle-mic", payload),

  toggleCamera: (payload: { userId: string; isCameraOff: boolean }) =>
    emitFireAndForget("user-toggle-camera", payload),
};