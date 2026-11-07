"use client";

import { motion } from "framer-motion";
import { useInvite } from "./InviteContext";

const item = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.6 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Footer() {
  const { couple, mainEvent } = useInvite();

  return (
    <footer
      className="px-6 py-24 text-center"
      style={{ background: "linear-gradient(135deg, #f5edd5 0%, #eee3c0 35%, #e8d8a8 70%, #f5edd5 100%)" }}
    >
      <motion.p {...item(0)} className="font-display text-3xl sm:text-4xl" style={{ color: "#5c1520" }}>
        {couple.groomName}{" "}
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.35, type: "spring", stiffness: 260, damping: 14 }}
          style={{ display: "inline-block", color: "var(--color-primary)" }}
        >
          ❤
        </motion.span>{" "}
        {couple.brideName}
      </motion.p>

      <motion.p {...item(0.18)} className="mt-4" style={{ color: "#8c4a56" }}>
        {mainEvent.date} &middot; {mainEvent.venue}
      </motion.p>

      <motion.p {...item(0.34)} className="font-display mt-10 text-xl text-[var(--color-primary)]">
        See you there?
      </motion.p>
    </footer>
  );
}
