"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf: number;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!cursorRef.current) return;
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursorRef.current.style.opacity = "1";
      });
    };
    const onLeave = () => { if (cursorRef.current) cursorRef.current.style.opacity = "0"; };
    const onEnter = () => { if (cursorRef.current) cursorRef.current.style.opacity = "1"; };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <>
      <style>{`@media (pointer: fine) { *, *::before, *::after { cursor: none !important; } }`}</style>
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          opacity: 0,
          transition: "opacity 0.15s",
          willChange: "transform",
        }}
      >
        <span style={{
          display: "block",
          transform: "translate(-50%, -50%) rotate(-15deg)",
          fontSize: 22,
          lineHeight: 1,
          userSelect: "none",
          filter: "drop-shadow(0 2px 6px rgba(139,34,52,0.4))",
        }}>
          🌸
        </span>
      </div>
    </>
  );
}
