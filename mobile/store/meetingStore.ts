import { create } from "zustand";

import {
  ConfMeetingSocketCommands,
  disconnectConfMeetingSocket,
  getConfMeetingSocket,
} from "@/services/confMeetingSocket";
import MediasoupClient from "@/services/mediasoupClient";
import {
  JoinMeetingParams,
  JoinMeetingResponse,
  MeetingMessage,
  MeetingParticipant,
  MeetingProducerInfo,
  MeetingStatus,
} from "@/types/meeting.types";

type RemoteStream = {
  id: string;
  producerId: string;
  userId?: string;
  userName?: string;
  stream: unknown;
  kind: "audio" | "video";
  isScreen?: boolean;
};

function createMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

type MeetingStore = {
  status: MeetingStatus;
  error: string | null;

  roomId: string | null;
  userId: string | null;
  userName: string | null;
  socketId: string | null;
  isHost: boolean;

  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;

  participants: MeetingParticipant[];
  messages: MeetingMessage[];
  producers: MeetingProducerInfo[];

  localStream: unknown | null;
  remoteStreams: RemoteStream[];
  screenShareStream: unknown | null;

  joinMeeting: (params: JoinMeetingParams) => Promise<void>;
  leaveMeeting: () => Promise<void>;

  startLocalMedia: () => Promise<void>;
  consumeProducer: (producer: MeetingProducerInfo) => Promise<void>;

  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleHand: () => Promise<void>;

  sendMessage: (message: string) => Promise<void>;
  editMessage: (messageId: string, newMessage: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  setLocalStream: (stream: unknown | null) => void;
  addRemoteStream: (payload: RemoteStream) => void;
  removeRemoteStreamsByUser: (userId: string) => void;
  removeRemoteStreamByProducer: (producerId: string) => void;

  addProducer: (producer: MeetingProducerInfo) => void;
  upsertParticipant: (participant: MeetingParticipant) => void;
  removeParticipant: (userId: string) => void;
  upsertMessage: (message: MeetingMessage) => void;
  markMessageEdited: (messageId: string, newMessage: string) => void;
  removeMessage: (messageId: string) => void;

  resetMeeting: () => void;
};

const initialState = {
  status: "idle" as MeetingStatus,
  error: null,

  roomId: null,
  userId: null,
  userName: null,
  socketId: null,
  isHost: false,

  isMuted: false,
  isCameraOff: false,
  isHandRaised: false,
  isScreenSharing: false,

  participants: [],
  messages: [],
  producers: [],

  localStream: null,
  remoteStreams: [],
  screenShareStream: null,
};

const useMeetingStore = create<MeetingStore>((set, get) => ({
  ...initialState,

  joinMeeting: async ({ roomId, userId, userName, isHost = true, isBot = false }) => {
    set({ status: "joining", error: null });

    try {
      const socket = await getConfMeetingSocket();

      const joined = await ConfMeetingSocketCommands.join<JoinMeetingResponse>({
        roomId,
        userId,
        userName,
        isHost,
        isBot,
      });

      await MediasoupClient.loadDevice(joined.rtpCapabilities);

      await ConfMeetingSocketCommands.saveRtpCapabilities({
        rtpCapabilities: MediasoupClient.getRtpCapabilities(),
      });

      set({
        status: "joined",
        roomId,
        userId,
        userName,
        socketId: socket.id,
        isHost: joined.isHost,
        participants: [
          {
            id: userId,
            userId,
            name: userName,
            socketId: socket.id,
            isHost: joined.isHost,
            isMuted: false,
            isCameraOff: false,
            isHandRaised: false,
            isScreenSharing: false,
          },
        ],
      });

      await MediasoupClient.createRecvTransport();
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Unable to join meeting. Please try again.",
      });
    }
  },

  leaveMeeting: async () => {
    const { roomId, userId } = get();

    if (!roomId || !userId) {
      get().resetMeeting();
      return;
    }

    set({ status: "leaving" });

    try {
      await ConfMeetingSocketCommands.leave({ roomId, userId });
    } finally {
      MediasoupClient.cleanup();
      disconnectConfMeetingSocket();
      get().resetMeeting();
    }
  },

  startLocalMedia: async () => {
    const { userId, userName } = get();

    if (!userId || !userName) return;

    const stream = await MediasoupClient.getLocalStream();
    get().setLocalStream(stream);

    const appData = {
      userId,
      userName,
      isScreen: false,
    };

    await MediasoupClient.produceAudio(appData);
    await MediasoupClient.produceVideo(appData);
  },

  consumeProducer: async (producer) => {
    const { userId, userName } = get();

    if (!userId || producer.userId === userId) return;

    get().addProducer(producer);

    const result = await MediasoupClient.consume(producer.producerId, {
      userId,
      userName,
    });

    if (!result.stream) return;

    get().addRemoteStream({
      id: result.consumer.id,
      producerId: producer.producerId,
      userId: producer.userId,
      userName: producer.userName,
      kind: producer.kind,
      isScreen: producer.isScreen,
      stream: result.stream,
    });
  },

  toggleMute: async () => {
    const { userId } = get();
    if (!userId) return;

    const nextMuted = !get().isMuted;

    MediasoupClient.setTrackEnabled("audio", !nextMuted);

    await ConfMeetingSocketCommands.toggleMic({
      userId,
      isMicMuted: nextMuted,
    });

    set((state) => ({
      isMuted: nextMuted,
      participants: state.participants.map((participant) =>
        participant.userId === userId
          ? { ...participant, isMuted: nextMuted }
          : participant
      ),
    }));
  },

  toggleCamera: async () => {
    const { userId } = get();
    if (!userId) return;

    const nextCameraOff = !get().isCameraOff;

    MediasoupClient.setTrackEnabled("video", !nextCameraOff);

    await ConfMeetingSocketCommands.toggleCamera({
      userId,
      isCameraOff: nextCameraOff,
    });

    set((state) => ({
      isCameraOff: nextCameraOff,
      participants: state.participants.map((participant) =>
        participant.userId === userId
          ? { ...participant, isCameraOff: nextCameraOff }
          : participant
      ),
    }));
  },

  toggleHand: async () => {
    const { userId } = get();
    if (!userId) return;

    const nextHandState = !get().isHandRaised;

    await ConfMeetingSocketCommands.raiseHand({
      userId,
      handup: nextHandState,
    });

    set((state) => ({
      isHandRaised: nextHandState,
      participants: state.participants.map((participant) =>
        participant.userId === userId
          ? { ...participant, isHandRaised: nextHandState }
          : participant
      ),
    }));
  },

  sendMessage: async (message: string) => {
    const { roomId, userName, socketId } = get();
    const trimmedMessage = message.trim();

    if (!roomId || !userName || !socketId || !trimmedMessage) return;

    await ConfMeetingSocketCommands.sendMessage({
      roomId,
      message: trimmedMessage,
      time: new Date().toISOString(),
      userName,
      socketId,
      messageId: createMessageId(),
    });
  },

  editMessage: async (messageId: string, newMessage: string) => {
    const { roomId, socketId } = get();
    const trimmedMessage = newMessage.trim();

    if (!roomId || !socketId || !trimmedMessage) return;

    await ConfMeetingSocketCommands.editMessage({
      roomId,
      messageId,
      newMessage: trimmedMessage,
      socketId,
    });
  },

  deleteMessage: async (messageId: string) => {
    const { roomId } = get();
    if (!roomId) return;

    await ConfMeetingSocketCommands.deleteMessage({
      roomId,
      messageId,
    });
  },

  setLocalStream: (stream) => {
    set({ localStream: stream });
  },

  addRemoteStream: (payload) => {
    set((state) => {
      const exists = state.remoteStreams.some(
        (item) => item.producerId === payload.producerId
      );

      return {
        remoteStreams: exists
          ? state.remoteStreams.map((item) =>
              item.producerId === payload.producerId ? payload : item
            )
          : [...state.remoteStreams, payload],
        screenShareStream: payload.isScreen
          ? payload.stream
          : state.screenShareStream,
      };
    });
  },

  removeRemoteStreamsByUser: (userId) => {
    set((state) => ({
      remoteStreams: state.remoteStreams.filter((item) => item.userId !== userId),
      screenShareStream: state.remoteStreams.some(
        (item) => item.userId === userId && item.isScreen
      )
        ? null
        : state.screenShareStream,
    }));
  },

  removeRemoteStreamByProducer: (producerId) => {
    set((state) => {
      const removed = state.remoteStreams.find(
        (item) => item.producerId === producerId
      );

      return {
        remoteStreams: state.remoteStreams.filter(
          (item) => item.producerId !== producerId
        ),
        screenShareStream: removed?.isScreen ? null : state.screenShareStream,
      };
    });
  },

  addProducer: (producer) => {
    set((state) => {
      const exists = state.producers.some(
        (item) => item.producerId === producer.producerId
      );

      return {
        producers: exists ? state.producers : [...state.producers, producer],
      };
    });
  },

  upsertParticipant: (participant) => {
    set((state) => {
      const exists = state.participants.some(
        (item) => item.userId === participant.userId
      );

      return {
        participants: exists
          ? state.participants.map((item) =>
              item.userId === participant.userId
                ? { ...item, ...participant }
                : item
            )
          : [...state.participants, participant],
      };
    });
  },

  removeParticipant: (userId) => {
    set((state) => ({
      participants: state.participants.filter((item) => item.userId !== userId),
      remoteStreams: state.remoteStreams.filter((item) => item.userId !== userId),
      screenShareStream: state.remoteStreams.some(
        (item) => item.userId === userId && item.isScreen
      )
        ? null
        : state.screenShareStream,
    }));
  },

  upsertMessage: (message) => {
    set((state) => {
      const exists = state.messages.some(
        (item) => item.messageId === message.messageId
      );

      return {
        messages: exists
          ? state.messages.map((item) =>
              item.messageId === message.messageId ? { ...item, ...message } : item
            )
          : [...state.messages, message],
      };
    });
  },

  markMessageEdited: (messageId, newMessage) => {
    set((state) => ({
      messages: state.messages.map((item) =>
        item.messageId === messageId
          ? { ...item, message: newMessage, edited: true }
          : item
      ),
    }));
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((item) => item.messageId !== messageId),
    }));
  },

  resetMeeting: () => {
    set(initialState);
  },
}));

export default useMeetingStore;