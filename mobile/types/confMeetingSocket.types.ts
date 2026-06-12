export type MediaKind = "audio" | "video";
export type TransportDirection = "send" | "recv";

export type JsonRecord = Record<string, unknown>;

export interface JoinRoomRequest {
  roomId: string;
  userId: string;
  userName: string;
}

export interface JoinRoomResponse {
  success: boolean;
  rtpCapabilities: JsonRecord;
  isHost: boolean;
}

export interface CreateTransportRequest {
  direction: TransportDirection;
}

export interface CreateTransportResponse {
  transportParams: JsonRecord;
  direction: string;
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
  id?: string;
  producerId?: string;
  [key: string]: unknown;
}

export interface ConsumeRequest {
  transportId: string;
  producerId: string;
  rtpCapabilities: JsonRecord;
  appData?: JsonRecord;
}

export interface ConsumeResponse {
  id?: string;
  consumerId?: string;
  producerId?: string;
  kind?: MediaKind;
  rtpParameters?: JsonRecord;
  [key: string]: unknown;
}

export interface LeaveRoomRequest {
  roomId: string;
  userId: string;
}

export interface ResumeConsumeRequest {
  consumerId: string;
  userId: string;
}

export interface ResumeConsumeResponse {
  consumerId: string;
}

export interface MuteAllRequest {
  roomId: string;
  userId: string;
  mute: boolean;
}

export interface RaiseHandRequest {
  userId: string;
  handup: boolean;
}

export interface StopMyScreenShareConsumerRequest {
  userId: string;
}

export interface StopMyScreenShareConsumerResponse {
  userId: string;
}

export interface StopScreenShareRequest {
  userId: string;
  screenProducerIds: string[];
}

export interface StopScreenShareResponse {
  userId: string;
  message: string;
}

export interface DisconnectResponse {
  userId: string;
  message: string;
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