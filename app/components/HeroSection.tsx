"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundOrbs from "./BackgroundOrbs";
import ScratchDate from "./ScratchDate";
import DiyaFlame, { getFlameInfo } from "./DiyaFlame";
import SectionConfetti from "./SectionConfetti";
import { useInvite } from "./InviteContext";

function useCountdown(iso: string) {
  const calc = () => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff / 3_600_000) % 24),
      minutes: Math.floor((diff / 60_000) % 60),
      seconds: Math.floor((diff / 1_000) % 60),
    };
  };
  const [t, setT] = useState<ReturnType<typeof calc> | null>(null);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1_000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

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

function Tile({ value, label }: { value: string; label: string }) {
  const [a, b] = value.length === 2 ? [value[0], value[1]] : [value, ""];
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", minWidth: 54,
      background: "rgba(139,34,52,0.06)",
      backdropFilter: "blur(10px)",
      borderRadius: 14,
      border: "1.5px solid rgba(139,34,52,0.30)",
      boxShadow: "0 3px 14px rgba(92,21,32,0.12), 0 0 0 3px rgba(139,34,52,0.05)",
      padding: "10px 12px 8px",
    }}>
      <div style={{
        fontFamily: "var(--font-display), serif", fontSize: 28, fontWeight: 600,
        background: "linear-gradient(135deg, #5c1520, #8b2234, #5c1520)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        lineHeight: 1, display: "flex",
      }}>
        <Digit v={a} />
        {b && <Digit v={b} />}
      </div>
      <p style={{
        fontSize: 8, letterSpacing: "0.32em", textTransform: "uppercase",
        color: "#8c4a56", margin: "6px 0 0", fontFamily: "var(--font-body), sans-serif",
        fontWeight: 600,
      }}>
        {label}
      </p>
    </div>
  );
}


interface Props {
  brideName: string;
  groomName: string;
  date: string;
  venue: string;
  onRevealed?: () => void;
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

// Marigold garland decoration
function Garland() {
  const flowers = ["✦","❀","✿","❁","✾","❋","✾","❁","✿","❀","✦"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "nowrap" }}>
      {flowers.map((f, i) => {
        const isCenter = i === 5;
        const distFromCenter = Math.abs(i - 5);
        const size = isCenter ? 22 : 12 + (3 - Math.min(distFromCenter, 3)) * 1.5;
        return (
          <span key={i} style={{
            color: isCenter ? "#FFB347" : distFromCenter <= 1 ? "#F0C040" : "#FFD060",
            fontSize: size, lineHeight: 1,
          }}>{f}</span>
        );
      })}
    </div>
  );
}

// Lotus mandala divider between names
function LotusDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 8px" }}>
      <span style={{ color: "#F0C040", fontSize: 11 }}>✦</span>
      <span style={{ color: "#FFD060", fontSize: 13 }}>ꕥ</span>
      <span style={{ fontSize: 28, lineHeight: 1 }}>🪷</span>
      <span style={{ color: "#FFD060", fontSize: 13 }}>ꕥ</span>
      <span style={{ color: "#F0C040", fontSize: 11 }}>✦</span>
    </div>
  );
}

// Indian-style gold frame wrapper for scratch card
function IndianFrame({ children }: { children: React.ReactNode }) {
  const corners = [
    { top: 6, left: 6 },
    { top: 6, right: 6, transform: "scaleX(-1)" },
    { bottom: 6, left: 6, transform: "scaleY(-1)" },
    { bottom: 6, right: 6, transform: "scale(-1)" },
  ] as React.CSSProperties[];

  return (
    <div style={{
      position: "relative",
      padding: "14px 14px 12px",
      background: "rgba(255,255,255,0.30)",
      border: "2px solid rgba(139,34,52,0.40)",
      borderRadius: 18,
      boxShadow: [
        "0 0 0 5px rgba(139,34,52,0.06)",
        "0 8px 28px rgba(92,21,32,0.15)",
      ].join(", "),
    }}>
      {/* Corner florals */}
      {corners.map((style, i) => (
        <div key={i} style={{ position: "absolute", ...style, fontSize: 10, color: "rgba(139,34,52,0.70)", lineHeight: 1 }}>
          ❁✿❀
        </div>
      ))}
      {/* Label above scratch */}
      <p style={{
        textAlign: "center", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase",
        color: "#8b2234", marginBottom: 10, fontFamily: "var(--font-body), sans-serif",
      }}>
        ✦ &nbsp; scratch to reveal &nbsp; ✦
      </p>
      {children}
    </div>
  );
}

