"use client";

import Image from "next/image";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";
import { useInvite } from "./InviteContext";
import StoryChapter from "@/app/components/StoryChapter";

const GOLD = "linear-gradient(135deg, #5c1520 0%, #8b2234 28%, #a83040 50%, #8b2234 72%, #5c1520 100%)";

/* ── Single couple photo circle ─────────────────────────────────────────── */
function CoupleCircle({
  name,
  image,
  side,
}: {
  name: string;
  image?: string;
  side: "left" | "right";
}) {
  const rm   = useReducedMotion();
  const ref  = useRef(null);
  // amount: 0.05 — barely visible pe trigger, mobile ke liye reliable
  const inView = useInView(ref, { once: false, amount: 0.05 });

  const size  = 100;
  const fromX = side === "left" ? -100 : 100;

  return (
    <div
      ref={ref}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
    >
      {/* Outer glow ring — parent ke inView se animate */}
      <motion.div
        initial={rm ? {} : { opacity: 0, x: fromX, scale: 0.72 }}
        animate={
          rm ? {} : inView
            ? { opacity: 1, x: 0, scale: 1 }
            : { opacity: 0, x: fromX, scale: 0.72 }
        }
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width:        `clamp(96px, 25vw, ${size + 16}px)`,
          height:       `clamp(96px, 25vw, ${size + 16}px)`,
          borderRadius: "50%",
          padding:      3,
          background:   "linear-gradient(135deg, #8b2234, #c04060, #8b2234)",
          boxShadow: [
            "0 0 0 6px rgba(139,34,52,0.12)",
            "0 0 32px rgba(139,34,52,0.18)",
            "0 12px 40px rgba(92,21,32,0.25)",
          ].join(", "),
        }}
      >
        {/* Inner circle */}
        <div
          style={{
            width:      "100%",
            height:     "100%",
            borderRadius: "50%",
            overflow:   "hidden",
            position:   "relative",
            background: "linear-gradient(145deg, #f5edd5, #eee3c0)",
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="140px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize:   "clamp(32px, 8vw, 52px)",
                fontWeight: 700,
                background: GOLD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
                lineHeight:  1,
                userSelect:  "none",
              }}
            >
              {name[0]}
            </span>
          )}
        </div>
      </motion.div>

      {/* Name label */}
      <motion.p
        initial={rm ? {} : { opacity: 0, y: 20, scale: 0.85 }}
        animate={
          rm ? {} : inView
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 20, scale: 0.85 }
        }
        transition={{ duration: 0.72, delay: 0.40, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily:           "var(--font-accent), cursive",
          fontSize:             "clamp(20px, 5vw, 38px)",
          fontWeight:           400,
          background:           GOLD,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          backgroundClip:       "text",
          margin:               0,
          filter:               "drop-shadow(0 0 10px rgba(139,34,52,0.15))",
        }}
      >
        {name}
      </motion.p>
    </div>
  );
}

/* ── Center lotus divider between circles ───────────────────────────────── */
function CenterLotus() {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={rm ? {} : { opacity: 0, scale: 0, rotate: -30 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: false, amount: 0.05 }}
      transition={{ duration: 0.75, delay: 0.4, type: "spring", stiffness: 180, damping: 14 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}
    >
      <span style={{ color: "#8b2234", fontSize: 13, lineHeight: 1 }}>✦</span>
      <span style={{ fontSize: 32, lineHeight: 1 }}>🪷</span>
      <span style={{ color: "#8b2234", fontSize: 13, lineHeight: 1 }}>✦</span>
    </motion.div>
  );
}

/* ── Animated section divider lines ─────────────────────────────────────── */
function GoldDivider() {
  const rm = useReducedMotion();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
      <motion.div
        initial={rm ? {} : { width: 0, opacity: 0 }}
        whileInView={{ width: 64, opacity: 1 }}
        viewport={{ once: false, amount: 0.05 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: 1, background: "linear-gradient(to right, transparent, #8b2234)", flexShrink: 0 }}
      />
      <motion.span
        initial={rm ? {} : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.05 }}
        transition={{ duration: 0.4, delay: 0.55, type: "spring", stiffness: 300, damping: 14 }}
        style={{ color: "#8b2234", fontSize: 16, lineHeight: 1, display: "inline-block" }}
      >
        ❁
      </motion.span>
      <motion.div
        initial={rm ? {} : { width: 0, opacity: 0 }}
        whileInView={{ width: 64, opacity: 1 }}
        viewport={{ once: false, amount: 0.05 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: 1, background: "linear-gradient(to left, transparent, #8b2234)", flexShrink: 0 }}
      />
    </div>
  );
}

/* ── Main Story component ────────────────────────────────────────────────── */
export default function Story() {
  const rm = useReducedMotion();
  const inviteData = useInvite();
  const { couple } = inviteData;

  return (
    <div aria-label="Our story">

      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 24px 40px",
          background: "linear-gradient(160deg, #f5edd5 0%, #eee3c0 45%, #f5edd5 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.p
          initial={rm ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: "#8c4a56",
            marginBottom: 14,
            fontFamily: "var(--font-body), sans-serif",
            fontWeight: 700,
          }}
        >
          The Story of
        </motion.p>

        <div style={{ overflow: "hidden" }}>
          <motion.h2
            initial={rm ? false : { y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-accent), cursive",
              fontSize: "clamp(40px, 8vw, 72px)",
              fontWeight: 400,
              background: GOLD,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
              filter: "drop-shadow(0 0 14px rgba(139,34,52,0.18))",
            }}
          >
            {couple.groomName} &amp; {couple.brideName}
          </motion.h2>
        </div>

        <GoldDivider />
      </div>

      {/* ── Couple circles ── */}
      <div
        style={{
          background: "linear-gradient(145deg, #eee3c0 0%, #f5edd5 50%, #e8d8a8 100%)",
          padding: "52px 24px 64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(10px, 5vw, 64px)",
          position: "relative",
        }}
      >
        {/* Subtle center glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "80%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <CoupleCircle name={couple.groomName} image={couple.groomImage} side="left" />
        <CenterLotus />
        <CoupleCircle name={couple.brideName} image={couple.brideImage} side="right" />
      </div>

      {/* Gold separator line before story */}
      <motion.div
        initial={rm ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.05 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 1,
          marginLeft: "10%",
          marginRight: "10%",
          background: "linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)",
          transformOrigin: "center",
        }}
      />

      {/* Story chapters */}
      {inviteData.chapters.map((chapter, i) => (
        <StoryChapter key={chapter.id} chapter={chapter} index={i} />
      ))}
    </div>
  );
}
