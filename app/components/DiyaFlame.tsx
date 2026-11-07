"use client";

import { motion, useReducedMotion } from "framer-motion";

/** The flame starts small this many days before the event and grows to full size on the day. */
const GROW_FROM_DAYS = 60;
const DAY_MS = 86_400_000;

export type FlameStatus = "upcoming" | "today" | "past";

export interface FlameInfo {
  status: FlameStatus;
  /** 0 (small flame) → 1 (full flame) */
  intensity: number;
  days: number;
}

const istDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export function getFlameInfo(iso: string, now = new Date()): FlameInfo {
  const event = new Date(iso);
  const diff = event.getTime() - now.getTime();
  const sameDay = istDay(event) === istDay(now);

  if (sameDay) return { status: "today", intensity: 1, days: 0 };
  if (diff <= 0) return { status: "past", intensity: 1, days: 0 };

  const daysLeft = diff / DAY_MS;
  return {
    status: "upcoming",
    intensity: Math.min(1, Math.max(0, 1 - daysLeft / GROW_FROM_DAYS)),
    days: Math.ceil(daysLeft),
  };
}

const FLAME_PATH = "M60 8 C 74 30, 84 44, 84 60 C 84 74, 73 84, 60 84 C 47 84, 36 74, 36 60 C 36 46, 50 34, 60 8 Z";
const INNER_PATH = "M60 36 C 68 50, 72 58, 72 66 C 72 74, 66 80, 60 80 C 54 80, 48 74, 48 66 C 48 58, 54 50, 60 36 Z";

/**
 * A little clay diya whose flame grows every day as the event gets closer.
 */
export default function DiyaFlame({ info, eventName }: { info: FlameInfo; eventName: string }) {
  const rm = useReducedMotion();
  const scale = 0.55 + 0.75 * info.intensity;          // 0.55 → 1.30
  const glow = 0.25 + 0.65 * info.intensity;           // glow opacity
  const flicker = !rm;

  let headline: string;
  let sub: string;
  if (info.status === "today") {
    headline = "Today is the day! 🎉";
    sub = `${eventName} is today — see you there`;
  } else if (info.status === "past") {
    headline = "Thank you for celebrating with us 💛";
    sub = "";
  } else {
    headline = info.days === 1 ? "Just 1 day to go" : `${info.days} days to go`;
    sub = "the flame grows brighter every day";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 14 }}>
      <svg width="132" height="112" viewBox="0 0 120 102" role="img" aria-label={headline}>
        <defs>
          <radialGradient id="diya-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd36b" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#ff9f3a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff9f3a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="diya-flame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff8a1f" />
            <stop offset="55%" stopColor="#ffb02e" />
            <stop offset="100%" stopColor="#ffe27a" />
          </linearGradient>
          <linearGradient id="diya-clay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0603a" />
            <stop offset="100%" stopColor="#7a2f1d" />
          </linearGradient>
        </defs>

        {/* Soft glow behind the flame */}
        <motion.circle
          cx="60" cy="58" r="50" fill="url(#diya-glow)"
          initial={false}
          animate={{ opacity: glow, scale: 0.7 + 0.5 * info.intensity }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "60px 58px" }}
        />
        {flicker && (
          <motion.circle
            cx="60" cy="58" r="50" fill="url(#diya-glow)"
            animate={{ opacity: [0, glow * 0.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Flame — size follows how close the event is */}
        <motion.g
          initial={false}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
          style={{ transformOrigin: "60px 84px" }}
        >
          <motion.g
            animate={flicker ? { scaleY: [1, 1.07, 0.96, 1.05, 1], scaleX: [1, 0.95, 1.04, 0.97, 1], rotate: [-2, 2, -1.5, 1.5, -2] } : undefined}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "60px 84px" }}
          >
            <path d={FLAME_PATH} fill="url(#diya-flame)" />
            <path d={INNER_PATH} fill="#fff3c2" opacity="0.9" />
          </motion.g>
        </motion.g>

        {/* Clay diya */}
        <path d="M18 78 Q 60 66 102 78 Q 98 100 60 100 Q 22 100 18 78 Z" fill="url(#diya-clay)" />
        <path d="M18 78 Q 60 66 102 78" fill="none" stroke="#f0c040" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M34 90 Q 60 96 86 90" fill="none" stroke="#f0c040" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </svg>

      <p style={{
        fontFamily: "var(--font-display), serif", fontSize: 17, fontWeight: 600,
        color: "#5c1520", margin: "2px 0 0", textAlign: "center",
      }}>
        {headline}
      </p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-body), sans-serif", fontSize: 10, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#8c4a56", margin: "5px 0 0", textAlign: "center",
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}
