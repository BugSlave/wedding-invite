"use client";

import { createContext, useContext } from "react";
import type { InviteData } from "@/types/invite";
import { inviteData as fallbackInvite } from "@/app/data/invite";

/**
 * Gives every component the CURRENT invite's content (names, events, photos…).
 * The server loads it from the database and wraps the page in <InviteProvider>.
 * If a component is ever rendered outside the provider it falls back to the
 * sample content in app/data/invite.ts, so nothing breaks.
 */
const InviteContext = createContext<InviteData>(fallbackInvite);

export function InviteProvider({ value, children }: { value: InviteData; children: React.ReactNode }) {
  return <InviteContext.Provider value={value}>{children}</InviteContext.Provider>;
}

export function useInvite(): InviteData {
  return useContext(InviteContext);
}
