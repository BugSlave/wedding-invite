"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CelebrationOverlay from "./CelebrationOverlay";

const MAX_CW = 268;
const CH = 80;
const BR = 12;

function useScratchWidth() {
  const [cw, setCw] = useState(MAX_CW);
  useEffect(() => {
    const update = () => setCw(Math.min(window.innerWidth - 64, MAX_CW));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cw;
}

interface Props {
  date: string;
  onRevealed?: () => void;
}

export default function ScratchDate({ date, onRevealed }: Props) {
  const CW = useScratchWidth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [celebrationDone, setCelebrationDone] = useState(false);
  const revealedRef = useRef(false);
  const isDown = useRef(false);
  const lastXY = useRef<{ x: number; y: number } | null>(null);
  const tickCount = useRef(0);

  // Draw the scratch overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clip to rounded rect
    ctx.beginPath();
    const r = BR, w = CW, h = CH;
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.arcTo(w, 0, w, r, r);
    ctx.lineTo(w, h - r);
    ctx.arcTo(w, h, w - r, h, r);
    ctx.lineTo(r, h);
    ctx.arcTo(0, h, 0, h - r, r);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    ctx.clip();

    // Gold/marigold gradient base
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   "#C8860A");
    grad.addColorStop(0.35,"#D4AF37");
    grad.addColorStop(0.65,"#E8C84A");
    grad.addColorStop(1,   "#A67208");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Tactile noise texture
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * 0.14;
      ctx.fillStyle =
        Math.random() > 0.5
          ? `rgba(0,0,0,${a})`
          : `rgba(255,255,255,${a * 0.6})`;
      ctx.fillRect(x, y, Math.random() * 2.5 + 0.5, Math.random() * 1.5 + 0.5);
    }

    // Diagonal gloss
    const shine = ctx.createLinearGradient(0, 0, w * 0.6, h);
    shine.addColorStop(0, "rgba(255,255,255,0.22)");
    shine.addColorStop(0.45, "rgba(255,255,255,0.08)");
    shine.addColorStop(0.9, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);

    // Floral border dots along top and bottom edges
    ctx.fillStyle = "rgba(255,255,255,0.30)";
    for (let x2 = 8; x2 < w - 8; x2 += 14) {
      ctx.beginPath(); ctx.arc(x2, 6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x2, h - 6, 2, 0, Math.PI * 2); ctx.fill();
    }

    // Label text
    ctx.fillStyle = "rgba(92,21,32,0.92)";
    ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("❁  SCRATCH TO REVEAL  ❁", w / 2, h / 2 - 7);
    ctx.fillStyle = "rgba(92,21,32,0.60)";
    ctx.font = "9px system-ui, -apple-system, sans-serif";
    ctx.fillText("✦  ✿  ✦  ✿  ✦", w / 2, h / 2 + 10);
  }, [CW]);

  const getXY = (e: PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const doScratch = useCallback((x: number, y: number) => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";

    if (lastXY.current) {
      ctx.beginPath();
      ctx.moveTo(lastXY.current.x, lastXY.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 54;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 27, 0, Math.PI * 2);
      ctx.fill();
    }
    lastXY.current = { x, y };

    // Check reveal threshold every 6 strokes (performance)
    tickCount.current++;
    if (tickCount.current % 6 === 0) {
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      for (let i = 3; i < d.length; i += 4) {
        if (d[i] < 10) transparent++;
      }
      if (transparent / (canvas.width * canvas.height) > 0.55) {
        revealedRef.current = true;
        setRevealed(true);
        onRevealed?.();
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      isDown.current = true;
      lastXY.current = null;
      canvas.setPointerCapture(e.pointerId);
      const { x, y } = getXY(e);
      doScratch(x, y);
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown.current) return;
      const { x, y } = getXY(e);
      doScratch(x, y);
    };
    const onUp = () => {
      isDown.current = false;
      lastXY.current = null;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [doScratch]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Date underneath the scratch layer */}
      <div
        style={{
          width: CW,
          height: CH,
          borderRadius: BR,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #ffffff, #fdf8f0)",
          border: "1.5px solid rgba(139,34,52,0.50)",
          boxShadow: "0 4px 18px rgba(92,21,32,0.12), 0 0 0 3px rgba(139,34,52,0.08)",
          backdropFilter: "blur(4px)",
        }}
      >
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#8b2234",
            marginBottom: 7,
          }}
        >
          ❁ &nbsp; Save the Date &nbsp; ❁
        </p>
        <p
          style={{
            fontFamily: "var(--font-display), serif",
            fontSize: 22,
            fontWeight: 600,
            background: "linear-gradient(135deg, #5c1520, #8b2234, #5c1520)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
          }}
        >
          {date}
        </p>
      </div>

      {/* Canvas scratch overlay */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              style={{
                display: "block",
                width: CW,
                height: CH,
                borderRadius: BR,
                cursor: "crosshair",
                touchAction: "none",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen celebration */}
      <AnimatePresence>
        {revealed && !celebrationDone && (
          <CelebrationOverlay onDone={() => setCelebrationDone(true)} />
        )}
      </AnimatePresence>

      {/* Sparkle burst on reveal */}
      <AnimatePresence>
        {revealed &&
          [
            { x: "-20%", y: "-60%", size: 16, delay: 0,    color: "#8b2234" },
            { x: "110%", y: "-55%", size: 13, delay: 0.08, color: "#6a1828" },
            { x: "45%",  y: "-70%", size: 11, delay: 0.04, color: "#a83040" },
            { x: "-10%", y: "105%", size: 10, delay: 0.1,  color: "#8b2234" },
            { x: "105%", y: "100%", size: 12, delay: 0.06, color: "#6a1828" },
        ].map((s, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], x: s.x, y: s.y }}
              transition={{ duration: 0.65, delay: s.delay, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                fontSize: s.size,
                color: s.color,
                pointerEvents: "none",
                lineHeight: 1,
              }}
            >
              ✦
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}
