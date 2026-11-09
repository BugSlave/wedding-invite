"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { EventDetail } from "@/types/invite";
import { useInvite } from "./InviteContext";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";

type GeoState = "idle" | "locating" | "done" | "denied";

const GOLD = "linear-gradient(135deg, var(--ec-dark) 0%, var(--ec-accent) 28%, var(--ec-mid) 50%, var(--ec-accent) 72%, var(--ec-dark) 100%)";

type EventTheme = NonNullable<EventDetail["theme"]>;

// Colours per card theme. "rgb" values are space-separated so CSS can add alpha.
const THEMES: Record<EventTheme, {
  accent: string; dark: string; mid: string; muted: string;
  rgb: string; shadow: string; bg: string;
  btnBg: string; btnText: string; btnShadow: string;
}> = {
  default: {
    accent: "#8b2234", dark: "#5c1520", mid: "#a83040", muted: "#8c4a56",
    rgb: "139 34 52", shadow: "92 21 32",
    bg: "linear-gradient(145deg, #faf5e5 0%, #f5edd5 55%, #eee3c0 100%)",
    btnBg: "linear-gradient(135deg, #A86C00 0%, #F0C040 45%, #FFE040 55%, #F0C040 70%, #A86C00 100%)",
    btnText: "#2A0005", btnShadow: "212 175 55",
  },
  lavender: {
    accent: "#7c5cbf", dark: "#3d2a63", mid: "#9b7fd4", muted: "#7a6a9a",
    rgb: "124 92 191", shadow: "61 42 99",
    bg: "linear-gradient(145deg, #faf7ff 0%, #f1e9fc 55%, #e5d8f7 100%)",
    btnBg: "linear-gradient(135deg, #7c5cbf 0%, #a98be0 45%, #c4aef0 55%, #a98be0 70%, #7c5cbf 100%)",
    btnText: "#ffffff", btnShadow: "155 127 212",
  },
};

