import { create } from "zustand";

import {
  ConfMeetingSocketCommands,
  disconnectConfMeetingSocket,
  getConfMeetingSocket,
} from "@/services/confMeetingSocket";
import MediasoupClient from "@/services/mediasoupClient";
import type {
  JoinMeetingParams,
  JoinMeetingResponse,
  MeetingMessage,
  MeetingParticipant,
  MeetingProducerInfo,
  MeetingStatus,
  WaitingRoomDecisionPayload,
  WaitingRoomRequest,
  WaitingRoomStatus,
} from "@/types/meeting.types";

export type RemoteStream = {
  id: string;
  producerId: string;
  userId?: string;
  userName?: string;
  stream: unknown;
  kind: "audio" | "video";
  isScreen?: boolean;
};

type BackendParticipant = {
  userId?: string;
  userName?: string;
  isHost?: boolean;
  micOn?: boolean;
  cameraOn?: boolean;
};

type ExtendedJoinResponse = JoinMeetingResponse & {
  participants?: BackendParticipant[];
};

type JoinPayload = JoinMeetingParams & {
  micOn?: boolean;
  cameraOn?: boolean;
  isBot?: boolean;
};

function createMessageId() {
  return `msg_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

function createInitialState() {
  return {
    status: "idle" as MeetingStatus,
    error: null as string | null,

    roomId: null as string | null,
    userId: null as string | null,
    userName: null as string | null,
    socketId: null as string | null,
    isHost: false,

    waitingRoomStatus: "idle" as WaitingRoomStatus,
    waitingRoomMessage: null as string | null,
    pendingJoinRequests: [] as WaitingRoomRequest[],
    isHandlingWaitingRoomAction: false,

    isMuted: false,
    isCameraOff: false,
    isHandRaised: false,
    isScreenSharing: false,

    participants: [] as MeetingParticipant[],
    messages: [] as MeetingMessage[],
    producers: [] as MeetingProducerInfo[],

    localStream: null as any,
    remoteStreams: [] as RemoteStream[],
    screenShareStream: null as any,
  };
}

type MeetingState = ReturnType<typeof createInitialState>;

type MeetingStore = MeetingState & {
  joinMeeting: (params: JoinMeetingParams) => Promise<void>;
  requestMeetingAccess: (params: JoinMeetingParams) => Promise<void>;
  leaveMeeting: () => Promise<void>;

  startLocalMedia: () => Promise<void>;
  consumeProducer: (producer: MeetingProducerInfo) => Promise<void>;

  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleHand: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  muteAllParticipants: () => Promise<void>;
  applyHostMuteAll: (payload: {
    roomId?: string;
    byUserId?: string;
    mutedUserIds?: string[];
    mute?: boolean;
  }) => Promise<void>;

  sendMessage: (message: string) => Promise<void>;
  editMessage: (
    messageId: string,
    newMessage: string,
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  respondToWaitingRoomRequest: (
    requestId: string,
    decision: "approve" | "decline",
  ) => Promise<void>;
  admitAllWaitingParticipants: () => Promise<void>;
  receiveWaitingRoomRequest: (
    request: WaitingRoomRequest,
  ) => void;
  syncWaitingRoomRequests: (
    roomId: string,
    requests: WaitingRoomRequest[],
  ) => void;
  resolveWaitingRoomRequest: (
    requestId: string,
  ) => void;
  handleWaitingRoomDecision: (
    payload: WaitingRoomDecisionPayload,
  ) => Promise<void>;

  setLocalStream: (stream: unknown | null) => void;
  addRemoteStream: (stream: RemoteStream) => void;
  removeRemoteStreamsByUser: (userId: string) => void;
  removeRemoteStreamByProducer: (producerId: string) => void;

  addProducer: (producer: MeetingProducerInfo) => void;
  upsertParticipant: (
    participant: MeetingParticipant,
  ) => void;
  removeParticipant: (userId: string) => void;

  upsertMessage: (message: MeetingMessage) => void;
  markMessageEdited: (
    messageId: string,
    newMessage: string,
  ) => void;
  removeMessage: (messageId: string) => void;

  resetMeeting: () => void;
};

function mapBackendParticipant(
  participant: BackendParticipant,
): MeetingParticipant | null {
  const userId = String(participant.userId ?? "").trim();

  if (!userId) return null;

  return {
    id: userId,
    userId,
    name: participant.userName ?? "Participant",
    isHost: Boolean(participant.isHost),
    isMuted: participant.micOn === false,
    isCameraOff: participant.cameraOn === false,
    isHandRaised: false,
    isScreenSharing: false,
  };
}

const useMeetingStore = create<MeetingStore>((set, get) => ({
  ...createInitialState(),

  joinMeeting: async ({
    roomId,
    userId,
    userName,
    isHost,
    isBot,
  }) => {
    if (!roomId || !userId || !userName) {
      set({
        status: "error",
        error: "Meeting room information is incomplete.",
      });
      return;
    }

    set({
      ...createInitialState(),
      status: "joining",
      roomId,
      userId,
      userName,
      isHost: Boolean(isHost),
    });

    try {
      const socket = await getConfMeetingSocket();

      const joined = (await ConfMeetingSocketCommands.join({
        roomId,
        userId,
        userName,
        isHost,
        isBot,
        micOn: true,
        cameraOn: true,
      } as JoinPayload)) as ExtendedJoinResponse;

      if (!joined?.success) {
        throw new Error(
          joined?.error || "Unable to join the meeting room.",
        );
      }

      await MediasoupClient.loadDevice(
        joined.rtpCapabilities,
      );

      await ConfMeetingSocketCommands.saveRtpCapabilities({
        rtpCapabilities: MediasoupClient.getRtpCapabilities(),
      });

      await MediasoupClient.createRecvTransport();

      const backendParticipants = (joined.participants ?? [])
        .map(mapBackendParticipant)
        .filter(Boolean) as MeetingParticipant[];

      const currentUser: MeetingParticipant = {
        id: userId,
        userId,
        name: userName,
        socketId: socket.id ?? "",
        isHost: Boolean(joined.isHost),
        isMuted: false,
        isCameraOff: false,
        isHandRaised: false,
        isScreenSharing: false,
      };

      const hasCurrentUser = backendParticipants.some(
        (participant) => participant.userId === userId,
      );

      set({
        status: "joined",
        roomId,
        userId,
        userName,
        socketId: socket.id ?? null,
        isHost: Boolean(joined.isHost),
        waitingRoomStatus: "idle",
        waitingRoomMessage: null,
        participants: hasCurrentUser
          ? backendParticipants
          : [...backendParticipants, currentUser],
        error: null,
      });
    } catch (error) {
      MediasoupClient.cleanup();
      disconnectConfMeetingSocket();

      set({
        status: "error",
        error: getErrorMessage(
          error,
          "Unable to join meeting. Please try again.",
        ),
      });
    }
  },

  requestMeetingAccess: async ({
    roomId,
    userId,
    userName,
    isBot,
  }) => {
    if (!roomId || !userId || !userName) {
      set({
        status: "error",
        error: "Meeting room information is incomplete.",
      });
      return;
    }

    set({
      ...createInitialState(),
      roomId,
      userId,
      userName,
      status: "waiting",
      waitingRoomStatus: "requesting",
      waitingRoomMessage: "Requesting access to the meeting...",
      error: null,
    });

    try {
      const response =
        await ConfMeetingSocketCommands.requestWaitingRoomAccess({
          roomId,
          userId,
          userName,
        });

      if (response.status === "host" || response.status === "approved") {
        set({
          waitingRoomStatus: "approved",
          waitingRoomMessage:
            response.message || "Joining the meeting...",
          isHost: response.status === "host",
        });

        await get().joinMeeting({
          roomId,
          userId,
          userName,
          isHost: response.status === "host",
          isBot,
        });

        if (get().status === "joined") {
          await get().startLocalMedia();
        }

        return;
      }

      if (response.status === "pending") {
        set({
          status: "waiting",
          waitingRoomStatus: "pending",
          waitingRoomMessage:
            response.message ||
            "Waiting for the host to admit you.",
        });

        return;
      }

      throw new Error(
        response.message ||
          "Unable to request access to this meeting.",
      );
    } catch (error) {
      set({
        status: "error",
        waitingRoomStatus: "idle",
        waitingRoomMessage: null,
        error: getErrorMessage(
          error,
          "Unable to request access to this meeting.",
        ),
      });
    }
  },

  leaveMeeting: async () => {
    const { roomId, userId, status } = get();

    if (status === "idle") return;

    set({
      status: "leaving",
      error: null,
    });

    try {
      if (roomId && userId && status === "joined") {
        await ConfMeetingSocketCommands.leave({
          roomId,
          userId,
        });
      }
    } catch {
      // Cleanup still runs if the socket is unavailable.
    } finally {
      MediasoupClient.cleanup();
      disconnectConfMeetingSocket();
      set(createInitialState());
    }
  },

  startLocalMedia: async () => {
    const { userId, userName } = get();

    if (!userId || !userName) {
      throw new Error(
        "Join the meeting before starting media.",
      );
    }

    const stream = await MediasoupClient.getLocalStream();

    set({
      localStream: stream,
      error: null,
    });

    const appData = {
      userId,
      userName,
      isScreen: false,
    };

    try {
      await MediasoupClient.produceAudio(appData);
    } catch {
      // Video can still continue if microphone production fails.
    }

    try {
      await MediasoupClient.produceVideo(appData);
    } catch {
      // Audio can still continue if camera production fails.
    }
  },

  consumeProducer: async (producer) => {
    const { userId, userName } = get();

    if (!userId || producer.userId === userId) {
      return;
    }

    const alreadyConsumed = get().remoteStreams.some(
      (stream) =>
        stream.producerId === producer.producerId,
    );

    if (alreadyConsumed) return;

    get().addProducer(producer);

    try {
      const result = await MediasoupClient.consume(
        producer.producerId,
        {
          userId,
          userName,
        },
      );

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
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to receive participant media.",
        ),
      });
    }
  },

  toggleMute: async () => {
    const { userId, isMuted } = get();

    if (!userId) return;

    const nextMuted = !isMuted;

    try {
      MediasoupClient.setTrackEnabled(
        "audio",
        !nextMuted,
      );

      await ConfMeetingSocketCommands.toggleMic({
        userId,
        isMicMuted: nextMuted,
      });

      set((state) => ({
        isMuted: nextMuted,
        participants: state.participants.map(
          (participant) =>
            participant.userId === userId
              ? {
                  ...participant,
                  isMuted: nextMuted,
                }
              : participant,
        ),
      }));
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to update microphone.",
        ),
      });
    }
  },

  toggleCamera: async () => {
    const { userId, isCameraOff } = get();

    if (!userId) return;

    const nextCameraOff = !isCameraOff;

    try {
      MediasoupClient.setTrackEnabled(
        "video",
        !nextCameraOff,
      );

      await ConfMeetingSocketCommands.toggleCamera({
        userId,
        isCameraOff: nextCameraOff,
      });

      set((state) => ({
        isCameraOff: nextCameraOff,
        participants: state.participants.map(
          (participant) =>
            participant.userId === userId
              ? {
                  ...participant,
                  isCameraOff: nextCameraOff,
                }
              : participant,
        ),
      }));
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to update camera.",
        ),
      });
    }
  },

  toggleHand: async () => {
    const {
      roomId,
      userId,
      userName,
      isHandRaised,
    } = get();

    if (!roomId || !userId || !userName) {
      return;
    }

    const nextHandState = !isHandRaised;

    try {
      if (nextHandState) {
        await ConfMeetingSocketCommands.raiseHand({
          roomId,
          userId,
          userName,
        });
      } else {
        await ConfMeetingSocketCommands.lowerHand({
          roomId,
          userId,
          userName,
        });
      }

      set((state) => ({
        isHandRaised: nextHandState,
        participants: state.participants.map(
          (participant) =>
            participant.userId === userId
              ? {
                  ...participant,
                  isHandRaised: nextHandState,
                }
              : participant,
        ),
      }));
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to update hand state.",
        ),
      });
    }
  },

  toggleScreenShare: async () => {
    const {
      userId,
      userName,
      isScreenSharing,
    } = get();

    if (!userId || !userName) {
      return;
    }

    try {
      if (isScreenSharing) {
        await MediasoupClient.stopScreenShare();

        set((state) => ({
          isScreenSharing: false,
          screenShareStream: null,
          participants: state.participants.map(
            (participant) =>
              participant.userId === userId
                ? {
                    ...participant,
                    isScreenSharing: false,
                  }
                : participant,
          ),
        }));

        return;
      }

      const result =
        await MediasoupClient.startScreenShare({
          userId,
          userName,
        });

      set((state) => ({
        isScreenSharing: true,
        screenShareStream: result.stream,
        participants: state.participants.map(
          (participant) =>
            participant.userId === userId
              ? {
                  ...participant,
                  isScreenSharing: true,
                }
              : participant,
        ),
        error: null,
      }));
    } catch (error) {
      set({
        isScreenSharing: false,
        screenShareStream: null,
        error: getErrorMessage(
          error,
          "Unable to start screen sharing.",
        ),
      });
    }
  },

  muteAllParticipants: async () => {
    const { roomId, isHost } = get();

    if (!roomId || !isHost) {
      return;
    }

    try {
      await ConfMeetingSocketCommands.muteAll({
        roomId,
      });
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to mute all participants.",
        ),
      });
    }
  },

  applyHostMuteAll: async (payload) => {
    const { roomId, userId } = get();

    if (
      !payload?.mute ||
      !roomId ||
      payload.roomId !== roomId ||
      !userId
    ) {
      return;
    }

    const mutedUserIds = new Set(payload.mutedUserIds ?? []);
    const shouldMuteCurrentUser = mutedUserIds.has(userId);

    if (shouldMuteCurrentUser) {
      try {
        MediasoupClient.setTrackEnabled("audio", false);

        await ConfMeetingSocketCommands.toggleMic({
          userId,
          isMicMuted: true,
        });
      } catch {
        // The UI state still updates from the host event.
      }
    }

    set((state) => ({
      isMuted: shouldMuteCurrentUser ? true : state.isMuted,
      participants: state.participants.map((participant) =>
        mutedUserIds.has(participant.userId)
          ? { ...participant, isMuted: true }
          : participant,
      ),
    }));
  },

  sendMessage: async (message) => {
    const {
      roomId,
      userName,
      socketId,
    } = get();

    const trimmedMessage = message.trim();

    if (
      !roomId ||
      !userName ||
      !socketId ||
      !trimmedMessage
    ) {
      return;
    }

    await ConfMeetingSocketCommands.sendMessage({
      roomId,
      message: trimmedMessage,
      time: new Date().toISOString(),
      userName,
      socketId,
      messageId: createMessageId(),
    });
  },

  editMessage: async (
    messageId,
    newMessage,
  ) => {
    const { roomId, socketId } = get();
    const trimmedMessage = newMessage.trim();

    if (
      !roomId ||
      !socketId ||
      !messageId ||
      !trimmedMessage
    ) {
      return;
    }

    await ConfMeetingSocketCommands.editMessage({
      roomId,
      messageId,
      newMessage: trimmedMessage,
      socketId,
    });
  },

  deleteMessage: async (messageId) => {
    const { roomId } = get();

    if (!roomId || !messageId) return;

    await ConfMeetingSocketCommands.deleteMessage({
      roomId,
      messageId,
    });
  },

  respondToWaitingRoomRequest: async (
    requestId,
    decision,
  ) => {
    const { roomId, isHost } = get();

    if (!roomId || !isHost || !requestId) {
      return;
    }

    set({
      isHandlingWaitingRoomAction: true,
      error: null,
    });

    try {
      await ConfMeetingSocketCommands.respondToWaitingRoomRequest({
        roomId,
        requestId,
        decision,
      });

      get().resolveWaitingRoomRequest(requestId);
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to update this join request.",
        ),
      });
    } finally {
      set({
        isHandlingWaitingRoomAction: false,
      });
    }
  },

  admitAllWaitingParticipants: async () => {
    const { roomId, isHost, pendingJoinRequests } = get();

    if (!roomId || !isHost || !pendingJoinRequests.length) {
      return;
    }

    set({
      isHandlingWaitingRoomAction: true,
      error: null,
    });

    try {
      const response =
        await ConfMeetingSocketCommands.admitAllWaitingParticipants({
          roomId,
        });

      const approvedIds = new Set(
        response.approvedRequestIds ?? [],
      );

      set((state) => ({
        pendingJoinRequests:
          approvedIds.size > 0
            ? state.pendingJoinRequests.filter(
                (request) =>
                  !approvedIds.has(request.requestId),
              )
            : state.pendingJoinRequests,
      }));

      if (response.remainingCount && response.remainingCount > 0) {
        set({
          error:
            response.message ||
            "Some participants remain in the waiting room.",
        });
      }
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Unable to admit waiting participants.",
        ),
      });
    } finally {
      set({
        isHandlingWaitingRoomAction: false,
      });
    }
  },

  receiveWaitingRoomRequest: (request) => {
    if (!request?.requestId || !request?.roomId) {
      return;
    }

    set((state) => {
      if (
        !state.isHost ||
        state.roomId !== request.roomId
      ) {
        return state;
      }

      const exists = state.pendingJoinRequests.some(
        (item) => item.requestId === request.requestId,
      );

      return {
        pendingJoinRequests: exists
          ? state.pendingJoinRequests.map((item) =>
              item.requestId === request.requestId
                ? request
                : item,
            )
          : [...state.pendingJoinRequests, request],
      };
    });
  },

  syncWaitingRoomRequests: (roomId, requests) => {
    set((state) => {
      if (!state.isHost || state.roomId !== roomId) {
        return state;
      }

      return {
        pendingJoinRequests: requests
          .filter(
            (request) =>
              request?.requestId &&
              request.roomId === roomId,
          )
          .sort(
            (first, second) =>
              new Date(first.requestedAt).getTime() -
              new Date(second.requestedAt).getTime(),
          ),
      };
    });
  },

  resolveWaitingRoomRequest: (requestId) => {
    if (!requestId) return;

    set((state) => ({
      pendingJoinRequests: state.pendingJoinRequests.filter(
        (request) => request.requestId !== requestId,
      ),
    }));
  },

  handleWaitingRoomDecision: async (payload) => {
    const {
      roomId,
      userId,
      userName,
      status,
    } = get();

    if (
      !payload?.requestId ||
      !payload?.status ||
      payload.roomId !== roomId
    ) {
      return;
    }

    if (payload.status === "declined") {
      set({
        status: "waiting",
        waitingRoomStatus: "declined",
        waitingRoomMessage:
          payload.message ||
          "The host declined your request to join.",
      });

      return;
    }

    if (
      !roomId ||
      !userId ||
      !userName ||
      status !== "waiting"
    ) {
      return;
    }

    set({
      waitingRoomStatus: "approved",
      waitingRoomMessage:
        payload.message || "Joining the meeting...",
      error: null,
    });

    await get().joinMeeting({
      roomId,
      userId,
      userName,
      isHost: false,
    });

    if (get().status === "joined") {
      try {
        await get().startLocalMedia();
      } catch (error) {
        set({
          error: getErrorMessage(
            error,
            "You joined the meeting, but camera access is unavailable.",
          ),
        });
      }
    }
  },

  setLocalStream: (stream) => {
    set({
      localStream: stream,
    });
  },

  addRemoteStream: (remoteStream) => {
    set((state) => {
      const exists = state.remoteStreams.some(
        (item) =>
          item.producerId === remoteStream.producerId,
      );

      const nextStreams = exists
        ? state.remoteStreams.map((item) =>
            item.producerId === remoteStream.producerId
              ? remoteStream
              : item,
          )
        : [...state.remoteStreams, remoteStream];

      return {
        remoteStreams: nextStreams,
        screenShareStream: remoteStream.isScreen
          ? remoteStream.stream
          : state.screenShareStream,
        participants:
          remoteStream.userId && remoteStream.isScreen
            ? state.participants.map(
                (participant) =>
                  participant.userId === remoteStream.userId
                    ? {
                        ...participant,
                        isScreenSharing: true,
                      }
                    : participant,
              )
            : state.participants,
      };
    });
  },

  removeRemoteStreamsByUser: (userId) => {
    set((state) => ({
      remoteStreams: state.remoteStreams.filter(
        (stream) => stream.userId !== userId,
      ),
      screenShareStream: state.remoteStreams.some(
        (stream) =>
          stream.userId === userId && stream.isScreen,
      )
        ? null
        : state.screenShareStream,
      participants: state.participants.map(
        (participant) =>
          participant.userId === userId
            ? {
                ...participant,
                isScreenSharing: false,
              }
            : participant,
      ),
    }));
  },

  removeRemoteStreamByProducer: (producerId) => {
    set((state) => {
      const removed = state.remoteStreams.find(
        (stream) =>
          stream.producerId === producerId,
      );

      return {
        remoteStreams: state.remoteStreams.filter(
          (stream) =>
            stream.producerId !== producerId,
        ),
        screenShareStream: removed?.isScreen
          ? null
          : state.screenShareStream,
        participants:
          removed?.isScreen && removed.userId
            ? state.participants.map(
                (participant) =>
                  participant.userId === removed.userId
                    ? {
                        ...participant,
                        isScreenSharing: false,
                      }
                    : participant,
              )
            : state.participants,
      };
    });
  },

  addProducer: (producer) => {
    set((state) => {
      const exists = state.producers.some(
        (item) =>
          item.producerId === producer.producerId,
      );

      return exists
        ? state
        : {
            producers: [
              ...state.producers,
              producer,
            ],
          };
    });
  },

  upsertParticipant: (participant) => {
    set((state) => {
      const exists = state.participants.some(
        (item) =>
          item.userId === participant.userId
      );

      return {
        participants: exists
          ? state.participants.map((item) =>
              item.userId === participant.userId
                ? {
                    ...item,
                    ...participant,
                  }
                : item,
            )
          : [
              ...state.participants,
              participant,
            ],
      };
    });
  },

  removeParticipant: (userId) => {
    get().removeRemoteStreamsByUser(userId);

    set((state) => ({
      participants: state.participants.filter(
        (participant) =>
          participant.userId !== userId,
      ),
      producers: state.producers.filter(
        (producer) =>
          producer.userId !== userId,
      ),
    }));
  },

  upsertMessage: (message) => {
    set((state) => {
      const exists = state.messages.some(
        (item) =>
          item.messageId === message.messageId,
      );

      return {
        messages: exists
          ? state.messages.map((item) =>
              item.messageId === message.messageId
                ? {
                    ...item,
                    ...message,
                  }
                : item,
            )
          : [
              ...state.messages,
              message,
            ],
      };
    });
  },

  markMessageEdited: (
    messageId,
    newMessage,
  ) => {
    set((state) => ({
      messages: state.messages.map(
        (message) =>
          message.messageId === messageId
            ? {
                ...message,
                message: newMessage,
                edited: true,
              }
            : message,
      ),
    }));
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter(
        (message) =>
          message.messageId !== messageId,
      ),
    }));
  },

  resetMeeting: () => {
    set(createInitialState());
  },
}));

export default useMeetingStore;