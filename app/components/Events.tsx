"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInvite } from "./InviteContext";
import EventCard from "@/app/components/EventCard";
import BackgroundOrbs from "@/app/components/BackgroundOrbs";
import SectionConfetti from "@/app/components/SectionConfetti";
import { RevealHeading } from "@/app/components/SectionHeader";

export default function Events() {
  const { mainEvent, additionalEvents } = useInvite();
  const rm = useReducedMotion();

  return (
    <section
      aria-label="Event details"
      style={{
        background: "linear-gradient(150deg, #f5edd5 0%, #eee3c0 30%, #e8d8a8 55%, #eee3c0 80%, #f5edd5 100%)",
        padding:    "80px 24px 88px",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <SectionConfetti />
      <BackgroundOrbs orbs={[
        { w: 500, h: 500, top: "-15%",  left: "-10%", color: "rgba(139,34,52,0.06)",  blur: 110, duration: 18, delay: 0, dx: 80,  dy: 60  },
        { w: 420, h: 420, bottom: "-5%",right: "-8%", color: "rgba(212,175,55,0.10)", blur: 95,  duration: 14, delay: 2, dx: -60, dy: -50 },
        { w: 350, h: 350, top: "35%",   left: "35%",  color: "rgba(139,34,52,0.07)",  blur: 90,  duration: 20, delay: 5, dx: 50,  dy: 40  },
        { w: 280, h: 280, top: "10%",   right: "10%", color: "rgba(212,175,55,0.08)", blur: 80,  duration: 16, delay: 3, dx: -40, dy: 50  },
      ]} />

      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <motion.p
          initial={rm ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize:      10,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color:         "#8c4a56",
            marginBottom:  12,
            fontFamily:    "var(--font-body), sans-serif",
          }}
        >
          Mark Your Calendar
        </motion.p>

        <RevealHeading
          style={{
            fontFamily:    "var(--font-display), serif",
            fontSize:      "clamp(28px, 5vw, 46px)",
            fontWeight:    600,
            color:         "#5c1520",
            margin:        0,
            letterSpacing: "-0.01em",
          }}
        >
          Join the Celebration
        </RevealHeading>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
          <motion.div
            initial={rm ? false : { width: 0, opacity: 0 }}
            whileInView={{ width: 56, opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: 1, background: "linear-gradient(to right, transparent, #8b2234)", flexShrink: 0 }}
          />
          <motion.span
            initial={rm ? false : { scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.4, delay: 0.55, type: "spring", stiffness: 300, damping: 14 }}
            style={{ color: "#8b2234", fontSize: 14, lineHeight: 1, display: "inline-block" }}
          >
            ♥
          </motion.span>
          <motion.div
            initial={rm ? false : { width: 0, opacity: 0 }}
            whileInView={{ width: 56, opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: 1, background: "linear-gradient(to left, transparent, #8b2234)", flexShrink: 0 }}
          />
        </div>
      </div>

      <div style={{
        maxWidth:      640,
        margin:        "0 auto",
        display:       "flex",
        flexDirection: "column",
        gap:           28,
      }}>
        <EventCard event={mainEvent} featured delay={0} />

        {additionalEvents.map((event, i) => (
          <EventCard
            key={event.id}
            event={event}
            delay={0.12 + i * 0.12}
          />
        ))}
      </div>
    </section>
  );
}
