import React from "react";
import * as Haptics from "expo-haptics";

import {
  getActiveConfMeetingSocket,
  getConfMeetingSocket,
} from "@/services/confMeetingSocket";
import useMeetingStore from "@/store/meetingStore";
import useRecordingStore from "@/store/recordingStore";

import type {
  MeetingMessage,
  MeetingProducerInfo,
  WaitingRoomDecisionPayload,
  WaitingRoomRequest,
} from "@/types/meeting.types";

import type {
  RecordingFailedPayload,
  RecordingStartedPayload,
  RecordingStoppedPayload,
} from "@/types/recording.types";

type ProducerPayload = MeetingProducerInfo | MeetingProducerInfo[];

function normalizeProducers(payload: ProducerPayload) {
  return Array.isArray(payload) ? payload : [payload];
}

export function useConfMeetingSocketEvents() {
  const consumeProducer = useMeetingStore((state) => state.consumeProducer);
  const addProducer = useMeetingStore((state) => state.addProducer);
  const upsertParticipant = useMeetingStore((state) => state.upsertParticipant);
  const removeParticipant = useMeetingStore((state) => state.removeParticipant);
  const upsertMessage = useMeetingStore((state) => state.upsertMessage);
  const markMessageEdited = useMeetingStore((state) => state.markMessageEdited);
  const removeMessage = useMeetingStore((state) => state.removeMessage);
  const applyHostMuteAll = useMeetingStore((state) => state.applyHostMuteAll);

  const receiveWaitingRoomRequest = useMeetingStore(
    (state) => state.receiveWaitingRoomRequest,
  );
  const syncWaitingRoomRequests = useMeetingStore(
    (state) => state.syncWaitingRoomRequests,
  );
  const resolveWaitingRoomRequest = useMeetingStore(
    (state) => state.resolveWaitingRoomRequest,
  );
  const handleWaitingRoomDecision = useMeetingStore(
    (state) => state.handleWaitingRoomDecision,
  );

  const setRecordingStarted = useRecordingStore(
    (state) => state.setRecordingStarted,
  );
  const setRecordingStopped = useRecordingStore(
    (state) => state.setRecordingStopped,
  );
  const setRecordingFailed = useRecordingStore(
    (state) => state.setRecordingFailed,
  );

  React.useEffect(() => {
    let cancelled = false;

    let attachedSocket: NonNullable<
      ReturnType<typeof getActiveConfMeetingSocket>
    > | null = null;

    const handleProducer = async (payload: ProducerPayload) => {
      const producers = normalizeProducers(payload);

      await Promise.all(
        producers
          .filter(
            (producer) => producer && typeof producer.producerId === "string",
          )
          .map(async (producer) => {
            addProducer(producer);

            try {
              await consumeProducer(producer);
            } catch (error) {
              console.warn("Unable to consume meeting producer:", error);
            }
          }),
      );
    };

    const handleParticipantJoined = (payload: {
      userId: string;
      userName?: string;
      micOn?: boolean;
      cameraOn?: boolean;
      isHost?: boolean;
    }) => {
      if (!payload?.userId) return;

      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: payload.userName ?? "Participant",
        isMuted: payload.micOn === false,
        isCameraOff: payload.cameraOn === false,
        isHost: payload.isHost,
      });
    };

    const handleUserLeft = (payload: { userId: string }) => {
      if (payload?.userId) {
        removeParticipant(payload.userId);
      }
    };

    const handleMicToggled = (payload: {
      userId: string;
      userName?: string;
      isMicMuted?: boolean;
      isMuted?: boolean;
      micOn?: boolean;
    }) => {
      if (!payload?.userId) return;

      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: payload.userName ?? "",
        isMuted:
          payload.isMicMuted ?? payload.isMuted ?? payload.micOn === false,
      });
    };

    const handleCameraToggled = (payload: {
      userId: string;
      userName?: string;
      isCameraOff?: boolean;
      cameraOff?: boolean;
      cameraOn?: boolean;
    }) => {
      if (!payload?.userId) return;

      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: payload.userName ?? "",
        isCameraOff:
          payload.isCameraOff ??
          payload.cameraOff ??
          payload.cameraOn === false,
      });
    };

    const handleParticipantMediaState = (payload: {
      userId: string;
      userName?: string;
      micOn?: boolean;
      cameraOn?: boolean;
      isMicMuted?: boolean;
      isMuted?: boolean;
      isCameraOff?: boolean;
      cameraOff?: boolean;
    }) => {
      if (!payload?.userId) return;

      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: payload.userName ?? "",
        isMuted:
          payload.isMicMuted ?? payload.isMuted ?? payload.micOn === false,
        isCameraOff:
          payload.isCameraOff ??
          payload.cameraOff ??
          payload.cameraOn === false,
      });
    };

    const handleHandStateChanged = (payload: {
      userId: string;
      userName?: string;
      handup?: boolean;
      raised?: boolean;
      isHandRaised?: boolean;
    }) => {
      if (!payload?.userId) return;

      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: payload.userName ?? "",
        isHandRaised:
          payload.isHandRaised ?? payload.handup ?? payload.raised ?? false,
      });
    };

    const handleMessage = (message: MeetingMessage) => {
      if (message?.messageId) {
        upsertMessage(message);
      }
    };

    const handleMessageEdited = (payload: {
      messageId: string;
      newMessage: string;
    }) => {
      if (payload?.messageId) {
        markMessageEdited(payload.messageId, payload.newMessage ?? "");
      }
    };

    const handleMessageDeleted = (payload: { messageId: string }) => {
      if (payload?.messageId) {
        removeMessage(payload.messageId);
      }
    };

    const handleWaitingRoomRequest = (payload: WaitingRoomRequest) => {
      if (!payload?.requestId || !payload?.roomId) {
        return;
      }

      receiveWaitingRoomRequest(payload);

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => undefined);
    };

    const handleWaitingRoomSync = (payload: {
      roomId: string;
      requests?: WaitingRoomRequest[];
    }) => {
      if (!payload?.roomId) return;

      syncWaitingRoomRequests(
        payload.roomId,
        Array.isArray(payload.requests) ? payload.requests : [],
      );
    };

    const handleWaitingRoomResolved = (payload: { requestId: string }) => {
      if (payload?.requestId) {
        resolveWaitingRoomRequest(payload.requestId);
      }
    };

    const handleWaitingDecision = (payload: WaitingRoomDecisionPayload) => {
      void handleWaitingRoomDecision(payload);
    };

    const handleRecordingStarted = (payload: RecordingStartedPayload) => {
      if (!payload?.recordingId || !payload?.roomId) {
        return;
      }

      setRecordingStarted({
        recordingId: payload.recordingId,
        roomId: payload.roomId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        startedAt: payload.startedAt,
      });
    };

    const handleRecordingStopped = (payload: RecordingStoppedPayload) => {
      if (!payload?.roomId) return;

      setRecordingStopped({
        recordingId: payload.recordingId ?? null,
        roomId: payload.roomId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        finalizing: payload.finalizing,
      });
    };

    const handleRecordingFailed = (payload: RecordingFailedPayload) => {
      setRecordingFailed(
        payload?.message ?? payload?.error ?? "Recording failed.",
      );
    };

    const handleMutedAll = (payload: {
      roomId?: string;
      byUserId?: string;
      mutedUserIds?: string[];
      mute?: boolean;
    }) => {
      if (!payload?.roomId || payload.mute !== true) {
        return;
      }

      void applyHostMuteAll(payload);
    };

    const attachListeners = (
      socket: NonNullable<ReturnType<typeof getActiveConfMeetingSocket>>,
    ) => {
      if (cancelled) return;

      attachedSocket = socket;

      socket.on("new-producer", handleProducer);
      socket.on("existing-producers", handleProducer);

      socket.on("participant-joined", handleParticipantJoined);
      socket.on("user-joined", handleParticipantJoined);

      socket.on("user-left", handleUserLeft);
      socket.on("participant-left", handleUserLeft);

      socket.on("user-mic-toggled", handleMicToggled);
      socket.on("user-camera-toggled", handleCameraToggled);
      socket.on("user-toggle-mic", handleMicToggled);
      socket.on("user-toggle-camera", handleCameraToggled);
      socket.on("muted-all", handleMutedAll);

      socket.on("participant-media-state", handleParticipantMediaState);
      socket.on("hand-state-changed", handleHandStateChanged);
      socket.on("raised-hand", handleHandStateChanged);

      socket.on("response-send-message", handleMessage);
      socket.on("response-edit-message", handleMessageEdited);
      socket.on("response-delete-message", handleMessageDeleted);

      socket.on("waiting-room:request", handleWaitingRoomRequest);
      socket.on("waiting-room:sync", handleWaitingRoomSync);
      socket.on("waiting-room:request-resolved", handleWaitingRoomResolved);
      socket.on("waiting-room:decision", handleWaitingDecision);

      socket.on("recording-started", handleRecordingStarted);
      socket.on("recording-stopped", handleRecordingStopped);
      socket.on("recording-failed", handleRecordingFailed);
    };

    void getConfMeetingSocket()
      .then(attachListeners)
      .catch(() => {
        // The meeting store reports connection failures.
      });

    return () => {
      cancelled = true;

      if (!attachedSocket) return;

      attachedSocket.off("new-producer", handleProducer);
      attachedSocket.off("existing-producers", handleProducer);

      attachedSocket.off("participant-joined", handleParticipantJoined);
      attachedSocket.off("user-joined", handleParticipantJoined);

      attachedSocket.off("user-left", handleUserLeft);
      attachedSocket.off("participant-left", handleUserLeft);

      attachedSocket.off("user-mic-toggled", handleMicToggled);
      attachedSocket.off("user-camera-toggled", handleCameraToggled);
      attachedSocket.off("user-toggle-mic", handleMicToggled);
      attachedSocket.off("user-toggle-camera", handleCameraToggled);
      attachedSocket.off("muted-all", handleMutedAll);

      attachedSocket.off(
        "participant-media-state",
        handleParticipantMediaState,
      );
      attachedSocket.off("hand-state-changed", handleHandStateChanged);
      attachedSocket.off("raised-hand", handleHandStateChanged);

      attachedSocket.off("response-send-message", handleMessage);
      attachedSocket.off("response-edit-message", handleMessageEdited);
      attachedSocket.off("response-delete-message", handleMessageDeleted);

      attachedSocket.off("waiting-room:request", handleWaitingRoomRequest);
      attachedSocket.off("waiting-room:sync", handleWaitingRoomSync);
      attachedSocket.off(
        "waiting-room:request-resolved",
        handleWaitingRoomResolved,
      );
      attachedSocket.off("waiting-room:decision", handleWaitingDecision);

      attachedSocket.off("recording-started", handleRecordingStarted);
      attachedSocket.off("recording-stopped", handleRecordingStopped);
      attachedSocket.off("recording-failed", handleRecordingFailed);
    };
  }, [
    addProducer,
    applyHostMuteAll,
    consumeProducer,
    handleWaitingRoomDecision,
    markMessageEdited,
    receiveWaitingRoomRequest,
    removeMessage,
    removeParticipant,
    resolveWaitingRoomRequest,
    setRecordingFailed,
    setRecordingStarted,
    setRecordingStopped,
    syncWaitingRoomRequests,
    upsertMessage,
    upsertParticipant,
  ]);
}
