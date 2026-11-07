"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { inviteData } from "@/app/data/invite";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getTimeLeft(iso: string): TimeLeft {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    isPast:  false,
  };
}

function useCountdown(iso: string): TimeLeft | null {
  const [t, setT] = useState<TimeLeft | null>(null);
  useEffect(() => {
    setT(getTimeLeft(iso));
    const id = setInterval(() => setT(getTimeLeft(iso)), 1_000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

/* ─── sub-components ──────────────────────────────────────────────────────── */

// Single digit that slides up/down when it changes
function Digit({ v }: { v: string }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden", lineHeight: 1 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={v}
          initial={{ y: "105%" }}
          animate={{ y: 0 }}
          exit={{ y: "-105%" }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block" }}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Hours / Minutes card with per-digit flip
function UnitCard({ value, label }: { value: string; label: string }) {
  const [d1, d2] = value.length === 2 ? [value[0], value[1]] : ["–", value[0] ?? "–"];
  return (
    <div style={{
      background:   "#FFFFFF",
      borderRadius: 16,
      border:       "1px solid rgba(205,180,152,0.38)",
      boxShadow:    "0 4px 22px rgba(43,36,32,0.07)",
      padding:      "18px 22px 14px",
      textAlign:    "center",
      minWidth:     80,
    }}>
      <div style={{
        fontFamily:     "var(--font-display), serif",
        fontSize:       38,
        fontWeight:     600,
        color:          "#D97757",
        lineHeight:     1,
        display:        "flex",
        justifyContent: "center",
        gap:            1,
      }}>
        <Digit v={d1} />
        <Digit v={d2} />
      </div>
      <p style={{
        fontSize:      9,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color:         "#9A8F85",
        marginTop:     8,
        marginBottom:  0,
        fontFamily:    "var(--font-body), sans-serif",
      }}>
        {label}
      </p>
    </div>
  );
}

// Seconds — circular progress ring
function SecondsCard({ seconds }: { seconds: number }) {
  const R    = 30;
  const circ = 2 * Math.PI * R;
  const ss   = String(seconds).padStart(2, "0");
  // ring fills as seconds increase (progress through current minute)
  const offset = circ * (1 - seconds / 60);

  return (
    <div style={{
      background:   "#FFFFFF",
      borderRadius: 16,
      border:       "1px solid rgba(205,180,152,0.38)",
      boxShadow:    "0 4px 22px rgba(43,36,32,0.07)",
      padding:      "12px 14px 14px",
      textAlign:    "center",
      minWidth:     80,
    }}>
      {/* Ring */}
      <div style={{ position: "relative", width: 76, height: 76, margin: "0 auto" }}>
        <svg
          width="76" height="76" viewBox="0 0 76 76"
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Track */}
          <circle
            cx="38" cy="38" r={R}
            fill="none"
            stroke="rgba(217,119,87,0.14)"
            strokeWidth="3.5"
          />
          {/* Progress */}
          <circle
            cx="38" cy="38" r={R}
            fill="none"
            stroke="#D97757"
            strokeWidth="3.5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 38 38)"
            style={{ transition: "stroke-dashoffset 0.88s linear" }}
          />
        </svg>
        {/* Center number */}
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontFamily:     "var(--font-display), serif",
          fontSize:       22,
          fontWeight:     600,
          color:          "#D97757",
          overflow:       "hidden",
          lineHeight:     1,
        }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ss}
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              exit={{ y: "-105%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "block" }}
            >
              {ss}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <p style={{
        fontSize:      9,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color:         "#9A8F85",
        marginTop:     8,
        marginBottom:  0,
        fontFamily:    "var(--font-body), sans-serif",
      }}>
        Seconds
      </p>
    </div>
  );
}

// Faint colon separator between HMS cards
function Colon() {
  return (
    <div style={{
      fontSize:   26,
      fontWeight: 700,
      color:      "rgba(217,119,87,0.35)",
      fontFamily: "var(--font-display), serif",
      paddingTop: 16,
      lineHeight: 1,
      userSelect: "none",
    }}>
      :
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

export default function Countdown() {
  const { mainEvent } = inviteData;
  const timeLeft = useCountdown(mainEvent.dateTimeISO);
  const ref      = useRef(null);
  const rm       = useReducedMotion();
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  // Use placeholder values until client hydration kicks in
  const days    = timeLeft ? String(timeLeft.days)                      : "···";
  const hours   = timeLeft ? String(timeLeft.hours).padStart(2, "0")   : "--";
  const minutes = timeLeft ? String(timeLeft.minutes).padStart(2, "0") : "--";
  const seconds = timeLeft?.seconds ?? 0;
  const isPast  = timeLeft?.isPast ?? false;

  const fade = (delay: number) =>
    rm ? {} : {
      initial:    { opacity: 0, y: 30 },
      animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
      transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    };

  if (isPast) {
    return (
      <section style={{ textAlign: "center", padding: "80px 24px", background: "#FFF5EC" }}>
        <p style={{
          fontFamily: "var(--font-display), serif",
          fontSize: 28, color: "#D97757", margin: 0,
        }}>
          The celebration has begun! 🎉
        </p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Countdown to the celebration"
      style={{
        background: "linear-gradient(180deg, #FFFAF5 0%, #FFF5EC 55%, #FFF8F2 100%)",
        padding:    "80px 24px 88px",
        textAlign:  "center",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position:   "absolute",
          top:        "5%", left: "20%", right: "20%",
          height:     "45%",
          background: "radial-gradient(ellipse, rgba(217,119,87,0.06) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Section header ── */}
      <motion.div {...fade(0)} style={{ marginBottom: 48 }}>
        <p style={{
          fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase",
          color: "#9A8F85", marginBottom: 12,
          fontFamily: "var(--font-body), sans-serif",
        }}>
          Almost Time
        </p>
        <h2 style={{
          fontFamily:    "var(--font-display), serif",
          fontSize:      "clamp(26px, 4.5vw, 42px)",
          fontWeight:    600,
          color:         "#2b2420",
          margin:        0,
          letterSpacing: "-0.01em",
        }}>
          The Big Day is Near
        </h2>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10, marginTop: 16,
        }}>
          <div style={{ height: 1, width: 48, background: "linear-gradient(to right, transparent, #D97757)" }} />
          <span style={{ color: "#D97757", fontSize: 13, lineHeight: 1 }}>♥</span>
          <div style={{ height: 1, width: 48, background: "linear-gradient(to left, transparent, #D97757)" }} />
        </div>
      </motion.div>

      {/* ── Big DAYS number ── */}
      <motion.div {...fade(0.1)}>
        <div style={{
          fontFamily:     "var(--font-display), serif",
          fontSize:       "clamp(96px, 20vw, 168px)",
          fontWeight:     700,
          color:          "#D97757",
          lineHeight:     1,
          letterSpacing:  "-0.04em",
          display:        "flex",
          justifyContent: "center",
        }}>
          {days.split("").map((d, i) => (
            <Digit key={i} v={d} />
          ))}
        </div>
      </motion.div>

      <motion.p {...fade(0.17)} style={{
        fontSize:      "clamp(11px, 2vw, 16px)",
        letterSpacing: "0.34em",
        textTransform: "uppercase",
        color:         "#8a7f75",
        marginTop:     8,
        marginBottom:  44,
        fontFamily:    "var(--font-body), sans-serif",
      }}>
        Days to Go
      </motion.p>

      {/* ── Divider ── */}
      <motion.div
        initial={rm ? {} : { scaleX: 0, opacity: 0 }}
        animate={rm ? {} : isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.24 }}
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10, marginBottom: 40,
        }}
      >
        <div style={{ height: 1, width: 56, background: "linear-gradient(to right, transparent, rgba(217,119,87,0.45))" }} />
        <span style={{ color: "rgba(217,119,87,0.45)", fontSize: 12, lineHeight: 1 }}>♥</span>
        <div style={{ height: 1, width: 56, background: "linear-gradient(to left, transparent, rgba(217,119,87,0.45))" }} />
      </motion.div>

      {/* ── H : M : S ── */}
      <motion.div
        {...fade(0.3)}
        style={{
          display:        "flex",
          justifyContent: "center",
          alignItems:     "flex-start",
          gap:            10,
          flexWrap:       "wrap",
        }}
      >
        <UnitCard value={hours}   label="Hours"   />
        <Colon />
        <UnitCard value={minutes} label="Minutes" />
        <Colon />
        <SecondsCard seconds={seconds} />
      </motion.div>

      {/* ── Event footer ── */}
      <motion.p {...fade(0.4)} style={{
        marginTop:     44,
        fontSize:      12,
        color:         "#9A8F85",
        letterSpacing: "0.14em",
        fontFamily:    "var(--font-body), sans-serif",
      }}>
        {mainEvent.name}&nbsp; · &nbsp;{mainEvent.date}
      </motion.p>
    </section>
  );
}
