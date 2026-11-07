"use client";

import { motion, useReducedMotion } from "framer-motion";

export type OrbDef = {
  w: number; h: number;
  top?: string; left?: string; right?: string; bottom?: string;
  color: string;
  blur?: number;
  duration: number;
  delay?: number;
  dx?: number; dy?: number;
};

export default function BackgroundOrbs({ orbs }: { orbs: OrbDef[] }) {
  const rm = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0,
        overflow: "hidden", pointerEvents: "none", zIndex: 0,
      }}
    >
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          animate={rm ? {} : {
            x: [0, o.dx ?? 0, -(o.dx ?? 0) * 0.4, 0],
            y: [0, o.dy ?? 0, (o.dy ?? 0) * 0.6, 0],
          }}
          transition={{
            duration: o.duration,
            delay: o.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position:     "absolute",
            top:          o.top,
            left:         o.left,
            right:        o.right,
            bottom:       o.bottom,
            width:        o.w,
            height:       o.h,
            borderRadius: "50%",
            background:   o.color,
            filter:       `blur(${o.blur ?? 70}px)`,
            willChange:   "transform",
          }}
        />
      ))}
    </div>
  );
}
