"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./HeroSection";
import Story from "./Story";
import Events from "./Events";
import Gallery from "./Gallery";
import RSVP from "./RSVP";
import GuestWall from "./GuestWall";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import PetalRain from "./PetalRain";
import ClickHearts from "./ClickHearts";
import CustomCursor from "./CustomCursor";

interface Props {
  brideName: string;
  groomName: string;
  date: string;
  venue: string;
  guestId?: string | null;
  guestName?: string | null;
}

export default function InvitationPage({ guestId, guestName, ...props }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <main>
      <PetalRain />
      <ClickHearts />
      <CustomCursor />
      <ScrollProgress />
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
            <RSVP guestName={guestName} guestId={guestId} />
            <GuestWall guestId={guestId} guestName={guestName} />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
