const DEFAULT_WEB_MEETING_URL = "https://telefya.com";

function getWebMeetingBase() {
  return (
    process.env.EXPO_PUBLIC_WEB_MEETING_URL ??
    DEFAULT_WEB_MEETING_URL
  ).replace(/\/+$/, "");
}

export function createRoomId(prefix = "telefya") {
  const token = Math.random().toString(36).slice(2, 14);
  return `${prefix}-${token}`;
}

/** The single link format used by mobile, web, sharing, and invitations. */
export function createMeetingUrl(roomId: string) {
  return `${getWebMeetingBase()}/live/${encodeURIComponent(roomId)}`;
}

export function getRoomIdFromMeetingUrl(value?: string | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw);

    const queryRoomId = url.searchParams.get("roomId");
    if (queryRoomId) {
      return queryRoomId;
    }

    const parts = url.pathname
      .split("/")
      .map(decodeURIComponent)
      .filter(Boolean);

    const liveIndex = parts.lastIndexOf("live");
    if (liveIndex >= 0 && parts[liveIndex + 1]) {
      return parts[liveIndex + 1];
    }
  } catch {
    const queryMatch = raw.match(/[?&]roomId=([^&]+)/i);
    if (queryMatch?.[1]) {
      return decodeURIComponent(queryMatch[1]);
    }

    const liveMatch = raw.match(/\/live\/([^/?#]+)/i);
    if (liveMatch?.[1]) {
      return decodeURIComponent(liveMatch[1]);
    }
  }

  return /^[A-Za-z0-9_-]{3,120}$/.test(raw) ? raw : "";
}

export function isValidMeetingRoomId(value?: string | null) {
  return /^[A-Za-z0-9_-]{3,120}$/.test(
    String(value ?? "").trim(),
  );
}

export function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}