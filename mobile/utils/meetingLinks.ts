const WEB_MEETING_URL =
  process.env.EXPO_PUBLIC_WEB_MEETING_URL ??
  "https://meet.bornwithwealth.com/meetings";

export function createRoomId(prefix = "telefya") {
  const token = Math.random().toString(36).slice(2, 14);
  return `${prefix}-${token}`;
}

export function createMeetingUrl(roomId: string) {
  return `${WEB_MEETING_URL}?roomId=${encodeURIComponent(roomId)}`;
}

export function getRoomIdFromMeetingUrl(meetingUrl: string) {
  try {
    const url = new URL(meetingUrl);
    return url.searchParams.get("roomId") ?? meetingUrl;
  } catch {
    const match = meetingUrl.match(/[?&]roomId=([^&]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : meetingUrl;
  }
}

export function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}