import { Platform } from "react-native";
import { Device } from "mediasoup-client";

import {
  ConfMeetingSocketCommands,
  getActiveConfMeetingSocket,
} from "@/services/confMeetingSocket";
import type {
  AnyRecord,
  ConsumedPayload,
  MeetingTransportDirection,
  TransportCreatedPayload,
} from "@/types/meeting.types";

let device: Device | null = null;
let sendTransport: any = null;
let recvTransport: any = null;
let localStream: any = null;

let screenShareStream: any = null;
let screenShareProducer: any = null;

let creatingSendTransport: Promise<any> | null = null;
let creatingRecvTransport: Promise<any> | null = null;

function createDevice() {
  if (Platform.OS === "web") {
    return new Device();
  }

  try {
    return new Device({
      handlerName: "ReactNative106",
    });
  } catch {
    return new Device();
  }
}

function getDevice() {
  if (!device) {
    device = createDevice();
  }

  return device;
}

async function getReactNativeWebrtc() {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const webrtc = await import("react-native-webrtc");
    webrtc.registerGlobals?.();
    return webrtc;
  } catch {
    throw new Error(
      "Native WebRTC is unavailable. Rebuild the Expo development client.",
    );
  }
}

function getActiveSocket() {
  const socket = getActiveConfMeetingSocket();

  if (!socket?.connected) {
    throw new Error("Meeting socket is not connected.");
  }

  return socket;
}

function waitForTransportCreated(
  direction: MeetingTransportDirection,
  timeoutMs = 15000,
) {
  const socket = getActiveSocket();

  return new Promise<TransportCreatedPayload>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      socket.off("transport-created", handleTransport);
      socket.off("error", handleError);
    };

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };

    const timer = setTimeout(() => {
      finish(() => {
        reject(new Error(`Creating ${direction} transport timed out.`));
      });
    }, timeoutMs);

    const handleTransport = (
      payload: TransportCreatedPayload & {
        error?: string;
      },
    ) => {
      if (!payload || payload.direction !== direction) {
        return;
      }

      finish(() => {
        if (payload.error) {
          reject(new Error(payload.error));
        } else {
          resolve(payload);
        }
      });
    };

    const handleError = (payload: { action?: string; error?: string }) => {
      if (payload?.action !== "create-transport") {
        return;
      }

      finish(() => {
        reject(
          new Error(payload.error || "Unable to create meeting transport."),
        );
      });
    };

    socket.on("transport-created", handleTransport);
    socket.on("error", handleError);
  });
}

function waitForConsumed(producerId: string, timeoutMs = 15000) {
  const socket = getActiveSocket();

  return new Promise<ConsumedPayload>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      socket.off("consumed", handleConsumed);
      socket.off("error", handleError);
    };

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };

    const timer = setTimeout(() => {
      finish(() => {
        reject(new Error("Receiving participant media timed out."));
      });
    }, timeoutMs);

    const handleConsumed = (
      payload: ConsumedPayload & {
        error?: string;
      },
    ) => {
      if (!payload || payload.producerId !== producerId) {
        return;
      }

      finish(() => {
        if (payload.error) {
          reject(new Error(payload.error));
        } else {
          resolve(payload);
        }
      });
    };

    const handleError = (payload: { action?: string; error?: string }) => {
      if (payload?.action !== "consume") {
        return;
      }

      finish(() => {
        reject(
          new Error(payload.error || "Unable to receive participant media."),
        );
      });
    };

    socket.on("consumed", handleConsumed);
    socket.on("error", handleError);
  });
}

function attachTransportStateHandlers(transport: any) {
  transport.on("connectionstatechange", (state: string) => {
    if (state === "failed" || state === "closed") {
      transport.close?.();
    }
  });
}

