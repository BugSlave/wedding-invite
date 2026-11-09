"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Heading that slides up out of a mask. The "in view" check is on the masked
 * wrapper: the heading itself starts fully clipped, so the browser would never
 * report it as visible and it would stay hidden.
 */
export function RevealHeading({
  children, style, delay = 0.1,
}: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const rm = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <motion.h2
        initial={rm ? false : { y: "110%" }}
        animate={rm ? undefined : { y: inView ? "0%" : "110%" }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        style={style}
      >
        {children}
      </motion.h2>
    </div>
  );
}

/** Small label + title + heart divider, shared by the invitation sections. */
export default function SectionHeader({ label, title }: { label: string; title: string }) {
  const rm = useReducedMotion();
  const view = { once: false, amount: 0.5 } as const;
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  return (
    <div style={{ textAlign: "center", marginBottom: 44 }}>
      <motion.p
        initial={rm ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={view}
        transition={{ duration: 0.6, ease }}
        style={{
          fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: "#8c4a56",
          marginBottom: 12, fontFamily: "var(--font-body), sans-serif",
        }}
      >
        {label}
      </motion.p>
      <RevealHeading
        style={{
          fontFamily: "var(--font-display), serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 600,
          color: "#5c1520", margin: 0, letterSpacing: "-0.01em",
        }}
      >
        {title}
      </RevealHeading>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
        <div style={{ width: 56, height: 1, background: "linear-gradient(to right, transparent, #8b2234)" }} />
        <span style={{ color: "#8b2234", fontSize: 14, lineHeight: 1 }}>♥</span>
        <div style={{ width: 56, height: 1, background: "linear-gradient(to left, transparent, #8b2234)" }} />
      </div>
    </div>
  );
}
