"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

const COLORS = ["#8b2234", "#D4AF37", "#FF8C00", "#FF4060", "#FFD700", "#C41E3A", "#FF6B1A"];

export default function SectionConfetti() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const firedRef   = useRef(false);
  const isInView   = useInView(triggerRef, { once: true, amount: 0.35 });

  useEffect(() => {
    if (!isInView || firedRef.current) return;
    firedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    // Two burst origins — left & right sides
    const origins = [
      { x: W * 0.15, y: H * 0.45 },
      { x: W * 0.85, y: H * 0.45 },
    ];

    const particles = Array.from({ length: 100 }, (_, i) => {
      const o = origins[i % 2];
      return {
        x:        o.x + (Math.random() - 0.5) * 30,
        y:        o.y + (Math.random() - 0.5) * 30,
        vx:       (Math.random() - 0.5) * 10,
        vy:       -(Math.random() * 9 + 3),
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        w:        Math.random() * 9 + 4,
        h:        Math.random() * 4 + 2,
        rotation: Math.random() * Math.PI * 2,
        rv:       (Math.random() - 0.5) * 0.22,
        opacity:  1,
      };
    });

    const t0 = performance.now();
    const DURATION = 2200;
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - t0) / DURATION, 1);
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.vy       += 0.3;
        p.x        += p.vx;
        p.y        += p.vy;
        p.vx       *= 0.99;
        p.rotation += p.rv;
        p.opacity   = t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (t < 1) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView]);

  return (
    <>
      <div
        ref={triggerRef}
        style={{ position: "absolute", top: "35%", left: 0, right: 0, height: 1, pointerEvents: "none" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position:      "absolute",
          inset:         0,
          width:         "100%",
          height:        "100%",
          pointerEvents: "none",
          zIndex:        5,
        }}
      />
    </>
  );
}
