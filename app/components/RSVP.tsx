"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { useInvite } from "./InviteContext";
import SectionConfetti from "./SectionConfetti";

type Answer = "yes" | "maybe" | "no";
type Status = "idle" | "loading" | "error";

/* ── Hand / ring geometry (in a 340 × 150 design space, scaled with % so it fits any phone) ── */
const BW = 340;
const BH = 150;
const RING = 46;          // ring diameter
const RING_LEFT = 8;      // where the ring starts
const RING_CY = 99;       // centre line of the ring finger
const TARGET_CX = 205;    // where the ring ends up on the finger
const TRACK_W = TARGET_CX + RING / 2 - RING_LEFT; // total slide width
const pctW = (n: number) => `${(n / BW) * 100}%`;
const pctH = (n: number) => `${(n / BH) * 100}%`;

const SKIN = "#f2cba9";
const SKIN_EDGE = "#d9a67f";

const storageKey = (name: string) => `rsvp:${name.trim().toLowerCase()}`;

function readSaved(name: string | null | undefined): Answer | null {
  if (!name) return null;
  try {
    const v = localStorage.getItem(storageKey(name));
    return v === "yes" || v === "no" || v === "maybe" ? v : null;
  } catch {
    return null;
  }
}

function Finger({ x, y, w, h, nail }: { x: number; y: number; w: number; h: number; nail?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1.5" />
      {nail && <ellipse cx={x + 11} cy={y + h / 2} rx={7} ry={h * 0.32} fill="#fbe3d0" stroke={SKIN_EDGE} strokeWidth="1" />}
    </g>
  );
}