export default function HeroSection({ brideName, groomName, date, venue, onRevealed }: Props) {
  const inviteData = useInvite();
  const [dateRevealed, setDateRevealed] = useState(false);
  // Countdown runs to the Marriage (same date the scratch card reveals).
  const countdownEvent =
    inviteData.additionalEvents.find((e) => e.id === "marriage") ?? inviteData.mainEvent;
  const timeLeft = useCountdown(countdownEvent.dateTimeISO);
  const days    = timeLeft ? String(timeLeft.days)                      : "--";
  const hours   = timeLeft ? String(timeLeft.hours).padStart(2, "0")   : "--";
  const minutes = timeLeft ? String(timeLeft.minutes).padStart(2, "0") : "--";
  const seconds = timeLeft ? String(timeLeft.seconds).padStart(2, "0") : "--";
  // Diya flame grows as the event nears; confetti on the day itself.
  const flame = timeLeft ? getFlameInfo(countdownEvent.dateTimeISO) : null;

  return (
    <motion.section
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        minHeight: "100svh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #f5edd5 0%, #e8d8a8 28%, #f0e5c8 62%, #f5edd5 100%)",
        padding: "40px 24px", textAlign: "center",
      }}
    >
      {/* Ambient orbs */}
      <BackgroundOrbs orbs={[
        { w: 520, h: 520, top: "-10%",  left: "-8%",  color: "rgba(139,34,52,0.07)",  blur: 90,  duration: 14, delay: 0,   dx: 60,  dy: 40  },
        { w: 440, h: 440, top: "-8%",   right: "-6%", color: "rgba(212,175,55,0.12)", blur: 100, duration: 18, delay: 1,   dx: -50, dy: 60  },
        { w: 380, h: 380, bottom: "0%", left: "15%",  color: "rgba(139,34,52,0.08)",  blur: 85,  duration: 16, delay: 4,   dx: 40,  dy: -50 },
        { w: 320, h: 320, top: "30%",   left: "52%",  color: "rgba(212,175,55,0.09)", blur: 80,  duration: 12, delay: 2,   dx: -60, dy: 30  },
        { w: 260, h: 260, bottom: "10%",right: "5%",  color: "rgba(139,34,52,0.06)",  blur: 70,  duration: 10, delay: 3,   dx: -30, dy: -40 },
        { w: 200, h: 200, bottom: "20%",left: "5%",   color: "rgba(212,175,55,0.08)", blur: 65,  duration: 15, delay: 5,   dx: 40,  dy: 30  },
      ]} />

      {dateRevealed && flame?.status === "today" && <SectionConfetti />}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}
      >
        {/* Garland header */}
        <motion.div variants={item} style={{ marginBottom: 10 }}>
          <Garland />
        </motion.div>

        {/* Pre-headline */}
        <motion.p
          variants={item}
          style={{
            fontSize: 10, letterSpacing: "0.50em", textTransform: "uppercase",
            color: "#8c4a56", marginBottom: 28,
            fontWeight: 600,
            fontFamily: "var(--font-body), sans-serif",
          }}
        >
          Okay&hellip; this finally happened
        </motion.p>

        {/* Groom name — Great Vibes calligraphy */}
        <motion.h1
          variants={item}
          style={{
            fontFamily: "var(--font-accent), cursive",
            fontSize: "clamp(58px, 13vw, 112px)",
            fontWeight: 400,
            background: "linear-gradient(135deg, #5c1520 0%, #8b2234 28%, #a83040 50%, #8b2234 72%, #5c1520 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.15,
            margin: 0,
            filter: "drop-shadow(0 0 18px rgba(139,34,52,0.18))",
          }}
        >
          {groomName}
        </motion.h1>

        {/* Groom parent names */}
        {inviteData.couple.groomParents && (
          <motion.p
            variants={item}
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              color: "#8b2234",
              margin: "2px 0 0",
              fontFamily: "var(--font-body), sans-serif",
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            S/o&nbsp;
            <span style={{ color: "#5c1520" }}>{inviteData.couple.groomParents.father}</span>
            {inviteData.couple.groomParents.mother && (
              <>
                <span style={{ color: "#E8BA50", margin: "0 7px" }}>&amp;</span>
                <span style={{ color: "#5c1520" }}>{inviteData.couple.groomParents.mother}</span>
              </>
            )}
          </motion.p>
        )}

        {/* Lotus mandala divider */}
        <motion.div variants={item}>
          <LotusDivider />
        </motion.div>

        {/* Bride name — Great Vibes calligraphy */}
        <motion.h1
          variants={item}
          style={{
            fontFamily: "var(--font-accent), cursive",
            fontSize: "clamp(58px, 13vw, 112px)",
            fontWeight: 400,
            background: "linear-gradient(135deg, #5c1520 0%, #8b2234 28%, #a83040 50%, #8b2234 72%, #5c1520 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.15,
            margin: 0,
            filter: "drop-shadow(0 0 18px rgba(139,34,52,0.18))",
          }}
        >
          {brideName}
        </motion.h1>

        {/* Bride parent names */}
        {inviteData.couple.brideParents && (
          <motion.p
            variants={item}
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              color: "#8b2234",
              margin: "2px 0 0",
              fontFamily: "var(--font-body), sans-serif",
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            D/o&nbsp;
            <span style={{ color: "#5c1520" }}>{inviteData.couple.brideParents.father}</span>
            {inviteData.couple.brideParents.mother && (
              <>
                <span style={{ color: "#E8BA50", margin: "0 7px" }}>&amp;</span>
                <span style={{ color: "#5c1520" }}>{inviteData.couple.brideParents.mother}</span>
              </>
            )}
          </motion.p>
        )}

        {/* Bottom garland */}
        <motion.div variants={item} style={{ marginTop: 10 }}>
          <Garland />
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={item}
          style={{
            fontSize: "clamp(14px, 2vw, 17px)", color: "#5c1520",
            marginTop: 18, marginBottom: 36, maxWidth: 390, lineHeight: 1.75,
            fontWeight: 400,
            fontStyle: "italic",
            fontFamily: "var(--font-display), serif",
          }}
        >
          are getting engaged &mdash; and we&rsquo;d love for you to be there.
        </motion.p>

        {/* Scratch date with Indian frame */}
        <motion.div variants={item} style={{ marginBottom: 16 }}>
          <IndianFrame>
            <ScratchDate date={date} onRevealed={() => { setDateRevealed(true); onRevealed?.(); }} />
          </IndianFrame>
        </motion.div>

        {/* Countdown */}
        <AnimatePresence>
          {dateRevealed && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}
            >
              {flame && <DiyaFlame info={flame} eventName={countdownEvent.name} />}
              {flame?.status !== "past" && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <Tile value={days}    label="Days"    />
                  <Tile value={hours}   label="Hours"   />
                  <Tile value={minutes} label="Minutes" />
                  <Tile value={seconds} label="Seconds" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Venue pill */}
        <AnimatePresence>
          {dateRevealed && (
            <motion.div
              key="venue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 999,
                border: "1.5px solid rgba(139,34,52,0.40)",
                background: "rgba(245,237,213,0.70)",
                boxShadow: "0 4px 18px rgba(92,21,32,0.10)",
                fontSize: 13, color: "#5c1520", backdropFilter: "blur(8px)",
              }}
            >
              <span>🌸</span>
              {venue}
              <span>🌸</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll CTA with peacock motif */}
        <AnimatePresence>
          {dateRevealed && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
            >
              <p style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: "#8c4a56" }}>
                Our Story
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>🦚</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    color: "#8b2234", fontSize: 20, lineHeight: 1,
                    filter: "drop-shadow(0 1px 3px rgba(139,34,52,0.25))",
                  }}
                >
                  ↓
                </motion.div>
                <span style={{ fontSize: 18, lineHeight: 1, transform: "scaleX(-1)", display: "inline-block" }}>🦚</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
