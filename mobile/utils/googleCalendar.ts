function parseMeetingDate(value: string | Date) {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  const raw = String(value || "").trim();

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)
    ? `${raw.replace(" ", "T")}Z`
    : raw;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new Error("This meeting does not have a valid scheduled time.");
  }

  return date;
}

function formatGoogleDate(value: string | Date) {
  return parseMeetingDate(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function createGoogleCalendarUrl({
  title,
  startsAt,
  meetingUrl,
  durationMinutes = 60,
}: {
  title: string;
  startsAt: string | Date;
  meetingUrl: string;
  durationMinutes?: number;
}) {
  const start = parseMeetingDate(startsAt);
  const end = new Date(
    start.getTime() + Math.max(15, durationMinutes) * 60 * 1000,
  );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Telefya meeting",
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: `Join Telefya meeting: ${meetingUrl}`,
    location: meetingUrl,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}