import type { EventDetail } from "@/types/invite";

const DEFAULT_HOURS = 3;

/** 2026-12-08T18:00:00+05:30 → 20261208T123000Z (calendar apps want UTC) */
function toCalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function range(event: EventDetail) {
  const start = new Date(event.dateTimeISO);
  const end = new Date(start.getTime() + (event.durationHours ?? DEFAULT_HOURS) * 3_600_000);
  return { start, end };
}

function mapsLink(event: EventDetail): string {
  return (
    event.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.address}`)}`
  );
}

function title(event: EventDetail, names: string): string {
  return `${event.name} — ${names}`;
}

function details(event: EventDetail, names: string): string {
  return `You're invited to the ${event.name} of ${names}.\n${event.time}\n${event.venue}, ${event.address}\nDirections: ${mapsLink(event)}`;
}

/** Link that opens Google Calendar with the event pre-filled. */
export function googleCalendarUrl(event: EventDetail, names: string): string {
  const { start, end } = range(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(event, names),
    dates: `${toCalDate(start)}/${toCalDate(end)}`,
    details: details(event, names),
    location: `${event.venue}, ${event.address}`,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// RFC 5545 text escaping
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** Standard .ics file content (works with Apple, Google, Outlook calendars). */
export function buildIcs(event: EventDetail, names: string): string {
  const { start, end } = range(event);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}-${toCalDate(start)}@wedding-invite`,
    `DTSTAMP:${toCalDate(new Date())}`,
    `DTSTART:${toCalDate(start)}`,
    `DTEND:${toCalDate(end)}`,
    `SUMMARY:${esc(title(event, names))}`,
    `DESCRIPTION:${esc(details(event, names))}`,
    `LOCATION:${esc(`${event.venue}, ${event.address}`)}`,
    `URL:${mapsLink(event)}`,
    // Reminders: 1 day before and 3 hours before
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(event.name)} tomorrow`, "TRIGGER:-P1D", "END:VALARM",
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(event.name)} in 3 hours`, "TRIGGER:-PT3H", "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** Triggers a download of the .ics file in the browser. */
export function downloadIcs(event: EventDetail, names: string) {
  const blob = new Blob([buildIcs(event, names)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
