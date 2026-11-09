"use client";

import { motion, useReducedMotion } from "framer-motion";
import { inviteData } from "@/app/data/invite";

export default function Hero() {
  const { couple, mainEvent } = inviteData;
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(180deg, var(--color-bg-warm), var(--color-bg))" }}
      aria-label="Introduction"
    >
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-4 text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]"
      >
        We are honoured to welcome you to the wedding ceremony of&hellip;
      </motion.p>

      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-6xl"
      >
        {couple.brideFullName ?? couple.brideName}
        <span className="mx-3 text-[var(--color-primary)]">&amp;</span>
        {couple.groomFullName ?? couple.groomName}
      </motion.h1>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-md text-lg text-[var(--color-muted)]"
      >
        are getting engaged &mdash; and we&rsquo;d love for you to be there.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-card)] px-6 py-3 text-sm text-[var(--color-muted)] shadow-[var(--shadow-soft)]"
      >
        {mainEvent.date} &middot; {mainEvent.venue}
      </motion.div>

      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 text-[var(--color-muted)]"
        >
          ↓ scroll for the story
        </motion.div>
      )}
    </section>
  );
}
