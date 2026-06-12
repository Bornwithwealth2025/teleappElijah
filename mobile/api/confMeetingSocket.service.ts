import apiClient from "@/api/client";
import {
  BasicSocketResponse,
  ConnectTransportRequest,
  ConsumeRequest,
  ConsumeResponse,
  CreateTransportRequest,
  CreateTransportResponse,
  DeleteMessageRequest,
  DeleteMessageResponse,
  DisconnectResponse,
  EditMessageRequest,
  EditMessageResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  LeaveRoomRequest,
  MuteAllRequest,
  ProduceRequest,
  ProduceResponse,
  RaiseHandRequest,
  ResumeConsumeRequest,
  ResumeConsumeResponse,
  SaveRtpCapabilitiesRequest,
  SendMessageRequest,
  SendMessageResponse,
  StopMyScreenShareConsumerRequest,
  StopMyScreenShareConsumerResponse,
  StopScreenShareRequest,
  StopScreenShareResponse,
} from "@/types/confMeetingSocket.types";

const BASE_PATH = "/conf_meeting/socket";

const ConfMeetingSocketService = {
  join: async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
    const { data } = await apiClient.post<JoinRoomResponse>(
      `${BASE_PATH}/join`,
      payload
    );
    return data;
  },

  createTransport: async (
    payload: CreateTransportRequest
  ): Promise<CreateTransportResponse> => {
    const { data } = await apiClient.post<CreateTransportResponse>(
      `${BASE_PATH}/create-transport`,
      payload
    );
    return data;
  },

  connectTransport: async (
    payload: ConnectTransportRequest
  ): Promise<BasicSocketResponse> => {
    const { data } = await apiClient.post<BasicSocketResponse>(
      `${BASE_PATH}/connect-transport`,
      payload
    );
    return data;
  },

  produce: async (payload: ProduceRequest): Promise<ProduceResponse> => {
    const { data } = await apiClient.post<ProduceResponse>(
      `${BASE_PATH}/transport-produce`,
      payload
    );
    return data;
  },

  consume: async (payload: ConsumeRequest): Promise<ConsumeResponse> => {
    const { data } = await apiClient.post<ConsumeResponse>(
      `${BASE_PATH}/consume`,
      payload
    );
    return data;
  },

  leave: async (payload: LeaveRoomRequest): Promise<BasicSocketResponse> => {
    const { data } = await apiClient.post<BasicSocketResponse>(
      `${BASE_PATH}/leave`,
      payload
    );
    return data;
  },

  resumeConsume: async (
    payload: ResumeConsumeRequest
  ): Promise<ResumeConsumeResponse> => {
    const { data } = await apiClient.post<ResumeConsumeResponse>(
      `${BASE_PATH}/resume-consume`,
      payload
    );
    return data;
  },

  muteAll: async (payload: MuteAllRequest): Promise<BasicSocketResponse> => {
    const { data } = await apiClient.post<BasicSocketResponse>(
      `${BASE_PATH}/mute-all`,
      payload
    );
    return data;
  },

  raiseHand: async (payload: RaiseHandRequest): Promise<BasicSocketResponse> => {
    const { data } = await apiClient.post<BasicSocketResponse>(
      `${BASE_PATH}/raise-hand`,
      payload
    );
    return data;
  },

  stopMyConsumerForScreenShare: async (
    payload: StopMyScreenShareConsumerRequest
  ): Promise<StopMyScreenShareConsumerResponse> => {
    const { data } = await apiClient.post<StopMyScreenShareConsumerResponse>(
      `${BASE_PATH}/stop-my-consumer-for-screen-share`,
      payload
    );
    return data;
  },

  stopScreenShare: async (
    payload: StopScreenShareRequest
  ): Promise<StopScreenShareResponse> => {
    const { data } = await apiClient.post<StopScreenShareResponse>(
      `${BASE_PATH}/stop-screen-share`,
      payload
    );
    return data;
  },

  disconnect: async (): Promise<DisconnectResponse> => {
    const { data } = await apiClient.post<DisconnectResponse>(
      `${BASE_PATH}/disconnect`
    );
    return data;
  },

  sendMessage: async (
    payload: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<SendMessageResponse>(
      `${BASE_PATH}/send-message`,
      payload
    );
    return data;
  },

  editMessage: async (
    payload: EditMessageRequest
  ): Promise<EditMessageResponse> => {
    const { data } = await apiClient.post<EditMessageResponse>(
      `${BASE_PATH}/edit-message`,
      payload
    );
    return data;
  },

  deleteMessage: async (
    payload: DeleteMessageRequest
  ): Promise<DeleteMessageResponse> => {
    const { data } = await apiClient.post<DeleteMessageResponse>(
      `${BASE_PATH}/delete-message`,
      payload
    );
    return data;
  },

  saveRtpCapabilities: async (
    payload: SaveRtpCapabilitiesRequest
  ): Promise<BasicSocketResponse> => {
    const { data } = await apiClient.post<BasicSocketResponse>(
      `${BASE_PATH}/save-rtp-capabilities`,
      payload
    );
    return data;
  },
};

export default ConfMeetingSocketService;