export default function RSVP({ guestName, guestId }: { guestName?: string | null; guestId?: string | null }) {
  const { rsvp } = useInvite();
  const rm = useReducedMotion();

  const [answer, setAnswer] = useState<Answer | null>(() => readSaved(guestName));
  const [status, setStatus] = useState<Status>("idle");
  const [typedName, setTypedName] = useState("");
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState("");
  const [confirmNo, setConfirmNo] = useState(false);
  const [lockedOn, setLockedOn] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const progress = useMotionValue(0);
  const ringScaleX = useTransform(progress, [0.7, 1], [1, 0.34]);
  const glow = useTransform(progress, [0.3, 1], [0, 1]);

  // progress = how far along the track the ring is (0 → 1)
  useEffect(() => {
    return x.on("change", (v) => {
      const max = (trackRef.current?.offsetWidth ?? 1) - (ringRef.current?.offsetWidth ?? 0);
      progress.set(max > 0 ? Math.min(1, Math.max(0, v / max)) : 0);
    });
  }, [x, progress]);

  // auto-dismiss the "are you sure?" state
  useEffect(() => {
    if (!confirmNo) return;
    const t = setTimeout(() => setConfirmNo(false), 3500);
    return () => clearTimeout(t);
  }, [confirmNo]);

  if (!rsvp.enabled) return null;

  const name = (guestName ?? typedName).trim();
  const firstName = name.split(" ")[0];
  const needsName = !guestName;

  async function send(choice: Answer) {
    if (status === "loading") return false;
    if (!name) {
      setStatus("error");
      return false;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guestId ?? undefined,
          name: guestId ? undefined : name,
          attendance: choice,
          guest_count: rsvp.askGuestCount && choice !== "no" ? count : 1,
          message: rsvp.askMessage && message.trim() ? message.trim() : undefined,
        }),
      });
      if (!res.ok) throw new Error("rsvp failed");
      try { localStorage.setItem(storageKey(name), choice); } catch { /* ignore */ }
      setAnswer(choice);
      setStatus("idle");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }

  async function onRingDrop() {
    const max = (trackRef.current?.offsetWidth ?? 1) - (ringRef.current?.offsetWidth ?? 0);
    if (x.get() / max < 0.82) {
      animate(x, 0, { type: "spring", stiffness: 260, damping: 20 }); // slipped off — try again
      return;
    }
    if (!name) {
      animate(x, 0, { type: "spring", stiffness: 260, damping: 20 });
      setStatus("error");
      return;
    }
    setLockedOn(true);
    animate(x, max, { type: "spring", stiffness: 300, damping: 24 });
    try { navigator.vibrate?.([30, 40, 30]); } catch { /* not supported */ }
    const ok = await send("yes");
    if (!ok) {
      setLockedOn(false);
      animate(x, 0, { type: "spring", stiffness: 200, damping: 20 });
    }
  }

  function resetAnswer() {
    try { localStorage.removeItem(storageKey(name)); } catch { /* ignore */ }
    setAnswer(null);
    setLockedOn(false);
    x.set(0);
    progress.set(0);
    setConfirmNo(false);
  }

  /* ───────────────────────── after answering ───────────────────────── */
  if (answer) {
    const copy: Record<Answer, [string, string]> = {
      yes: [`Yay, ${firstName}! 💍`, "Ab pakka — hum aapka intezaar karenge."],
      maybe: [`Theek hai, ${firstName} 🙂`, "Jab pata chale, bas bata dena."],
      no: [`Koi baat nahi, ${firstName}`, "Aap miss honge. 💛"],
    };
    return (
      <section
        id="rsvp"
        aria-label="RSVP"
        style={{
          position: "relative", overflow: "hidden", padding: "72px 24px", textAlign: "center",
          background: "linear-gradient(145deg, #f5edd5 0%, #eee3c0 50%, #f5edd5 100%)",
        }}
      >
        {answer === "yes" && <SectionConfetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{ fontFamily: "var(--font-accent), cursive", fontSize: "clamp(36px, 9vw, 52px)", color: "#8b2234", margin: 0, lineHeight: 1.2 }}>
            {copy[answer][0]}
          </p>
          <p style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", color: "#5c1520", margin: "10px 0 0" }}>
            {copy[answer][1]}
          </p>
          <button
            type="button"
            onClick={resetAnswer}
            style={{
              marginTop: 22, background: "none", border: "none", cursor: "pointer",
              color: "#8c4a56", fontSize: 12, textDecoration: "underline", fontFamily: "var(--font-body), sans-serif",
            }}
          >
            Jawab badalna hai?
          </button>
        </motion.div>
      </section>
    );
  }

  /* ───────────────────────── the ring game ───────────────────────── */
  return (
    <section
      id="rsvp"
      aria-label="RSVP"
      style={{
        position: "relative", overflow: "hidden", padding: "72px 24px 80px", textAlign: "center",
        background: "linear-gradient(145deg, #f5edd5 0%, #eee3c0 50%, #f5edd5 100%)",
      }}
    >
      <p style={{ fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: "#8c4a56", margin: "0 0 10px", fontFamily: "var(--font-body), sans-serif" }}>
        RSVP
      </p>
      <h2 style={{ fontFamily: "var(--font-accent), cursive", fontWeight: 400, fontSize: "clamp(40px, 10vw, 60px)", color: "#8b2234", margin: 0, lineHeight: 1.15 }}>
        Aa rahe ho?
      </h2>
      <p style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", color: "#5c1520", margin: "8px 0 26px", fontSize: 15 }}>
        Ring ko ungli tak slide karo 💍
      </p>

      {needsName && (
        <input
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder="Aapka naam"
          aria-label="Your name"
          style={{
            display: "block", width: "100%", maxWidth: 300, margin: "0 auto 20px", padding: "10px 16px",
            borderRadius: 999, border: "1.5px solid rgba(139,34,52,0.35)", background: "rgba(255,255,255,0.6)",
            textAlign: "center", fontSize: 14, color: "#5c1520", outline: "none", fontFamily: "var(--font-body), sans-serif",
          }}
        />
      )}

      {/* Hand + ring */}
      <div style={{ position: "relative", width: "100%", maxWidth: BW, aspectRatio: `${BW} / ${BH}`, margin: "0 auto" }}>
        <svg viewBox={`0 0 ${BW} ${BH}`} width="100%" height="100%" aria-hidden style={{ position: "absolute", inset: 0 }}>
          {/* palm */}
          <rect x="246" y="6" width="110" height="138" rx="34" fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1.5" />
          {/* fingers pointing left: index, middle, ring (target), pinky */}
          <Finger x={122} y={10} w={140} h={32} />
          <Finger x={98} y={46} w={164} h={34} />
          <Finger x={116} y={82} w={146} h={34} nail />
          <Finger x={150} y={118} w={112} h={26} />
        </svg>

        {/* glow where the ring will sit */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute", left: pctW(TARGET_CX - 30), top: pctH(RING_CY - 34), width: pctW(60), height: pctH(68),
            borderRadius: "50%", opacity: glow,
            background: "radial-gradient(circle, rgba(255,214,107,0.85), rgba(255,160,60,0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Dotted trail hint */}
        {!lockedOn && (
          <div
            aria-hidden
            style={{
              position: "absolute", left: pctW(RING_LEFT + RING + 6), top: pctH(RING_CY - 1), width: pctW(110), height: 0,
              borderTop: "2px dotted rgba(139,34,52,0.45)", pointerEvents: "none",
            }}
          />
        )}

        {/* Slide track — the ring is constrained inside this box */}
        <div
          ref={trackRef}
          style={{ position: "absolute", left: pctW(RING_LEFT), top: pctH(RING_CY - RING / 2), width: pctW(TRACK_W), height: pctH(RING) }}
        >
          <motion.div
            ref={ringRef}
            drag={lockedOn || status === "loading" ? false : "x"}
            dragConstraints={trackRef}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={onRingDrop}
            role="slider"
            aria-label="Slide the ring onto the finger to say yes"
            whileTap={{ scale: 1.06 }}
            animate={rm || lockedOn ? undefined : { rotate: [0, -6, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
            style={{
              x, scaleX: ringScaleX,
              height: "100%", aspectRatio: "1 / 1", borderRadius: "50%", position: "relative",
              cursor: lockedOn ? "default" : "grab", touchAction: "pan-y",
              border: "7px solid transparent",
              background:
                "linear-gradient(#f5edd5,#f5edd5) padding-box, linear-gradient(135deg,#a86c00,#f0c040 40%,#ffe27a 55%,#f0c040 70%,#a86c00) border-box",
              boxShadow: "0 4px 14px rgba(140,100,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.4)",
            }}
          >
            {/* diamond */}
            <span
              aria-hidden
              style={{
                position: "absolute", left: "50%", top: -13, transform: "translateX(-50%) rotate(45deg)",
                width: 13, height: 13, background: "linear-gradient(135deg,#ffffff,#bfe9ff 55%,#7fc8f0)",
                border: "1.5px solid #f0c040", boxShadow: "0 0 10px 2px rgba(190,235,255,0.9)",
              }}
            />
          </motion.div>
        </div>
      </div>

      <p style={{ margin: "14px 0 0", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#8c4a56", fontFamily: "var(--font-body), sans-serif" }}>
        {status === "loading" ? "Saving…" : "slide for yes →"}
      </p>

      {/* Optional extras */}
      <div style={{ maxWidth: 320, margin: "26px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {rsvp.askGuestCount && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: "var(--font-body), sans-serif", color: "#5c1520", fontSize: 13 }}>
            <span>Kitne log (aap sahit)?</span>
            <button type="button" aria-label="Fewer guests" onClick={() => setCount((c) => Math.max(1, c - 1))} style={stepBtn}>−</button>
            <strong style={{ minWidth: 14 }}>{count}</strong>
            <button type="button" aria-label="More guests" onClick={() => setCount((c) => Math.min(rsvp.maxGuestsPerRSVP, c + 1))} style={stepBtn}>+</button>
          </div>
        )}
        {rsvp.askMessage && (
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ek chhoti si wish likho (optional)"
            aria-label="Optional message"
            style={{
              padding: "10px 16px", borderRadius: 999, border: "1.5px solid rgba(139,34,52,0.25)",
              background: "rgba(255,255,255,0.55)", textAlign: "center", fontSize: 13, color: "#5c1520",
              outline: "none", fontFamily: "var(--font-body), sans-serif",
            }}
          />
        )}
      </div>

      {status === "error" && (
        <p role="alert" style={{ color: "#b3261e", fontSize: 13, margin: "16px 0 0" }}>
          {!name ? "Pehle apna naam likho." : "Kuch gadbad ho gayi. Ek baar phir try karo."}
        </p>
      )}

      {/* Quiet alternatives */}
      <div style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 22, fontFamily: "var(--font-body), sans-serif", fontSize: 12 }}>
        <button type="button" onClick={() => send("maybe")} style={linkBtn}>
          Pakka nahi pata
        </button>
        <button
          type="button"
          onClick={() => (confirmNo ? send("no") : setConfirmNo(true))}
          style={{ ...linkBtn, color: confirmNo ? "#b3261e" : "#8c4a56" }}
        >
          {confirmNo ? "Pakka? Dobara tap karo" : "Nahi aa paunga"}
        </button>
      </div>
    </section>
  );
}

const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(139,34,52,0.4)",
  background: "rgba(255,255,255,0.6)", color: "#8b2234", fontSize: 16, lineHeight: 1, cursor: "pointer",
};
const linkBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#8c4a56",
  textDecoration: "underline", padding: 4, fontFamily: "inherit", fontSize: "inherit",
};
