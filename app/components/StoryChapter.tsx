"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";
import { StoryChapter as StoryChapterType } from "@/types/invite";

const moodConfig: Record<
  StoryChapterType["mood"],
  { bg: string; accent: string; align: "center" | "left" }
> = {
  curious:     { bg: "linear-gradient(150deg, #f5edd5 0%, #eee3c0 40%, #f5edd5 100%)", accent: "#8b2234", align: "center" },
  playful:     { bg: "linear-gradient(150deg, #eee3c0 0%, #f5edd5 50%, #e8d8a8 100%)", accent: "#6a1828", align: "left"   },
  comedic:     { bg: "linear-gradient(150deg, #f5edd5 0%, #eae0c8 55%, #f5edd5 100%)", accent: "#8b2234", align: "left"   },
  romantic:    { bg: "linear-gradient(150deg, #f0e8d5 0%, #f5edd5 35%, #eee3c0 100%)", accent: "#6a1828", align: "center" },
  emotional:   { bg: "linear-gradient(150deg, #eee3c0 0%, #f5edd5 45%, #f0e5c8 100%)", accent: "#8b2234", align: "center" },
  celebratory: { bg: "linear-gradient(150deg, #f5edd5 0%, #eee3c0 50%, #e8d8a8 100%)", accent: "#6a1828", align: "center" },
};

export default function StoryChapter({
  chapter,
  index,
}: {
  chapter: StoryChapterType;
  index: number;
}) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  const isInView = useInView(ref, { once: false, amount: 0.22 });
  const cfg = moodConfig[chapter.mood];
  const paragraphs = chapter.body.split("\n\n");
  const isEven = index % 2 === 0;

  const popup = (delay: number) => ({
    initial: rm ? {} : { opacity: 0, y: 52, scale: 0.88 },
    animate: rm
      ? {}
      : isInView
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 52, scale: 0.88 },
    transition: {
      duration: 0.85,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  return (
    <section
      ref={ref}
      aria-labelledby={`chapter-${chapter.id}-title`}
      style={{
        background: cfg.bg,
        padding: "88px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large faded chapter number — scales in as section enters view */}
      <motion.div
        aria-hidden="true"
        initial={rm ? {} : { opacity: 0, scale: 0.6, y: 40 }}
        animate={rm ? {} : isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 40 }}
        transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          [isEven ? "right" : "left"]: "-0.05em",
          top: "50%",
          translateY: "-50%",
          fontSize: "clamp(140px, 22vw, 260px)",
          fontFamily: "var(--font-display), serif",
          fontWeight: 700,
          color: "rgba(217,119,87,0.055)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {chapter.chapterNumber}
      </motion.div>

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          textAlign: cfg.align,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Chapter label */}
        <motion.p
          {...popup(0)}
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: cfg.accent,
            marginBottom: 14,
            fontFamily: "var(--font-body), sans-serif",
            fontWeight: 700,
          }}
        >
          Chapter {chapter.chapterNumber}
        </motion.p>

        {/* Title */}
        <motion.h2
          {...popup(0.1)}
          id={`chapter-${chapter.id}-title`}
          style={{
            fontFamily: "var(--font-display), serif",
            fontSize: "clamp(26px, 4.5vw, 42px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: "#5c1520",
            lineHeight: 1.2,
            marginBottom: 26,
            letterSpacing: "-0.01em",
          }}
        >
          {chapter.title}
        </motion.h2>

        {/* Ornament divider */}
        <motion.div
          initial={rm ? {} : { opacity: 0, y: 30, scale: 0.8 }}
          animate={
            rm
              ? {}
              : isInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 30, scale: 0.8 }
          }
          transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: cfg.align === "center" ? "center" : "flex-start",
            gap: 10,
            marginBottom: 30,
            transformOrigin: cfg.align === "center" ? "center" : "left",
          }}
        >
          <div
            style={{
              height: 1,
              width: 48,
              background: `linear-gradient(to right, transparent, ${cfg.accent})`,
            }}
          />
          <span style={{ color: cfg.accent, fontSize: 13, lineHeight: 1 }}>
            ♥
          </span>
          <div
            style={{
              height: 1,
              width: 48,
              background: `linear-gradient(to left, transparent, ${cfg.accent})`,
            }}
          />
        </motion.div>

        {/* Body paragraphs — each staggered */}
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            {...popup(0.3 + i * 0.09)}
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              lineHeight: 2.0,
              color: "#5c1520",
              marginBottom: i < paragraphs.length - 1 ? 20 : 0,
              fontFamily: "var(--font-body), sans-serif",
              fontWeight: 400,
            }}
          >
            {p}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
