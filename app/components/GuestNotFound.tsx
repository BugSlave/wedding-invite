"use client";

import { motion } from "framer-motion";

export default function GuestNotFound() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f1ea",
        padding: 24,
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display), serif",
          fontSize: "clamp(22px, 5vw, 30px)",
          fontWeight: 500,
          color: "#3a2f2a",
          textAlign: "center",
          margin: 0,
          letterSpacing: "0.01em",
        }}
      >
        You are not invited
      </h1>
    </motion.main>
  );
}
