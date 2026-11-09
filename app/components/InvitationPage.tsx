"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./HeroSection";
import Story from "./Story";
import Events from "./Events";
import Gallery from "./Gallery";
import ScrollProgress from "./ScrollProgress";
import PetalRain from "./PetalRain";
import ClickHearts from "./ClickHearts";
import CustomCursor from "./CustomCursor";
import MusicToggle from "./MusicToggle";
import Venue from "./Venue";
import Closing from "./Closing";

interface Props {
  brideName: string;
  groomName: string;
  date: string;
  venue: string;
}

export default function InvitationPage(props: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <main>
      <PetalRain />
      <ClickHearts />
      <CustomCursor />
      <ScrollProgress />
      <MusicToggle />
      <HeroSection {...props} onRevealed={() => setRevealed(true)} />
      <AnimatePresence>
        {revealed && (
          <motion.div
            key="below-fold"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Story />
            <Events />
            <Gallery />
            <Venue />
            <Closing />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
