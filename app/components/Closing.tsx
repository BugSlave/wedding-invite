"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInvite } from "./InviteContext";

/** "Sharing the joy": closing section, shown only when names are provided. */
export default function Closing() {
  const { sharingTheJoy } = useInvite();
  const rm = useReducedMotion();
  if (!sharingTheJoy?.length) return null;

  return (
    <section
      aria-label="Sharing the joy"
      style={{
        padding: "72px 24px 88px",
        textAlign: "center",
        background: "linear-gradient(135deg, #f5edd5 0%, #eee3c0 40%, #e8d8a8 75%, #f5edd5 100%)",
      }}
    >
      <motion.div
        initial={rm ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 520, margin: "0 auto" }}
      >
        <p style={{ fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: "#8c4a56", margin: "0 0 12px", fontFamily: "var(--font-body), sans-serif" }}>
          Sharing the joy
        </p>
        <p style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", fontSize: "clamp(15px, 2.2vw, 18px)", lineHeight: 1.9, color: "#5c1520", margin: 0 }}>
          {sharingTheJoy.join(", ")}
        </p>
      </motion.div>
    </section>
  );
}
