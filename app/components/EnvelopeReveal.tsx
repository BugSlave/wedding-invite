"use client";

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useInvite } from "./InviteContext";
import InvitationPage from "./InvitationPage";
import { startMusic } from "@/lib/music";
import ProperName from "./ProperName";

const MAX_W = 460;
const MAX_H = 300;
const ASPECT = MAX_H / MAX_W;

function useEnvelopeSize() {
  const [size, setSize] = useState({ w: MAX_W, h: MAX_H });
  useEffect(() => {
    const update = () => {
      const vw = Math.min(window.innerWidth - 48, MAX_W);
      setSize({ w: vw, h: Math.round(vw * ASPECT) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

const FH_RATIO = 170 / MAX_H;

const PETALS = [
  { left: "3%",  delay: 0,   dur: 10,  color: "#8b2234", size: 9,  rotate: 35  },
  { left: "12%", delay: 2.8, dur: 8.5, color: "#6a1828", size: 7,  rotate: -25 },
  { left: "22%", delay: 1.3, dur: 11,  color: "#a83040", size: 11, rotate: 50  },
  { left: "35%", delay: 3.8, dur: 9,   color: "#8b2234", size: 8,  rotate: -40 },
  { left: "47%", delay: 0.6, dur: 10.5,color: "#C41E3A", size: 10, rotate: 65  },
  { left: "58%", delay: 2.2, dur: 8.5, color: "#6a1828", size: 9,  rotate: -18 },
  { left: "70%", delay: 1.7, dur: 9.5, color: "#a83040", size: 7,  rotate: 55  },
  { left: "82%", delay: 3.2, dur: 8,   color: "#8b2234", size: 10, rotate: -45 },
  { left: "92%", delay: 0.9, dur: 10,  color: "#C41E3A", size: 8,  rotate: 30  },
];

const FLORAL_ROW = ["❀","✿","❁","✾","❋","✾","❁","✿","❀"];

function FloralRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, lineHeight: 1 }}>
      {FLORAL_ROW.map((f, i) => (
        <span key={i} style={{ color: i === 4 ? "#FFB347" : "#F0C040", fontSize: i === 4 ? 17 : 12 }}>{f}</span>
      ))}
    </div>
  );
}

/** The lotus wax seal artwork (58×58). Rendered twice, clipped into two halves. */
function SealFace() {
  return (
    <div
      style={{
        width: 58, height: 58, borderRadius: "50%",
        background: "radial-gradient(circle at 38% 30%, #c04060, #8b2234, #5c1520)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        boxShadow: [
          "0 0 0 3px rgba(212,175,55,0.30)",
          "0 5px 16px rgba(140,100,0,0.55)",
          "0 2px 5px rgba(43,36,32,0.28)",
          "inset 0 1.5px 3px rgba(255,255,255,0.32)",
          "inset 0 -2px 5px rgba(0,0,0,0.22)",
        ].join(", "),
      }}
    >
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 0, bottom: 0, width: "40%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)",
          zIndex: 1,
        }}
      />
      <div style={{
        position: "absolute", inset: 5, borderRadius: "50%",
        border: "1.5px solid rgba(255,240,150,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 22, lineHeight: 1, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>🪷</span>
      </div>
    </div>
  );
}

const BREAK_DISTANCE = 44; // px of drag needed to snap the seal

// A jagged, hand-cracked fault line down the seal (x%, y% of the 58px seal).
// Both halves share these points so they fit together like a real broken seal.
const CRACK: [number, number][] = [
  [49, -25], [49, 0], [56, 13], [44, 25], [57, 38], [45, 52], [55, 66], [46, 80], [52, 100], [52, 125],
];
const crackPts = CRACK.map(([x, y]) => `${x}% ${y}%`).join(", ");
const LEFT_CLIP = `polygon(-30% -25%, ${crackPts}, -30% 125%)`;
const RIGHT_CLIP = `polygon(${crackPts}, 130% 125%, 130% -25%)`;

// Little wax crumbs that pop out when the seal cracks.
const CRUMBS = [
  { dx: -34, dy: -20, s: 6, d: 0 },
  { dx: 30,  dy: -26, s: 5, d: 0.02 },
  { dx: -22, dy: 14,  s: 4, d: 0.04 },
  { dx: 38,  dy: 10,  s: 7, d: 0.01 },
  { dx: -4,  dy: -34, s: 4, d: 0.05 },
  { dx: 12,  dy: 26,  s: 5, d: 0.03 },
  { dx: -40, dy: 2,   s: 4, d: 0.06 },
];

function ScreenCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const flipX = pos === "tr" || pos === "br";
  const flipY = pos === "bl" || pos === "br";
  return (
    <div style={{
      position: "absolute",
      top:    flipY ? undefined : 12,
      bottom: flipY ? 12 : undefined,
      left:   flipX ? undefined : 12,
      right:  flipX ? 12 : undefined,
      lineHeight: 1.5,
      pointerEvents: "none",
      transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    }}>
      <div style={{ display: "flex", gap: 3, fontSize: 13 }}>
        <span style={{ color: "#8b2234" }}>❁</span>
        <span style={{ color: "#6a1828" }}>✿</span>
        <span style={{ color: "#8b2234" }}>❀</span>
      </div>
      <div style={{ fontSize: 11, marginLeft: 3 }}>
        <span style={{ color: "#6a1828" }}>✾</span>
        <span style={{ color: "#8b2234", fontSize: 9 }}> ❋</span>
      </div>
      <div style={{ fontSize: 9, color: "#8b2234", marginLeft: 5 }}>✦</div>
    </div>
  );
}

