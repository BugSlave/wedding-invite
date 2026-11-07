"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Heart {
  id: number;
  x: number;
  y: number;
  char: string;
  size: number;
  dx: number;
}

const CHARS = ["❤", "🌸", "💕", "✿", "🌺", "💗"];

export default function ClickHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  const spawn = useCallback((x: number, y: number) => {
    const newHearts: Heart[] = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      size: 18 + Math.random() * 14,
      dx: (Math.random() - 0.5) * 50,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    const ids = new Set(newHearts.map(h => h.id));
    setTimeout(() => setHearts(prev => prev.filter(h => !ids.has(h.id))), 1100);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => spawn(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) spawn(t.clientX, t.clientY);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouch);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [spawn]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9997 }}>
      <AnimatePresence>
        {hearts.map(h => (
          <motion.span
            key={h.id}
            initial={{ opacity: 1, y: 0, x: 0, scale: 0.4 }}
            animate={{ opacity: 0, y: -85, x: h.dx, scale: 1.1 }}
            exit={{}}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: h.x,
              top: h.y,
              fontSize: h.size,
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
              transform: "translate(-50%, -50%)",
            }}
          >
            {h.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
