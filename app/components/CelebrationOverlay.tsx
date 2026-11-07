"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  onDone: () => void;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  w: number; h: number;
  rotation: number; rv: number;
  opacity: number;
  shape: 0 | 1 | 2; // 0=rect  1=circle  2=triangle
}

const COLORS = [
  "#D97757", "#E8B4A8", "#9CAF88",
  "#F4C5A8", "#EDB096", "#FFD680",
  "#C4613F", "#FFF1E6", "#B8D4A8",
];

const HEARTS = [
  { left: "10%", size: 44, delay: 0.05, color: "#D97757"  },
  { left: "28%", size: 60, delay: 0.18, color: "#E8B4A8"  },
  { left: "50%", size: 50, delay: 0,    color: "#D97757"  },
  { left: "70%", size: 56, delay: 0.22, color: "#E8B4A8"  },
  { left: "88%", size: 42, delay: 0.12, color: "#9CAF88"  },
];

export default function CelebrationOverlay({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use ref so the effect closure always sees the latest callback
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const TOTAL    = 200;
    const DURATION = 3800; // ms

    // Three launch origins: left, centre, right
    const origins = [
      { x: W * 0.15, y: H * 0.5  },
      { x: W * 0.5,  y: H * 0.52 },
      { x: W * 0.85, y: H * 0.5  },
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < TOTAL; i++) {
      const o = origins[i % origins.length];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 5;
      particles.push({
        x:        o.x + (Math.random() - 0.5) * 50,
        y:        o.y + (Math.random() - 0.5) * 50,
        vx:       Math.cos(angle) * speed,
        vy:       Math.sin(angle) * speed - Math.random() * 7, // upward bias
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        w:        Math.random() * 11 + 5,
        h:        Math.random() * 5  + 3,
        rotation: Math.random() * Math.PI * 2,
        rv:       (Math.random() - 0.5) * 0.26,
        opacity:  1,
        shape:    ([0, 0, 1, 2] as const)[Math.floor(Math.random() * 4)],
      });
    }

    const t0 = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - t0) / DURATION, 1);
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.vy        += 0.32;   // gravity
        p.x         += p.vx;
        p.y         += p.vy;
        p.vx        *= 0.992;  // air resistance
        p.rotation  += p.rv;
        // fade out in last 25 %
        p.opacity = t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 0) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.w / 2);
          ctx.lineTo( p.w / 2,  p.w / 2);
          ctx.lineTo(-p.w / 2,  p.w / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onDoneRef.current();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9999,
        pointerEvents: "none",
        overflow:      "hidden",
      }}
    >
      {/* Canvas confetti */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width:  "100%",
          height: "100%",
        }}
      />

      {/* Warm flash at burst */}
      <motion.div
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 52%, rgba(255,228,196,0.9) 0%, transparent 62%)",
        }}
      />

      {/* Big floating hearts */}
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: "62vh", scale: 0 }}
          animate={{ opacity: [0, 1, 0.75, 0], y: "-8vh", scale: [0, 1.25, 1] }}
          transition={{
            duration: 2.8,
            delay:    h.delay,
            ease:     [0.22, 1, 0.36, 1],
          }}
          style={{
            position:  "absolute",
            left:      h.left,
            bottom:    0,
            fontSize:  h.size,
            color:     h.color,
            lineHeight: 1,
            filter:    "drop-shadow(0 6px 14px rgba(217,119,87,0.38))",
          }}
        >
          ♥
        </motion.span>
      ))}

    </motion.div>
  );
}
