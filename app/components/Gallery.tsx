"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useInvite } from "./InviteContext";
import { GalleryPhoto } from "@/types/invite";
import BackgroundOrbs from "@/app/components/BackgroundOrbs";

/* ─── placeholder slot ────────────────────────────────────────────────────── */

function Placeholder({ caption }: { caption?: string }) {
  return (
    <div style={{
      width:          "100%",
      height:         "100%",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            10,
      background:     "linear-gradient(135deg, rgba(245,237,213,0.9) 0%, rgba(238,227,192,0.95) 100%)",
      border:         "1.5px dashed rgba(212,175,55,0.35)",
      borderRadius:   "inherit",
    }}>
      <span style={{ fontSize: 28, opacity: 0.55 }}>📷</span>
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontSize:      11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color:         "#8c4a56",
          margin:        0,
          fontFamily:    "var(--font-body), sans-serif",
        }}>
          Photo coming soon
        </p>
        {caption && (
          <p style={{
            fontSize:   12,
            color:      "#D4A870",
            margin:     "5px 0 0",
            fontFamily: "var(--font-body), sans-serif",
          }}>
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── single photo card ───────────────────────────────────────────────────── */

function PhotoCard({
  photo,
  delay = 0,
  index = 0,
  style,
}: {
  photo: GalleryPhoto;
  delay?: number;
  index?: number;
  style?: React.CSSProperties;
}) {
  const rm = useReducedMotion();
  const rotate = index % 2 === 0 ? -3 : 3;

  return (
    <motion.div
      initial={rm ? {} : { opacity: 0, scale: 0.88, rotate, filter: "blur(10px)" }}
      whileInView={rm ? {} : { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      style={{
        position:     "relative",
        overflow:     "hidden",
        borderRadius: 18,
        boxShadow:    "0 6px 28px rgba(43,36,32,0.10)",
        cursor:       "default",
        ...style,
      }}
    >
      {photo.src ? (
        /* Real photo */
        <>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 600px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
          />
          {/* Caption overlay on hover */}
          {photo.caption && (
            <div style={{
              position:   "absolute",
              bottom:     0,
              left:       0,
              right:      0,
              padding:    "28px 18px 16px",
              background: "linear-gradient(to top, rgba(43,36,32,0.64) 0%, transparent 100%)",
            }}>
              <p style={{
                color:         "#fff",
                fontSize:      12,
                letterSpacing: "0.12em",
                margin:        0,
                fontFamily:    "var(--font-body), sans-serif",
              }}>
                {photo.caption}
              </p>
            </div>
          )}
        </>
      ) : (
        <Placeholder caption={photo.caption} />
      )}
    </motion.div>
  );
}

/* ─── main section ────────────────────────────────────────────────────────── */

export default function Gallery() {
  const inviteData = useInvite();
  const { gallery } = inviteData;
  const rm = useReducedMotion();
  const photos = gallery.slice(0, 4);

  if (photos.length === 0) return null;

  // Every photo has a known aspect ratio → show them whole (no cropping).
  const uncropped = photos.every((p) => p.src && p.aspect);

  return (
    <section
      aria-label="Photo gallery"
      style={{
        background: "linear-gradient(145deg, #f5edd5 0%, #eee3c0 25%, #f0e5c8 60%, #f5edd5 100%)",
        padding:    "80px 24px 88px",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <BackgroundOrbs orbs={[
        { w: 450, h: 450, top: "-10%",  right: "-8%", color: "rgba(139,34,52,0.06)",  blur: 90,  duration: 16, delay: 0, dx: -70, dy: 50  },
        { w: 350, h: 350, bottom: "-8%",left: "-6%",  color: "rgba(212,175,55,0.08)", blur: 85,  duration: 20, delay: 3, dx: 60,  dy: -40 },
        { w: 260, h: 260, top: "45%",   left: "45%",  color: "rgba(139,34,52,0.05)",  blur: 75,  duration: 13, delay: 1, dx: -40, dy: 60  },
      ]} />

      {/* ── Header ── */}
      <motion.div
        initial={rm ? {} : { opacity: 0, y: 24 }}
        whileInView={rm ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <p style={{
          fontSize:      10,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color:         "#8c4a56",
          marginBottom:  12,
          fontFamily:    "var(--font-body), sans-serif",
        }}>
          Captured Moments
        </p>
        <h2 style={{
          fontFamily:    "var(--font-display), serif",
          fontSize:      "clamp(28px, 5vw, 46px)",
          fontWeight:    600,
          color:         "#5c1520",
          margin:        0,
          letterSpacing: "-0.01em",
        }}>
          {inviteData.couple.groomFullName ?? inviteData.couple.groomName} &amp; {inviteData.couple.brideFullName ?? inviteData.couple.brideName}
        </h2>
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            10,
          marginTop:      18,
        }}>
          <div style={{ height: 1, width: 56, background: "linear-gradient(to right, transparent, #8b2234)" }} />
          <span style={{ color: "#8b2234", fontSize: 14, lineHeight: 1 }}>♥</span>
          <div style={{ height: 1, width: 56, background: "linear-gradient(to left, transparent, #8b2234)" }} />
        </div>
      </motion.div>

      {/* ── Grid ── */}
      {/*
        Desktop layout (≥ 600px):
          col 1 (wider)  col 2 (narrower)
          ┌────────┬────────┐
          │        │  p2    │  row 1 — 210px
          │  p1    ├────────┤
          │        │  p3    │  row 2 — 210px
          ├────────┴────────┤
          │       p4        │  row 3 — 220px
          └─────────────────┘
      */}
      {uncropped ? (
        <div
          className="gallery-flex"
          style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 12 }}
        >
          {photos.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              delay={i * 0.1}
              index={i}
              style={{ "--aspect": photo.aspect } as React.CSSProperties}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            maxWidth: 820,
            margin:   "0 auto",
            display:  "grid",
            gap:      12,
            gridTemplateColumns: "1fr",
            gridTemplateRows:    `repeat(${photos.length}, 260px)`,
          }}
          className={photos.length === 4 ? "gallery-grid" : undefined}
        >
          {photos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} delay={i * 0.1} index={i} />
          ))}
        </div>
      )}

    </section>
  );
}
