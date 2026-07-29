export type MediaKind = "audio" | "video";
export type TransportDirection = "send" | "recv";
export type JsonRecord = Record<string, unknown>;

export interface MeetingParticipant {
  userId: string;
  userName: string;
  micOn?: boolean;
  cameraOn?: boolean;
  isHost?: boolean;
}

export interface JoinRoomRequest {
  roomId: string;
  userId: string;
  userName: string;
  isHost?: boolean;
  isBot?: boolean;
  micOn?: boolean;
  cameraOn?: boolean;
}

export interface JoinRoomResponse {
  success: boolean;
  roomId: string;
  userId: string;
  userName: string;
  isHost: boolean;
  rtpCapabilities: JsonRecord;
  participants: MeetingParticipant[];
  billing?: JsonRecord;
  error?: string;
}

export interface CreateTransportRequest {
  direction: TransportDirection;
}

export interface CreateTransportResponse {
  success?: boolean;
  transportParams: JsonRecord;
  direction: TransportDirection;
  error?: string;
}

export interface ConnectTransportRequest {
  transportId: string;
  dtlsParameters: JsonRecord;
}

export interface ProduceRequest {
  transportId: string;
  kind: MediaKind;
  rtpParameters: JsonRecord;
  appData?: JsonRecord;
}

export interface ProduceResponse {
  success?: boolean;
  producerId: string;
  error?: string;
}

export interface ConsumeRequest {
  transportId: string;
  producerId: string;
  rtpCapabilities: JsonRecord;
  appData?: JsonRecord;
}

export interface ConsumeResponse {
  success?: boolean;
  producerId: string;
  consumer: {
    id: string;
    producerId: string;
    kind: MediaKind;
    rtpParameters: JsonRecord;
    appData?: JsonRecord;
  };
  appData?: JsonRecord;
  error?: string;
}

export interface LeaveRoomRequest {
  roomId?: string;
  userId?: string;
}

export interface ResumeConsumeRequest {
  consumerId: string;
}

export interface ResumeConsumeResponse {
  success?: boolean;
  consumerId: string;
  error?: string;
}

export interface MuteAllRequest {
  roomId: string;
  userId: string;
  mute: boolean;
}

export interface RaiseHandRequest {
  roomId: string;
  userId: string;
  userName: string;
}

export interface StopMyScreenShareConsumerRequest {
  userId: string;
}

export interface StopMyScreenShareConsumerResponse {
  userId: string;
  error?: string;
}

export interface StopScreenShareRequest {
  userId: string;
  screenProducerIds?: string[];
}

export interface StopScreenShareResponse {
  userId: string;
  message?: string;
  error?: string;
}

export interface SendMessageRequest {
  roomId: string;
  message: string;
  time: string;
  userName: string;
  socketId: string;
  messageId: string;
}

export interface SendMessageResponse extends SendMessageRequest {}

export interface EditMessageRequest {
  roomId: string;
  messageId: string;
  newMessage: string;
  socketId: string;
}

export interface EditMessageResponse extends EditMessageRequest {}

export interface DeleteMessageRequest {
  roomId: string;
  messageId: string;
}

export interface DeleteMessageResponse extends DeleteMessageRequest {}

export interface SaveRtpCapabilitiesRequest {
  rtpCapabilities: JsonRecord;
}

export interface BasicSocketResponse {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}