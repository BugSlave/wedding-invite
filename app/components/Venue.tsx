"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInvite } from "./InviteContext";
import SectionHeader from "./SectionHeader";

/** "The Venue": the wedding venue with directions and a Google Maps link. */
export default function Venue() {
  const { mainEvent, additionalEvents } = useInvite();
  const rm = useReducedMotion();
  const event = additionalEvents.find((e) => e.id === "marriage") ?? mainEvent;
  const place = `${event.venue}, ${event.address}`;
  const q = encodeURIComponent(place);
  const mapsUrl = event.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${q}`;
  const directionsUrl = event.mapsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;

  return (
    <section
      aria-label="Venue"
      style={{
        padding: "80px 24px 88px",
        background: "linear-gradient(150deg, #eee3c0 0%, #f5edd5 50%, #e8d8a8 100%)",
      }}
    >
      <SectionHeader label="Find us" title="The Venue" />
      <motion.div
        initial={rm ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}
      >
        <p style={{ fontSize: 28, margin: "0 0 10px" }}>📍</p>
        <h3 style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(22px, 4vw, 28px)", color: "#5c1520", margin: 0 }}>
          {event.venue}
        </h3>
        <p style={{ fontSize: 13, color: "#8c4a56", margin: "6px 0 14px", fontFamily: "var(--font-body), sans-serif" }}>{event.address}</p>
        <p style={{ fontSize: 13, color: "#8b2234", margin: "0 0 24px", fontFamily: "var(--font-body), sans-serif", fontWeight: 500 }}>
          {event.date} &nbsp;·&nbsp; {event.time}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="ec-btn-primary" style={{ textDecoration: "none" }}>
            ↗ Get Directions
          </a>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="ec-btn-outline" style={{ textDecoration: "none" }}>
            Open Google Maps
          </a>
        </div>
      </motion.div>
    </section>
  );
}