function openDirections(destination: string, position?: GeolocationPosition) {
  const dest = encodeURIComponent(destination);
  if (position) {
    const { latitude: lat, longitude: lng } = position.coords;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${dest}&travelmode=driving`,
      "_blank", "noopener,noreferrer"
    );
  } else {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      "_blank", "noopener,noreferrer"
    );
  }
}

function getIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("ring") || n.includes("engagement")) return "💍";
  if (n.includes("mehendi") || n.includes("mehndi")) return "🌿";
  if (n.includes("sangeet")) return "🎵";
  if (n.includes("reception")) return "🥂";
  if (n.includes("haldi")) return "🌼";
  if (n.includes("wedding") || n.includes("marriage")) return "💒";
  return "🎊";
}

function parseDateParts(iso: string) {
  const d = new Date(iso);
  const month    = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day      = d.toLocaleDateString("en-US", { day: "2-digit" });
  const year     = d.getFullYear();
  const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" });
  return { month, day, year, dayOfWeek };
}

function extractCity(address: string): string {
  const parts = address.split(",").map(p => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2];
  return parts[0] ?? "India";
}

/* ── Vertical dashed tear line ───────────────────────────────────────────── */
function TearLine({ vertical }: { vertical: boolean }) {
  if (vertical) {
    return (
      <div style={{
        width: 1,
        alignSelf: "stretch",
        flexShrink: 0,
        background: "repeating-linear-gradient(to bottom, rgb(var(--ec-rgb) / 0.35) 0px, rgb(var(--ec-rgb) / 0.35) 5px, transparent 5px, transparent 11px)",
      }} />
    );
  }
  return (
    <div style={{
      height: 1,
      background: "repeating-linear-gradient(to right, rgb(var(--ec-rgb) / 0.30) 0px, rgb(var(--ec-rgb) / 0.30) 5px, transparent 5px, transparent 11px)",
    }} />
  );
}

/* ── Main EventCard ───────────────────────────────────────────────────────── */
export default function EventCard({
  event,
  featured = false,
  delay = 0,
}: {
  event: EventDetail;
  featured?: boolean;
  delay?: number;
}) {
  const ref        = useRef(null);
  const rm         = useReducedMotion();
  const isInView   = useInView(ref, { once: false, amount: 0.15 });
  const [geoState, setGeoState] = useState<GeoState>("idle");

  const { couple } = useInvite();
  const t = THEMES[event.theme ?? "default"];
  const icon = getIcon(event.name);
  const { month, day, year, dayOfWeek } = parseDateParts(event.dateTimeISO);
  const city = extractCity(event.address);

  const names = `${couple.groomFullName ?? couple.groomName} & ${couple.brideFullName ?? couple.brideName}`;

  // Venue name + city so Google Maps finds the actual place, not just the city.
  const destination = `${event.venue}, ${event.address}`;

  function handleDirections() {
    if (event.mapsUrl) { window.open(event.mapsUrl, "_blank", "noopener,noreferrer"); return; }
    if (!navigator.geolocation) { openDirections(destination); return; }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGeoState("done"); openDirections(destination, pos); },
      ()    => { setGeoState("denied"); openDirections(destination); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  return (
    <motion.article
      ref={ref}
      initial={rm ? {} : { opacity: 0, y: 56, scale: 0.94 }}
      animate={rm ? {} : isInView
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y: 56, scale: 0.94 }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={rm ? {} : {
        y: -6,
        boxShadow: `0 0 0 3px rgb(${t.rgb} / 0.15), 0 24px 60px rgb(${t.shadow} / 0.22)`,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className={featured ? "event-card-shimmer" : undefined}
      style={{
        background:   t.bg,
        // Theme colours for this card (also read by the .ec-btn-* classes)
        ...({
          "--ec-accent": t.accent, "--ec-dark": t.dark, "--ec-mid": t.mid, "--ec-muted": t.muted,
          "--ec-rgb": t.rgb, "--ec-btn-bg": t.btnBg, "--ec-btn-text": t.btnText, "--ec-btn-shadow": t.btnShadow,
        } as React.CSSProperties),
        borderRadius: 18,
        border:       `1.5px solid rgb(var(--ec-rgb) / ${featured ? "0.55" : "0.30"})`,
        boxShadow:    featured
          ? `0 0 0 5px rgb(${t.rgb} / 0.06), 0 20px 60px rgb(${t.shadow} / 0.18)`
          : `0 8px 36px rgb(${t.shadow} / 0.12)`,
        overflow:  "hidden",
        position:  "relative",
        maxWidth:  620,
        margin:    "0 auto",
        width:     "100%",
      }}
    >

      {/* ── HEADER: "SHAADI PASS" bar ─────────────────────────────────── */}
      <div style={{
        padding:        "9px 18px 8px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        background:     "rgb(var(--ec-rgb) / 0.06)",
        borderBottom:   "1px solid rgb(var(--ec-rgb) / 0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: "var(--ec-accent)", fontSize: 9 }}>✦</span>
          <span style={{
            fontSize:      9,
            letterSpacing: "0.50em",
            textTransform: "uppercase",
            fontFamily:    "var(--font-body), sans-serif",
            fontWeight:    700,
            background:    GOLD,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip: "text",
          }}>
            Wedding Pass
          </span>
          <span style={{ color: "var(--ec-accent)", fontSize: 9 }}>✦</span>
        </div>

        {featured && (
          <span style={{
            fontSize:      8,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color:         "var(--ec-accent)",
            background:    "rgb(var(--ec-rgb) / 0.08)",
            padding:       "3px 10px",
            borderRadius:  999,
            border:        "1px solid rgb(var(--ec-rgb) / 0.25)",
            fontFamily:    "var(--font-body), sans-serif",
          }}>
            Main Event
          </span>
        )}
      </div>

      {/* ── BODY: date stub | tear line | event details ───────────────── */}
      <div style={{ display: "flex" }}>

        {/* Left stub — date stamp */}
        <div style={{
          width:          "clamp(90px, 26vw, 110px)",
          flexShrink:     0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "22px 8px 20px",
          background:     "rgb(var(--ec-rgb) / 0.05)",
          gap:            0,
          textAlign:      "center",
        }}>
          {/* City */}
          <p style={{
            fontSize:      7.5,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color:         "var(--ec-muted)",
            margin:        0,
            fontFamily:    "var(--font-body), sans-serif",
          }}>
            {city}
          </p>

          {/* Month */}
          <p style={{
            fontSize:      12,
            fontWeight:    700,
            letterSpacing: "0.20em",
            color:         "var(--ec-accent)",
            margin:        "7px 0 0",
            fontFamily:    "var(--font-body), sans-serif",
          }}>
            {month}
          </p>

          {/* Big date number */}
          <p style={{
            fontFamily:           "var(--font-display), serif",
            fontSize:             54,
            fontWeight:           700,
            background:           GOLD,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
            lineHeight:           1,
            margin:               "4px 0 0",
            letterSpacing:        "-0.02em",
          }}>
            {day}
          </p>

          {/* Year */}
          <p style={{
            fontSize:   10,
            color:      "var(--ec-muted)",
            margin:     "5px 0 0",
            fontFamily: "var(--font-body), sans-serif",
            letterSpacing: "0.05em",
          }}>
            {year}
          </p>

          {/* Gold thin line */}
          <div style={{
            width:      38,
            height:     1,
            background: "rgb(var(--ec-rgb) / 0.20)",
            margin:     "12px 0 10px",
          }} />

          {/* Floral ornament */}
          <p style={{ fontSize: 12, color: "var(--ec-accent)", margin: 0, letterSpacing: 3, lineHeight: 1 }}>
            ✿ ❁ ✿
          </p>
          <p style={{ fontSize: 9,  color: "var(--ec-muted)", margin: "4px 0 0", letterSpacing: 2 }}>
            ✦ ꕥ ✦
          </p>
        </div>

        {/* Vertical tear line */}
        <TearLine vertical />

        {/* Right section — event details */}
        <div style={{
          flex:           1,
          padding:        "22px clamp(12px, 3.5vw, 18px) 20px",
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "space-between",
          minWidth:       0,
        }}>
          <div>
            {/* Icon + Event name */}
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              <h3 style={{
                fontFamily:    "var(--font-display), serif",
                fontSize:      "clamp(18px, 3.5vw, 24px)",
                fontWeight:    700,
                fontStyle:     "italic",
                color:         "var(--ec-dark)",
                margin:        0,
                lineHeight:    1.2,
                letterSpacing: "-0.01em",
              }}>
                {event.name}
              </h3>
            </div>

            {/* Day · Time */}
            <p style={{
              fontSize:      12,
              color:         "var(--ec-accent)",
              margin:        "0 0 13px",
              fontFamily:    "var(--font-body), sans-serif",
              fontWeight:    500,
              letterSpacing: "0.02em",
            }}>
              {dayOfWeek} &nbsp;·&nbsp; {event.time}
            </p>

            {/* Venue */}
            <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 20 }}>
              <span style={{ fontSize: 12, marginTop: 1, opacity: 0.75, flexShrink: 0 }}>📍</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ec-dark)", margin: 0, lineHeight: 1.4 }}>
                  {event.venue}
                </p>
                <p style={{ fontSize: 11, color: "var(--ec-muted)", margin: "2px 0 0", lineHeight: 1.55 }}>
                  {event.address}
                </p>
              </div>
            </div>
          </div>

          {/* Directions + Save the date */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="ec-btn-group">
              <button
                onClick={handleDirections}
                disabled={geoState === "locating"}
                className="ec-btn-primary"
                style={{ opacity: geoState === "locating" ? 0.75 : 1 }}
              >
                {geoState === "locating" ? "📍 Locating…" : "↗ Get Directions"}
              </button>
            </div>
            <div className="ec-cal-group">
              <button
                onClick={() => downloadIcs(event, names)}
                className="ec-btn-outline"
                aria-label={`Save the date: add ${event.name} to your calendar`}
              >
                📅 Save the date
              </button>
              <a
                href={googleCalendarUrl(event, names)}
                target="_blank"
                rel="noopener noreferrer"
                className="ec-btn-outline"
                style={{ textDecoration: "none" }}
              >
                Google Calendar
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Horizontal tear / perforation line ───────────────────────── */}
      <TearLine vertical={false} />

      {/* ── BOTTOM STUB: couple names + date·city ────────────────────── */}
      <div style={{
        padding:        "11px 18px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        background:     "rgb(var(--ec-rgb) / 0.06)",
        gap:            12,
        flexWrap:       "wrap",
      }}>
        <p style={{
          fontFamily: "var(--font-display), serif",
          fontSize:   13,
          color:      "var(--ec-dark)",
          margin:     0,
          whiteSpace: "nowrap",
        }}>
          <span style={{ color: "var(--ec-accent)", marginRight: 6 }}>ꕥ</span>
          {couple.groomFullName ?? couple.groomName} &amp; {couple.brideFullName ?? couple.brideName}
          <span style={{ color: "var(--ec-accent)", marginLeft: 6 }}>ꕥ</span>
        </p>

        <p style={{
          fontSize:   11,
          color:      "var(--ec-muted)",
          margin:     0,
          fontFamily: "var(--font-body), sans-serif",
          display:    "flex",
          alignItems: "center",
          gap:        5,
          whiteSpace: "nowrap",
        }}>
          <span>🪷</span>
          {month} {day} &nbsp;·&nbsp; {city}
        </p>
      </div>

    </motion.article>
  );
}
