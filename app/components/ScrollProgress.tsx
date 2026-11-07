"use client";

import { useScroll, useSpring, motion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 32, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        height:          3,
        background:      "linear-gradient(90deg, #C4613F, #D97757, #E8B4A8, #D97757)",
        backgroundSize:  "200% 100%",
        transformOrigin: "left",
        scaleX,
        zIndex:          9998,
      }}
    >
      {/* Moving shimmer highlight */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 0.6 }}
        style={{
          position:   "absolute",
          inset:      0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
          width:      "40%",
        }}
      />
    </motion.div>
  );
}
