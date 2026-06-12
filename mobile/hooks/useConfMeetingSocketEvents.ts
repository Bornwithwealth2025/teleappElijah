import React from "react";

import { getActiveConfMeetingSocket } from "@/services/confMeetingSocket";
import useMeetingStore from "@/store/meetingStore";
import {
  MeetingMessage,
  MeetingParticipant,
  MeetingProducerInfo,
} from "@/types/meeting.types";

export function useConfMeetingSocketEvents() {
  const consumeProducer = useMeetingStore((state) => state.consumeProducer);
  const addProducer = useMeetingStore((state) => state.addProducer);
  const upsertParticipant = useMeetingStore((state) => state.upsertParticipant);
  const removeParticipant = useMeetingStore((state) => state.removeParticipant);
  const upsertMessage = useMeetingStore((state) => state.upsertMessage);
  const markMessageEdited = useMeetingStore((state) => state.markMessageEdited);
  const removeMessage = useMeetingStore((state) => state.removeMessage);

  React.useEffect(() => {
    const socket = getActiveConfMeetingSocket();
    if (!socket) return;

    const handleNewProducer = async (producer: MeetingProducerInfo) => {
      addProducer(producer);

      try {
        await consumeProducer(producer);
      } catch {}
    };

    const handleExistingProducer = async (producer: MeetingProducerInfo) => {
      addProducer(producer);

      try {
        await consumeProducer(producer);
      } catch {}
    };

    const handleUserLeft = (payload: { userId: string }) => {
      removeParticipant(payload.userId);
    };

    const handleMicToggled = (payload: { userId: string; isMicMuted: boolean }) => {
      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: "",
        isMuted: payload.isMicMuted,
      });
    };

    const handleCameraToggled = (payload: {
      userId: string;
      isCameraOff: boolean;
    }) => {
      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: "",
        isCameraOff: payload.isCameraOff,
      });
    };

    const handleRaisedHand = (payload: {
      roomId: string;
      userId: string;
      handup: boolean;
    }) => {
      upsertParticipant({
        id: payload.userId,
        userId: payload.userId,
        name: "",
        isHandRaised: payload.handup,
      });
    };

    const handleMessage = (message: MeetingMessage) => {
      upsertMessage(message);
    };

    const handleMessageEdited = (payload: {
      messageId: string;
      newMessage: string;
    }) => {
      markMessageEdited(payload.messageId, payload.newMessage);
    };

    const handleMessageDeleted = (payload: { messageId: string }) => {
      removeMessage(payload.messageId);
    };

    socket.on("new-producer", handleNewProducer);
    socket.on("existing-producers", handleExistingProducer);
    socket.on("user-left", handleUserLeft);
    socket.on("user-mic-toggled", handleMicToggled);
    socket.on("user-camera-toggled", handleCameraToggled);
    socket.on("raised-hand", handleRaisedHand);
    socket.on("response-send-message", handleMessage);
    socket.on("response-edit-message", handleMessageEdited);
    socket.on("response-delete-message", handleMessageDeleted);

    return () => {
      socket.off("new-producer", handleNewProducer);
      socket.off("existing-producers", handleExistingProducer);
      socket.off("user-left", handleUserLeft);
      socket.off("user-mic-toggled", handleMicToggled);
      socket.off("user-camera-toggled", handleCameraToggled);
      socket.off("raised-hand", handleRaisedHand);
      socket.off("response-send-message", handleMessage);
      socket.off("response-edit-message", handleMessageEdited);
      socket.off("response-delete-message", handleMessageDeleted);
    };
  }, [
    addProducer,
    consumeProducer,
    markMessageEdited,
    removeMessage,
    removeParticipant,
    upsertMessage,
    upsertParticipant,
  ]);
}