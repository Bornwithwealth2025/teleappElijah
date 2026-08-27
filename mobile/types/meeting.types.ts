export type MeetingMediaKind = "audio" | "video";

export type MeetingTransportDirection = "send" | "recv";

export type MeetingStatus =
  | "idle"
  | "joining"
  | "waiting"
  | "joined"
  | "leaving"
  | "error";

export type WaitingRoomStatus =
  | "idle"
  | "requesting"
  | "pending"
  | "approved"
  | "declined";

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

export type WaitingRoomRequest = {
  requestId: string;
  roomId: string;
  userId: string;
  userName: string;
  requestedAt: string;
};

export type WaitingRoomAccessResponse = {
  success: boolean;
  status?: "host" | "pending" | "approved";
  requestId?: string;
  hostIsConnected?: boolean;
  code?: string;
  message?: string;
};

export type WaitingRoomDecisionPayload = {
  requestId: string;
  roomId: string;
  status: "approved" | "declined";
  message?: string;
};

export type WaitingRoomAdmitAllResponse = {
  success: boolean;
  approvedRequestIds?: string[];
  approvedCount?: number;
  remainingCount?: number;
  code?: string;
  message?: string;
};

export type BackendMeetingParticipant = {
  userId: string;
  userName: string;
  socketId?: string;
  micOn?: boolean;
  cameraOn?: boolean;
  isHost?: boolean;
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
  micOn?: boolean;
  cameraOn?: boolean;
};

export type JoinMeetingResponse = {
  success: boolean;
  roomId?: string;
  userId?: string;
  userName?: string;
  rtpCapabilities: AnyRecord;
  isHost: boolean;
  participants?: BackendMeetingParticipant[];
  billing?: AnyRecord;
  error?: string;
};

export type TransportCreatedPayload = {
  transportParams: AnyRecord;
  direction: MeetingTransportDirection;
  error?: string;
};

export type ConsumedPayload = {
  success?: boolean;
  producerId: string;
  consumer: {
    id: string;
    producerId?: string;
    kind: MeetingMediaKind;
    rtpParameters: AnyRecord;
    appData?: AnyRecord;
  };
  appData?: AnyRecord;
  error?: string;
};

export type MeetingMediaStatePayload = {
  userId: string;
  userName?: string;
  micOn?: boolean;
  cameraOn?: boolean;
  isMicMuted?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  cameraOff?: boolean;
};

export type MeetingHandStatePayload = {
  roomId?: string;
  userId: string;
  userName?: string;
  handup?: boolean;
  raised?: boolean;
  isHandRaised?: boolean;
};

export type MeetingParticipantJoinedPayload = {
  userId: string;
  userName: string;
  micOn?: boolean;
  cameraOn?: boolean;
  isHost?: boolean;
};

export type MeetingUserLeftPayload = {
  userId: string;
};

export type MeetingMessageEditedPayload = {
  messageId: string;
  newMessage: string;
};

export type MeetingMessageDeletedPayload = {
  messageId: string;
};