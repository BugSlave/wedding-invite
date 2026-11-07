"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WISH_MAX, type Wish } from "@/lib/wishes";

const LEFTS = [3, 52, 20, 56, 9, 40, 30, 50]; // % positions, staggered so cards don't stack
const CYCLE = 20; // seconds for one card to float up

interface Props {
  /** The guest's link id. Without it (e.g. plain localhost) the wall is read-only. */
  guestId?: string | null;
  guestName?: string | null;
}

export default function GuestWall({ guestId, guestName }: Props) {
  const rm = useReducedMotion();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState(false); // this link has already left a wish
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(`/api/wishes${guestId ? `?id=${encodeURIComponent(guestId)}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setWishes(Array.isArray(d.wishes) ? d.wishes : []);
        setDone(Boolean(d.alreadyWished));
        setLoaded(true);
      })
      .catch(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [guestId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending || !guestId) return;
    if (!text.trim()) {
      setError("Pehle wish likho.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guestId, message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.wish) {
        setWishes((w) => [data.wish, ...w]);
        setDone(true);
        setText("");
      } else if (res.status === 409) {
        setDone(true); // already sent from another device
      } else {
        setError(data.error ?? "Kuch gadbad ho gayi. Dobara try karo.");
      }
    } catch {
      setError("Internet check karo aur dobara try karo.");
    } finally {
      setSending(false);
    }
  }

  const canWrite = Boolean(guestId) && !done;
  // nothing to show and nobody can add → hide the section entirely
  if (loaded && wishes.length === 0 && !canWrite) return null;

  const shown = wishes.slice(0, 24);
  const first = guestName?.split(" ")[0];

  return (
    <section
      id="wishes"
      aria-label="Guest wall"
      style={{
        position: "relative",
        padding: "72px 20px 80px",
        background: "linear-gradient(145deg, #f5edd5 0%, #eee3c0 50%, #f5edd5 100%)",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <p style={{ fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: "#8c4a56", margin: "0 0 10px", fontFamily: "var(--font-body), sans-serif" }}>
        Guest wall
      </p>
      <h2 style={{ fontFamily: "var(--font-accent), cursive", fontWeight: 400, fontSize: "clamp(38px, 9vw, 56px)", color: "#8b2234", margin: 0, lineHeight: 1.15 }}>
        Dher saari duaen
      </h2>

      {/* Floating wall */}
      <div
        className="wall-stage"
        style={{
          position: "relative", maxWidth: 520, height: 360, margin: "22px auto 0", overflow: "hidden",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)",
          maskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        {loaded && shown.length === 0 && (
          <p style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", margin: 0, padding: "0 24px", fontFamily: "var(--font-display), serif", fontStyle: "italic", color: "#8c4a56" }}>
            Pehli wish aap likho.
          </p>
        )}

        {shown.map((w, i) => (
          <div
            key={`${w.created_at}-${i}`}
            className="wall-card"
            style={
              {
                left: `${LEFTS[i % LEFTS.length]}%`,
                "--d": `${CYCLE + (i % 4)}s`,
                "--s": `${-(i * CYCLE) / Math.max(shown.length, 4)}s`,
              } as React.CSSProperties
            }
          >
            <b>{w.name}</b>
            <span>{w.message}</span>
          </div>
        ))}

        {!rm &&
          shown.length > 0 &&
          [12, 34, 58, 80, 92].map((l, i) => (
            <span
              key={l}
              aria-hidden
              className="wall-heart"
              style={{ left: `${l}%`, "--d": `${8 + i * 1.5}s`, "--s": `${-i * 2.1}s` } as React.CSSProperties}
            >
              ♥
            </span>
          ))}
      </div>

      {/* Write a wish — one per link */}
      <div style={{ maxWidth: 360, margin: "26px auto 0" }}>
        {done && guestId ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", color: "#5c1520", margin: 0 }}
          >
            {first ? `Shukriya, ${first}!` : "Shukriya!"} Aapki wish wall par pahunch gayi. ♥
          </motion.p>
        ) : canWrite ? (
          <form onSubmit={submit} noValidate>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, WISH_MAX))}
              maxLength={WISH_MAX}
              rows={3}
              placeholder={first ? `${first}, ek chhoti si wish likho…` : "Ek chhoti si wish likho…"}
              aria-label="Your wish"
              style={{
                width: "100%", boxSizing: "border-box", resize: "none", padding: "12px 14px", borderRadius: 14,
                border: "1.5px solid rgba(139,34,52,0.3)", background: "rgba(255,255,255,0.65)", color: "#5c1520",
                fontSize: 14, lineHeight: 1.5, outline: "none", fontFamily: "var(--font-body), sans-serif",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 4px 12px", fontSize: 11, color: "#8c4a56" }}>
              <span>Sirf ek wish bhej sakte ho</span>
              <span>{text.length} / {WISH_MAX}</span>
            </div>
            {error && (
              <p role="alert" style={{ color: "#b3261e", fontSize: 13, margin: "0 0 10px" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 999, border: "none", cursor: sending ? "default" : "pointer",
                background: "#8b2234", color: "#f5edd5", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em",
                opacity: sending ? 0.7 : 1, fontFamily: "var(--font-body), sans-serif",
              }}
            >
              {sending ? "Bhej rahe hain…" : "♥  Wall par bhejo"}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
