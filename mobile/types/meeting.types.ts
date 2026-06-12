export type MeetingMediaKind = "audio" | "video";
export type MeetingTransportDirection = "send" | "recv";
export type MeetingStatus = "idle" | "joining" | "joined" | "leaving" | "error";

export type AnyRecord = Record<string, unknown>;

export type MeetingParticipant = {
  id: string;
  userId: string;
  name: string;
  socketId?: string;
  isHost?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
};

export type MeetingMessage = {
  roomId: string;
  messageId: string;
  message: string;
  time: string;
  userName: string;
  socketId?: string;
  userId?: string;
  edited?: boolean;
};

export type MeetingProducerInfo = {
  producerId: string;
  kind: MeetingMediaKind;
  userId?: string;
  userName?: string;
  isScreen?: boolean;
  appData?: AnyRecord;
  screenSharingUser?: string | null;
};

export type JoinMeetingParams = {
  roomId: string;
  userId: string;
  userName: string;
  isHost?: boolean;
  isBot?: boolean;
};

export type JoinMeetingResponse = {
  success: boolean;
  rtpCapabilities: AnyRecord;
  isHost: boolean;
};

export type TransportCreatedPayload = {
  transportParams: AnyRecord;
  direction: MeetingTransportDirection;
};

export type ConsumedPayload = {
  consumer: {
    id: string;
    kind: MeetingMediaKind;
    rtpParameters: AnyRecord;
    userId?: string;
    userName?: string;
    isScreen?: boolean;
    appData?: AnyRecord;
  };
  producerId: string;
  appData?: AnyRecord;
};