const MediasoupClient = {
  loadDevice: async (routerRtpCapabilities: AnyRecord) => {
    if (!routerRtpCapabilities) {
      throw new Error("The meeting server did not provide RTP capabilities.");
    }

    if (Platform.OS !== "web") {
      await getReactNativeWebrtc();
    }

    const activeDevice = getDevice();

    if (!activeDevice.loaded) {
      await activeDevice.load({
        routerRtpCapabilities: routerRtpCapabilities as any,
      });
    }

    return activeDevice;
  },

  getRtpCapabilities: () => {
    const activeDevice = getDevice();

    if (!activeDevice.loaded) {
      throw new Error("Mediasoup device has not loaded.");
    }

    return activeDevice.rtpCapabilities as AnyRecord;
  },

  createSendTransport: async () => {
    if (sendTransport) {
      return sendTransport;
    }

    if (creatingSendTransport) {
      return creatingSendTransport;
    }

    creatingSendTransport = (async () => {
      const activeDevice = getDevice();
      const pendingTransport = waitForTransportCreated("send");

      await ConfMeetingSocketCommands.createTransport({
        direction: "send",
      });

      const response = await pendingTransport;

      if (!response?.transportParams) {
        throw new Error("The server returned invalid send transport data.");
      }

      const transport = activeDevice.createSendTransport(
        response.transportParams as any,
      );

      attachTransportStateHandlers(transport);

      transport.on(
        "connect",
        async ({ dtlsParameters }: any, callback: any, errback: any) => {
          try {
            await ConfMeetingSocketCommands.connectTransport({
              transportId: transport.id,
              dtlsParameters,
            });

            callback();
          } catch (error) {
            errback(error);
          }
        },
      );

      transport.on(
        "produce",
        async (
          { kind, rtpParameters, appData }: any,
          callback: any,
          errback: any,
        ) => {
          try {
            const response = await ConfMeetingSocketCommands.produce({
              transportId: transport.id,
              kind,
              rtpParameters,
              appData,
            });

            if (!response?.producerId) {
              throw new Error(
                "The meeting server did not return a producer ID.",
              );
            }

            callback({ id: response.producerId });
          } catch (error) {
            errback(error);
          }
        },
      );

      sendTransport = transport;
      return transport;
    })();

    try {
      return await creatingSendTransport;
    } catch (error) {
      sendTransport = null;
      throw error;
    } finally {
      creatingSendTransport = null;
    }
  },

  createRecvTransport: async () => {
    if (recvTransport) {
      return recvTransport;
    }

    if (creatingRecvTransport) {
      return creatingRecvTransport;
    }

    creatingRecvTransport = (async () => {
      const activeDevice = getDevice();
      const pendingTransport = waitForTransportCreated("recv");

      await ConfMeetingSocketCommands.createTransport({
        direction: "recv",
      });

      const response = await pendingTransport;

      if (!response?.transportParams) {
        throw new Error("The server returned invalid receive transport data.");
      }

      const transport = activeDevice.createRecvTransport(
        response.transportParams as any,
      );

      attachTransportStateHandlers(transport);

      transport.on(
        "connect",
        async ({ dtlsParameters }: any, callback: any, errback: any) => {
          try {
            await ConfMeetingSocketCommands.connectTransport({
              transportId: transport.id,
              dtlsParameters,
            });

            callback();
          } catch (error) {
            errback(error);
          }
        },
      );

      recvTransport = transport;
      return transport;
    })();

    try {
      return await creatingRecvTransport;
    } catch (error) {
      recvTransport = null;
      throw error;
    } finally {
      creatingRecvTransport = null;
    }
  },

  getLocalStream: async () => {
    if (localStream) {
      return localStream;
    }

    const webrtc = await getReactNativeWebrtc();

    if (!webrtc?.mediaDevices) {
      throw new Error(
        "Camera and microphone require a native Expo development build.",
      );
    }

    try {
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
    } catch {
      throw new Error("Camera or microphone permission was denied.");
    }
  },

  produceAudio: async (appData: AnyRecord) => {
    const transport =
      sendTransport || (await MediasoupClient.createSendTransport());

    const stream = await MediasoupClient.getLocalStream();

    const track = stream.getAudioTracks?.()?.[0];

    if (!track) {
      throw new Error("No microphone track is available.");
    }

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
    const transport =
      sendTransport || (await MediasoupClient.createSendTransport());

    const stream = await MediasoupClient.getLocalStream();

    const track = stream.getVideoTracks?.()?.[0];

    if (!track) {
      throw new Error("No camera track is available.");
    }

    return transport.produce({
      track,
      appData: {
        ...appData,
        source: "camera",
        isScreen: false,
      },
    });
  },

  startScreenShare: async (appData: AnyRecord = {}) => {
    const transport =
      sendTransport || (await MediasoupClient.createSendTransport());

    let stream: any = null;

    if (Platform.OS === "web") {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getDisplayMedia
      ) {
        throw new Error("Screen sharing is unavailable in this browser.");
      }

      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    } else {
      const webrtc = await getReactNativeWebrtc();
      const mediaDevices: any = webrtc?.mediaDevices;

      if (!mediaDevices?.getDisplayMedia) {
        throw new Error(
          "Screen sharing is unavailable in this Android development build.",
        );
      }

      stream = await mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    }

    const track = stream?.getVideoTracks?.()?.[0];

    if (!track) {
      stream?.getTracks?.().forEach((item: any) => {
        item.stop?.();
      });

      throw new Error("No screen-share video track is available.");
    }

    const producer = await transport.produce({
      track,
      appData: {
        ...appData,
        source: "screen",
        isScreen: true,
      },
    });

    screenShareStream = stream;
    screenShareProducer = producer;

    track.addEventListener?.("ended", () => {
      void MediasoupClient.stopScreenShare();
    });

    return {
      stream,
      producer,
    };
  },

  stopScreenShare: async () => {
    try {
      screenShareProducer?.close?.();
    } finally {
      screenShareStream?.getTracks?.().forEach((track: any) => {
        track.stop?.();
      });

      screenShareProducer = null;
      screenShareStream = null;
    }
  },

  isScreenSharing: () => {
    return Boolean(screenShareProducer);
  },

  getScreenShareStream: () => {
    return screenShareStream;
  },

  consume: async (producerId: string, appData: AnyRecord = {}) => {
    if (!producerId) {
      throw new Error("Producer ID is required.");
    }

    const activeDevice = getDevice();

    if (!activeDevice.loaded) {
      throw new Error("Mediasoup device has not loaded.");
    }

    const transport =
      recvTransport || (await MediasoupClient.createRecvTransport());

    const pendingConsumed = waitForConsumed(producerId);

    await ConfMeetingSocketCommands.consume({
      transportId: transport.id,
      producerId,
      rtpCapabilities: activeDevice.rtpCapabilities as AnyRecord,
      appData,
    });

    const response = await pendingConsumed;

    if (!response?.consumer) {
      throw new Error("The meeting server did not return a consumer.");
    }

    const consumer = await transport.consume({
      id: response.consumer.id,
      producerId,
      kind: response.consumer.kind,
      rtpParameters: response.consumer.rtpParameters,
      appData: response.consumer.appData ?? response.appData ?? {},
    });

    const webrtc = await getReactNativeWebrtc();

    let stream: any = null;

    if (consumer.track) {
      if (webrtc?.MediaStream) {
        stream = new webrtc.MediaStream([consumer.track]);
      } else if (
        Platform.OS === "web" &&
        typeof MediaStream !== "undefined"
      ) {
        stream = new MediaStream([consumer.track]);
      }
    }

    await ConfMeetingSocketCommands.resumeConsume({
      consumerId: consumer.id,
    });

    return {
      consumer,
      stream,
      info: response,
    };
  },

  setTrackEnabled: (kind: "audio" | "video", enabled: boolean) => {
    if (!localStream) {
      return;
    }

    const tracks =
      kind === "audio"
        ? (localStream.getAudioTracks?.() ?? [])
        : (localStream.getVideoTracks?.() ?? []);

    tracks.forEach((track: any) => {
      track.enabled = enabled;
    });
  },

  cleanup: () => {
    sendTransport?.close?.();
    recvTransport?.close?.();

    localStream?.getTracks?.().forEach((track: any) => {
      track.stop?.();
    });

    screenShareProducer?.close?.();

    screenShareStream?.getTracks?.().forEach((track: any) => {
      track.stop?.();
    });

    sendTransport = null;
    recvTransport = null;
    localStream = null;
    screenShareProducer = null;
    screenShareStream = null;
    device = null;
    creatingSendTransport = null;
    creatingRecvTransport = null;
  },
};

export default MediasoupClient;
