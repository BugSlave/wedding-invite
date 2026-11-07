"use client";

import { motion, useReducedMotion } from "framer-motion";

// Three "lanes" per horizontal position + extra mid-positions for higher density
const PETALS = [
  { left: "2%",  delay: 0,    dur: 11,  color: "#FF8C00", size: 9,  rotate: 35  },
  { left: "2%",  delay: 3.5,  dur: 11,  color: "#C41E3A", size: 7,  rotate: -20 },
  { left: "2%",  delay: 7.5,  dur: 12,  color: "#FFB300", size: 8,  rotate: 50  },
  { left: "6%",  delay: 2,    dur: 10,  color: "#FF4060", size: 8,  rotate: -30 },
  { left: "6%",  delay: 6.5,  dur: 11,  color: "#FFD700", size: 10, rotate: 45  },
  { left: "9%",  delay: 2.5,  dur: 12,  color: "#FFB300", size: 8,  rotate: 50  },
  { left: "9%",  delay: 5.5,  dur: 10,  color: "#FF6B1A", size: 10, rotate: -35 },
  { left: "9%",  delay: 9,    dur: 11,  color: "#FF8C00", size: 7,  rotate: 25  },
  { left: "13%", delay: 1.5,  dur: 11,  color: "#C41E3A", size: 9,  rotate: -50 },
  { left: "13%", delay: 7,    dur: 10,  color: "#FF4060", size: 7,  rotate: 60  },
  { left: "17%", delay: 1,    dur: 10,  color: "#FF4060", size: 9,  rotate: 60  },
  { left: "17%", delay: 4.5,  dur: 12,  color: "#FFD700", size: 7,  rotate: -45 },
  { left: "17%", delay: 8.5,  dur: 11,  color: "#FF8C00", size: 10, rotate: 30  },
  { left: "21%", delay: 3,    dur: 11,  color: "#FFB300", size: 8,  rotate: -25 },
  { left: "21%", delay: 8,    dur: 10,  color: "#C41E3A", size: 9,  rotate: 55  },
  { left: "25%", delay: 4,    dur: 11,  color: "#FF8C00", size: 11, rotate: 30  },
  { left: "25%", delay: 6.5,  dur: 10,  color: "#C41E3A", size: 8,  rotate: -55 },
  { left: "25%", delay: 9.5,  dur: 12,  color: "#FF4060", size: 7,  rotate: 40  },
  { left: "29%", delay: 1,    dur: 10,  color: "#FFD700", size: 9,  rotate: -40 },
  { left: "29%", delay: 5.5,  dur: 12,  color: "#FF6B1A", size: 8,  rotate: 55  },
  { left: "33%", delay: 2,    dur: 12,  color: "#FFB300", size: 9,  rotate: 45  },
  { left: "33%", delay: 5,    dur: 11,  color: "#FF6B1A", size: 7,  rotate: -25 },
  { left: "33%", delay: 8.5,  dur: 10,  color: "#FF8C00", size: 10, rotate: 60  },
  { left: "37%", delay: 3.5,  dur: 11,  color: "#C41E3A", size: 8,  rotate: -50 },
  { left: "37%", delay: 7.5,  dur: 12,  color: "#FFD700", size: 9,  rotate: 35  },
  { left: "41%", delay: 0.5,  dur: 10,  color: "#FF4060", size: 10, rotate: 55  },
  { left: "41%", delay: 4,    dur: 12,  color: "#FFD700", size: 8,  rotate: -40 },
  { left: "41%", delay: 7.5,  dur: 11,  color: "#FF6B1A", size: 7,  rotate: 30  },
  { left: "45%", delay: 2,    dur: 10,  color: "#FF8C00", size: 9,  rotate: -35 },
  { left: "45%", delay: 6,    dur: 11,  color: "#C41E3A", size: 10, rotate: 50  },
  { left: "50%", delay: 3,    dur: 11,  color: "#FF8C00", size: 9,  rotate: 35  },
  { left: "50%", delay: 6,    dur: 10,  color: "#C41E3A", size: 11, rotate: -20 },
  { left: "50%", delay: 9.5,  dur: 12,  color: "#FF4060", size: 7,  rotate: 55  },
  { left: "54%", delay: 1.5,  dur: 11,  color: "#FFB300", size: 8,  rotate: -45 },
  { left: "54%", delay: 7,    dur: 10,  color: "#FFD700", size: 9,  rotate: 30  },
  { left: "58%", delay: 1.5,  dur: 12,  color: "#FFB300", size: 7,  rotate: 50  },
  { left: "58%", delay: 4.5,  dur: 11,  color: "#FF6B1A", size: 9,  rotate: -60 },
  { left: "58%", delay: 8,    dur: 10,  color: "#FF8C00", size: 8,  rotate: 35  },
  { left: "62%", delay: 2.5,  dur: 11,  color: "#C41E3A", size: 10, rotate: -30 },
  { left: "62%", delay: 7,    dur: 12,  color: "#FF4060", size: 7,  rotate: 50  },
  { left: "66%", delay: 4.5,  dur: 10,  color: "#FF4060", size: 10, rotate: 40  },
  { left: "66%", delay: 7,    dur: 12,  color: "#FFD700", size: 8,  rotate: -30 },
  { left: "66%", delay: 9,    dur: 11,  color: "#FF6B1A", size: 9,  rotate: 55  },
  { left: "70%", delay: 1,    dur: 10,  color: "#FFB300", size: 8,  rotate: -50 },
  { left: "70%", delay: 5.5,  dur: 11,  color: "#FF8C00", size: 7,  rotate: 35  },
  { left: "74%", delay: 2.5,  dur: 11,  color: "#FF8C00", size: 9,  rotate: 65  },
  { left: "74%", delay: 5.5,  dur: 10,  color: "#C41E3A", size: 7,  rotate: -45 },
  { left: "74%", delay: 9,    dur: 12,  color: "#FFD700", size: 10, rotate: 30  },
  { left: "78%", delay: 3,    dur: 12,  color: "#FF4060", size: 9,  rotate: -35 },
  { left: "78%", delay: 7.5,  dur: 10,  color: "#FF6B1A", size: 8,  rotate: 55  },
  { left: "82%", delay: 1,    dur: 12,  color: "#FFB300", size: 10, rotate: 30  },
  { left: "82%", delay: 4,    dur: 11,  color: "#FF6B1A", size: 8,  rotate: -55 },
  { left: "82%", delay: 8,    dur: 10,  color: "#C41E3A", size: 7,  rotate: 45  },
  { left: "86%", delay: 2,    dur: 11,  color: "#FF8C00", size: 9,  rotate: -40 },
  { left: "86%", delay: 6.5,  dur: 12,  color: "#FFD700", size: 8,  rotate: 60  },
  { left: "90%", delay: 3.5,  dur: 10,  color: "#FF4060", size: 9,  rotate: 50  },
  { left: "90%", delay: 6,    dur: 12,  color: "#FFD700", size: 7,  rotate: -25 },
  { left: "90%", delay: 9.5,  dur: 11,  color: "#FF6B1A", size: 10, rotate: 35  },
  { left: "94%", delay: 1.5,  dur: 10,  color: "#C41E3A", size: 8,  rotate: -55 },
  { left: "94%", delay: 6,    dur: 12,  color: "#FFB300", size: 9,  rotate: 40  },
  { left: "97%", delay: 0,    dur: 11,  color: "#FF8C00", size: 10, rotate: 40  },
  { left: "97%", delay: 3.5,  dur: 10,  color: "#C41E3A", size: 8,  rotate: -35 },
  { left: "97%", delay: 7,    dur: 12,  color: "#FF4060", size: 7,  rotate: 55  },
];

// Show every Nth petal: 1 = all (~62), 2 = half (~31), 3 = a third (~21).
const PETAL_STEP = 2;

export default function PetalRain() {
  const rm = useReducedMotion();
  if (rm) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {PETALS.filter((_, i) => i % PETAL_STEP === 0).map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: "-8%",
            width: p.size,
            height: Math.round(p.size * 1.6),
            borderRadius: "50% 50% 50% 0",
            background: p.color,
            opacity: 0,
          }}
          animate={{
            y: ["0vh", "115vh"],
            rotate: [p.rotate, p.rotate + 360],
            opacity: [0, 0.70, 0.70, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 0,
            ease: "linear",
            times: [0, 0.07, 0.90, 1],
          }}
        />
      ))}
    </div>
  );
}
