import { Platform } from "react-native";
import { Device } from "mediasoup-client";

import {
  ConfMeetingSocketCommands,
  getActiveConfMeetingSocket,
} from "@/services/confMeetingSocket";
import {
  AnyRecord,
  ConsumedPayload,
  MeetingTransportDirection,
  TransportCreatedPayload,
} from "@/types/meeting.types";

let device: Device | null = null;
let sendTransport: any = null;
let recvTransport: any = null;
let localStream: any = null;
let pendingTransportResolvers: Array<(payload: TransportCreatedPayload) => void> = [];
let pendingConsumedResolvers: Array<(payload: ConsumedPayload) => void> = [];

function getDevice() {
  if (!device) device = new Device();
  return device;
}

async function getReactNativeWebrtc() {
  if (Platform.OS === "web") return null;

  const webrtc = await import("react-native-webrtc");
  webrtc.registerGlobals?.();

  return webrtc;
}

function waitForTransportCreated(direction: MeetingTransportDirection) {
  return new Promise<TransportCreatedPayload>((resolve) => {
    const socket = getActiveConfMeetingSocket();

    const handler = (payload: TransportCreatedPayload) => {
      if (payload.direction !== direction) return;

      socket?.off("transport-created", handler);
      resolve(payload);
    };

    socket?.on("transport-created", handler);
    pendingTransportResolvers.push(resolve);
  });
}

function waitForConsumed(producerId: string) {
  return new Promise<ConsumedPayload>((resolve) => {
    const socket = getActiveConfMeetingSocket();

    const handler = (payload: ConsumedPayload) => {
      if (payload.producerId !== producerId) return;

      socket?.off("consumed", handler);
      resolve(payload);
    };

    socket?.on("consumed", handler);
    pendingConsumedResolvers.push(resolve);
  });
}

const MediasoupClient = {
  loadDevice: async (routerRtpCapabilities: AnyRecord) => {
    const activeDevice = getDevice();

    if (!activeDevice.loaded) {
      await activeDevice.load({
        routerRtpCapabilities: routerRtpCapabilities as any,
      });
    }

    return activeDevice;
  },

  getRtpCapabilities: () => {
    return getDevice().rtpCapabilities as AnyRecord;
  },

  createSendTransport: async () => {
    const activeDevice = getDevice();

    const pendingTransport = waitForTransportCreated("send");
    await ConfMeetingSocketCommands.createTransport({ direction: "send" });
    const response = await pendingTransport;

    const transport = activeDevice.createSendTransport(
      response.transportParams as any
    );

    transport.on("connect", async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await ConfMeetingSocketCommands.connectTransport({
          transportId: transport.id,
          dtlsParameters,
        });
        callback();
      } catch (error) {
        errback(error);
      }
    });

    transport.on("produce", async ({ kind, rtpParameters, appData }: any, callback: any, errback: any) => {
      try {
        const response = await ConfMeetingSocketCommands.produce({
          transportId: transport.id,
          kind,
          rtpParameters,
          appData,
        });

        callback({ id: response.producerId });
      } catch (error) {
        errback(error);
      }
    });

    sendTransport = transport;
    return transport;
  },

  createRecvTransport: async () => {
    const activeDevice = getDevice();

    const pendingTransport = waitForTransportCreated("recv");
    await ConfMeetingSocketCommands.createTransport({ direction: "recv" });
    const response = await pendingTransport;

    const transport = activeDevice.createRecvTransport(
      response.transportParams as any
    );

    transport.on("connect", async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await ConfMeetingSocketCommands.connectTransport({
          transportId: transport.id,
          dtlsParameters,
        });
        callback();
      } catch (error) {
        errback(error);
      }
    });

    recvTransport = transport;
    return transport;
  },

  getLocalStream: async () => {
    if (localStream) return localStream;

    const webrtc = await getReactNativeWebrtc();

    if (!webrtc?.mediaDevices) {
      throw new Error(
        "Camera and microphone require a native Expo dev build."
      );
    }

    localStream = await webrtc.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: "user",
        width: 640,
        height: 480,
        frameRate: 24,
      },
    });

    return localStream;
  },

  produceAudio: async (appData: AnyRecord) => {
    const transport = sendTransport ?? (await MediasoupClient.createSendTransport());
    const stream = await MediasoupClient.getLocalStream();
    const track = stream.getAudioTracks()[0];

    if (!track) return null;

    return transport.produce({
      track,
      appData: {
        ...appData,
        source: "mic",
        isScreen: false,
      },
    });
  },

  produceVideo: async (appData: AnyRecord) => {
    const transport = sendTransport ?? (await MediasoupClient.createSendTransport());
    const stream = await MediasoupClient.getLocalStream();
    const track = stream.getVideoTracks()[0];

    if (!track) return null;

    return transport.produce({
      track,
      appData: {
        ...appData,
        source: "camera",
        isScreen: false,
      },
    });
  },

  consume: async (producerId: string, appData: AnyRecord = {}) => {
    const activeDevice = getDevice();
    const transport = recvTransport ?? (await MediasoupClient.createRecvTransport());

    const pendingConsumed = waitForConsumed(producerId);

    await ConfMeetingSocketCommands.consume({
      transportId: transport.id,
      producerId,
      rtpCapabilities: activeDevice.rtpCapabilities as AnyRecord,
      appData,
    });

    const response = await pendingConsumed;

    const consumer = await transport.consume({
      id: response.consumer.id,
      producerId,
      kind: response.consumer.kind,
      rtpParameters: response.consumer.rtpParameters,
      appData: response.consumer.appData ?? response.appData ?? {},
    });

    const webrtc = await getReactNativeWebrtc();

    const stream =
      webrtc?.MediaStream && consumer.track
        ? new webrtc.MediaStream([consumer.track])
        : null;

    await ConfMeetingSocketCommands.resumeConsume({
      consumerId: consumer.id,
      userId: String(appData.userId ?? ""),
    });

    return {
      consumer,
      stream,
      info: response,
    };
  },

  setTrackEnabled: (kind: "audio" | "video", enabled: boolean) => {
    if (!localStream) return;

    const tracks =
      kind === "audio"
        ? localStream.getAudioTracks()
        : localStream.getVideoTracks();

    tracks.forEach((track: any) => {
      track.enabled = enabled;
    });
  },

  cleanup: () => {
    pendingTransportResolvers = [];
    pendingConsumedResolvers = [];

    sendTransport?.close?.();
    recvTransport?.close?.();

    localStream?.getTracks?.().forEach((track: any) => track.stop());

    sendTransport = null;
    recvTransport = null;
    localStream = null;
    device = null;
  },
};

export default MediasoupClient;