export default function EnvelopeReveal() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<"envelope" | "hero">("envelope");
  const rm = useReducedMotion();

  // ── Seal-breaking interaction ──
  // split: 0 = intact seal, 1 = fully broken halves.
  const split = useMotionValue(0);
  // Slightly different for each half so it feels like a real, uneven break.
  const leftX = useTransform(split, [0, 1], [0, -26]);
  const leftY = useTransform(split, [0, 1], [0, 5]);
  const leftRot = useTransform(split, [0, 1], [0, -22]);
  const rightX = useTransform(split, [0, 1], [0, 32]);
  const rightY = useTransform(split, [0, 1], [0, 11]);
  const rightRot = useTransform(split, [0, 1], [0, 16]);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragMoved = useRef(0);
  const swallowClick = useRef(false);

  function breakSeal() {
    if (isOpen) return;
    animate(split, 1, { duration: 0.25 });
    setIsOpen(true);
    startMusic();
    try { navigator.vibrate?.([25, 35, 25]); } catch { /* not supported */ }
  }

  function onSealDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isOpen) return;
    swallowClick.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragMoved.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onSealMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const d = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
    dragMoved.current = d;
    split.set(Math.min(d / BREAK_DISTANCE, 1) * 0.8);
    if (d >= BREAK_DISTANCE) {
      dragStart.current = null;
      swallowClick.current = true;
      breakSeal();
    }
  }

  function onSealUp() {
    if (!dragStart.current) return;
    dragStart.current = null;
    if (dragMoved.current > 6 && !isOpen) {
      // Partial drag: spring back, don't treat the release as a tap.
      swallowClick.current = true;
      animate(split, 0, { type: "spring", stiffness: 300, damping: 18 });
    }
  }

  // Auto-transition after envelope open animation completes (~1.4s)
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => setPhase("hero"), 1400);
    return () => clearTimeout(t);
  }, [isOpen]);
  const { couple, mainEvent, additionalEvents } = useInvite();
  const marriageEvent = additionalEvents.find(e => e.id === "marriage");
  const marriageDate = marriageEvent?.date ?? mainEvent.date;
  const marriageVenue = marriageEvent ? `${marriageEvent.venue}, ${marriageEvent.address}` : mainEvent.venue;
  const { w: W, h: H } = useEnvelopeSize();
  const FH = Math.round(H * FH_RATIO);


  return (
    <AnimatePresence mode="wait">
      {phase === "hero" ? (
        <InvitationPage
          key="hero"
          brideName={couple.brideName}
          groomName={couple.groomName}
          date={marriageDate}
          venue={marriageVenue}
        />
      ) : (
        <motion.main
          key="envelope"
          exit={{ opacity: 0, scale: 1.07, filter: "blur(10px)" }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(160deg, #f5edd5 0%, #eee3c0 35%, #e8d8a8 65%, #f5edd5 100%)",
            padding: "24px 24px 60px",
            userSelect: "none",
          }}
        >
          {/* Ambient orbs */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{
              position: "absolute", top: "-8%", left: "-5%", width: "50%", height: "50%", borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(139,34,52,0.08) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", bottom: "-10%", right: "-5%", width: "55%", height: "55%", borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(212,175,55,0.10) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", top: "40%", left: "30%", width: "40%", height: "40%", borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(139,34,52,0.06) 0%, transparent 70%)",
            }} />
          </div>

          {/* Screen corner florals */}
          <ScreenCorner pos="tl" />
          <ScreenCorner pos="tr" />
          <ScreenCorner pos="bl" />
          <ScreenCorner pos="br" />

          {/* Decorative border lines */}
          <div aria-hidden style={{
            position: "absolute", top: 48, left: 16, right: 16, height: 1, pointerEvents: "none",
            background: "linear-gradient(to right, transparent, rgba(139,34,52,0.40), rgba(139,34,52,0.40), transparent)",
          }} />
          <div aria-hidden style={{
            position: "absolute", bottom: 48, left: 16, right: 16, height: 1, pointerEvents: "none",
            background: "linear-gradient(to right, transparent, rgba(139,34,52,0.40), rgba(139,34,52,0.40), transparent)",
          }} />

          {/* Falling petals */}
          {!rm && (
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {PETALS.map((p, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: "absolute", left: p.left, top: "-5%",
                    width: p.size, height: Math.round(p.size * 1.6),
                    borderRadius: "50% 50% 50% 0",
                    background: p.color, opacity: 0,
                  }}
                  animate={{ y: ["0vh", "112vh"], rotate: [p.rotate, p.rotate + 360], opacity: [0, 0.72, 0.72, 0] }}
                  transition={{
                    duration: p.dur, delay: p.delay, repeat: Infinity, repeatDelay: 4,
                    ease: "linear", times: [0, 0.08, 0.88, 1],
                  }}
                />
              ))}
            </div>
          )}

          {/* Top header */}
          <motion.div
            initial={rm ? false : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 44 }}
          >
            <FloralRow />
            <p style={{
                fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase",
                color: "#5c1520", fontFamily: "var(--font-body), sans-serif",
              }}>
                You&rsquo;ve received an invitation
              </p>
            <FloralRow />
          </motion.div>

          {/* Envelope scene */}
          <motion.div
            initial={rm ? false : { opacity: 0, scale: 0.8, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={isOpen ? {} : { scale: 1.018, transition: { duration: 0.3 } }}
            whileTap={isOpen ? {} : { scale: 0.985, transition: { duration: 0.15 } }}
            onClick={() => {
              if (swallowClick.current) { swallowClick.current = false; return; }
              breakSeal();
            }}
            style={{ cursor: isOpen ? "default" : "pointer" }}
          >
            <motion.div
              animate={rm ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
            >
              <div style={{ position: "relative", width: W, height: H, perspective: "1400px" }}>

                {/* Ground shadow */}
                <motion.div
                  animate={{ scaleX: isOpen ? 1.2 : 1, opacity: isOpen ? 0.05 : 0.14 }}
                  transition={{ duration: 0.9 }}
                  style={{
                    position: "absolute", bottom: -34, left: "12%", right: "12%", height: 34,
                    background: "radial-gradient(ellipse, rgba(30,20,10,0.9) 0%, transparent 70%)",
                    filter: "blur(10px)",
                  }}
                />

                {/* Envelope body */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(172deg, #FFFBF0 0%, #FFF5D8 55%, #FFEBB0 100%)",
                  borderRadius: 7,
                  border: "2px solid rgba(212,175,55,0.75)",
                  boxShadow: [
                    "0 2px 3px rgba(43,36,32,0.04)",
                    "0 8px 20px rgba(43,36,32,0.09)",
                    "0 28px 56px rgba(43,36,32,0.11)",
                    "inset 0 1px 0 rgba(255,255,255,0.92)",
                    "0 0 0 5px rgba(212,175,55,0.10)",
                  ].join(", "),
                  overflow: "hidden",
                }}>
                  {/* Fold shading */}
                  <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 0 100%, 50% 50%)", background: "linear-gradient(to right, rgba(200,134,10,0.10), transparent)" }} />
                  <div style={{ position: "absolute", inset: 0, clipPath: "polygon(100% 0, 100% 100%, 50% 50%)", background: "linear-gradient(to left, rgba(200,134,10,0.10), transparent)" }} />
                  <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 100%, 100% 100%, 50% 46%)", background: "linear-gradient(to top, rgba(200,134,10,0.08), transparent)" }} />

                  {/* Envelope corner florals */}
                  {([
                    { top: 5, left: 5 },
                    { top: 5, right: 5, transform: "scaleX(-1)" },
                    { bottom: 5, left: 5, transform: "scaleY(-1)" },
                    { bottom: 5, right: 5, transform: "scale(-1)" },
                  ] as React.CSSProperties[]).map((s, i) => (
                    <div key={i} style={{ position: "absolute", ...s, fontSize: 9, color: "rgba(212,175,55,0.8)", lineHeight: 1 }}>
                      ❁✿❀
                    </div>
                  ))}

                  {/* Names on the envelope front, below the wax seal */}
                  <p style={{
                    position: "absolute", left: 12, right: 12, bottom: Math.round(H * 0.07),
                    margin: 0, textAlign: "center", lineHeight: 1.1, padding: "0.3em 0.15em 0.15em",
                    fontFamily: "var(--font-accent), cursive",
                    fontSize: `clamp(22px, ${(28 / MAX_W) * 100}vw, 28px)`,
                    background: "linear-gradient(135deg, #5c1520 0%, #8b2234 40%, #a83040 50%, #8b2234 60%, #5c1520 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    <ProperName name={couple.groomFullName ?? couple.groomName} /> &amp; <ProperName name={couple.brideFullName ?? couple.brideName} />
                  </p>
                </div>

                {/* Letter card */}
                <motion.div
                  initial={false}
                  animate={isOpen ? { y: -(H * 0.55), opacity: 1, scale: 1 } : { y: 10, opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.8, delay: isOpen ? 0.22 : 0, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute", left: 28, right: 28, bottom: 18, height: H - 42,
                    background: "linear-gradient(160deg, #FFFEF8 0%, #FFFBEE 100%)",
                    borderRadius: 5,
                    border: "2px solid rgba(212,175,55,0.55)",
                    boxShadow: [
                      "0 2px 8px rgba(43,36,32,0.07)",
                      "0 8px 24px rgba(43,36,32,0.09)",
                      "inset 0 0 0 4px rgba(212,175,55,0.07)",
                    ].join(", "),
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "18px 22px", zIndex: 2,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                    {["✦","❁","✿","❀","✿","❁","✦"].map((f, i) => (
                      <span key={i} style={{ color: "#8b2234", fontSize: i === 0 || i === 6 ? 7 : 10, lineHeight: 1 }}>{f}</span>
                    ))}
                  </div>
                  <p style={{
                    fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase",
                    color: "#5c1520", marginBottom: 11, textAlign: "center",
                    fontFamily: "var(--font-body), sans-serif",
                  }}>
                    With love, we invite you
                  </p>
                  <p style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: `clamp(17px, ${(24 / MAX_W) * 100}vw, 24px)`,
                    fontWeight: 600,
                    color: "#5c1520",
                    textAlign: "center", lineHeight: 1.3, margin: 0,
                  }}>
                    {marriageDate}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
                    {["✦","❁","✿","❀","✿","❁","✦"].map((f, i) => (
                      <span key={i} style={{ color: "#8b2234", fontSize: i === 0 || i === 6 ? 7 : 10, lineHeight: 1 }}>{f}</span>
                    ))}
                  </div>
                </motion.div>

                {/* 3-D Flap */}
                <motion.div
                  initial={false}
                  animate={isOpen ? { rotateX: -180 } : { rotateX: 0 }}
                  transition={{ duration: 1.05, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute", top: 0, left: 0, width: W, height: FH,
                    transformOrigin: "top center", transformStyle: "preserve-3d", zIndex: 5,
                  }}
                >
                  <div style={{
                    position: "absolute", inset: 0,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "linear-gradient(168deg, #FFE090 0%, #FFD060 55%, #FFC030 100%)",
                    backfaceVisibility: "hidden",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "linear-gradient(168deg, #FFFBF0 0%, #FFF3D0 100%)",
                    transform: "rotateX(180deg)", backfaceVisibility: "hidden",
                  }} />

                  {/* Pulsing ring */}
                  {!isOpen && (
                    <div style={{ position: "absolute", left: "50%", bottom: -28, transform: "translateX(-50%)", pointerEvents: "none" }}>
                      <motion.div
                        animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: 2.5, ease: "easeInOut" }}
                        style={{ width: 58, height: 58, borderRadius: "50%", border: "2.5px solid rgba(212,175,55,0.7)" }}
                      />
                    </div>
                  )}

                  {/* Lotus wax seal */}
                  <div style={{ position: "absolute", left: "50%", bottom: -28, transform: "translateX(-50%)", zIndex: 7 }}>
                    {/* Drag the seal (or just tap) to break it. Padding enlarges the touch target. */}
                    <div
                      onPointerDown={onSealDown}
                      onPointerMove={onSealMove}
                      onPointerUp={onSealUp}
                      onPointerCancel={onSealUp}
                      role="button"
                      aria-label="Break the seal to open the invitation"
                      style={{
                        padding: 14, margin: -14, position: "relative",
                        touchAction: "none",
                        cursor: isOpen ? "default" : "grab",
                      }}
                    >
                      <motion.div
                        initial={false}
                        animate={isOpen ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: isOpen ? 0.12 : 0 }}
                        style={{ position: "relative", width: 58, height: 58 }}
                      >
                        {/* Left half */}
                        <motion.div
                          style={{
                            position: "absolute", inset: 0,
                            clipPath: LEFT_CLIP,
                            x: leftX, y: leftY, rotate: leftRot, transformOrigin: "10% 90%",
                          }}
                        >
                          <SealFace />
                        </motion.div>
                        {/* Right half */}
                        <motion.div
                          style={{
                            position: "absolute", inset: 0,
                            clipPath: RIGHT_CLIP,
                            x: rightX, y: rightY, rotate: rightRot, transformOrigin: "90% 90%",
                          }}
                        >
                          <SealFace />
                        </motion.div>
                      </motion.div>

                      {/* Wax crumbs popping out when it cracks */}
                      {isOpen && !rm && CRUMBS.map((c, i) => (
                        <motion.span
                          key={i}
                          aria-hidden
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{ x: c.dx, y: [0, c.dy, c.dy + 38], opacity: [1, 1, 0], scale: [1, 1, 0.5] }}
                          transition={{ duration: 0.75, delay: c.d, ease: "easeOut" }}
                          style={{
                            position: "absolute", left: "50%", top: "50%",
                            width: c.s, height: c.s, marginLeft: -c.s / 2, marginTop: -c.s / 2,
                            borderRadius: i % 2 ? "50%" : "35% 65% 55% 45%",
                            background: i % 3 === 0 ? "#c04060" : "#8b2234",
                            pointerEvents: "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Hover ring */}
                {!isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: "absolute", inset: -4, borderRadius: 11,
                      border: "2px solid rgba(212,175,55,0.45)",
                      boxShadow: "0 0 36px rgba(212,175,55,0.14)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom hint */}
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, delay: 2.3 }}
                style={{ marginTop: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#8b2234", fontSize: 11 }}>✦</span>
                  <p style={{
                    fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase",
                    color: "#5c1520", fontFamily: "var(--font-body), sans-serif", fontWeight: 600,
                  }}>
                    break the seal to open
                  </p>
                  <span style={{ color: "#8b2234", fontSize: 11 }}>✦</span>
                </div>
                <div style={{ display: "flex", gap: 5, fontSize: 12 }}>
                  {["❀","✿","❁","✿","❀"].map((f, i) => (
                    <span key={i} style={{ color: "#8b2234" }}>{f}</span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="opening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ marginTop: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span style={{ color: "#8b2234", fontSize: 11 }}>✦</span>
                  <p style={{
                    fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase",
                    color: "#5c1520", fontFamily: "var(--font-body), sans-serif",
                    fontStyle: "italic", fontWeight: 600,
                  }}>
                    Opening your invitation
                  </p>
                  <span style={{ color: "#8b2234", fontSize: 11 }}>✦</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
