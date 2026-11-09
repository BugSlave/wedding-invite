"use client";

import { useEffect, useState } from "react";
import { getMusicState, subscribeMusic, toggleMusic } from "@/lib/music";

/** Small floating sound button (bottom-left). Hidden if the music file is missing. */
export default function MusicToggle() {
  const [state, setState] = useState({ failed: false, playing: false });

  useEffect(() => {
    const sync = () => setState(getMusicState());
    sync();
    return subscribeMusic(sync);
  }, []);

  if (state.failed) return null;
  const off = !state.playing;

  return (
    <button
      onClick={toggleMusic}
      aria-label={off ? "Play music" : "Mute music"}
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 60,
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "1.5px solid rgba(139,34,52,0.35)",
        background: "rgba(245,237,213,0.92)",
        color: "#8b2234",
        fontSize: 18,
        lineHeight: 1,
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(92,21,32,0.2)",
        backdropFilter: "blur(6px)",
      }}
    >
      {off ? "🔇" : "🎵"}
    </button>
  );
}
