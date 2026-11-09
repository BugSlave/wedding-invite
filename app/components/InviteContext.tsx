"use client";

import { createContext, useContext } from "react";
import type { InviteData } from "@/types/invite";
import { inviteData } from "@/app/data/invite";

/**
 * Gives every component the invite's content (names, events, photos…),
 * which lives in app/data/invite.ts.
 */
const InviteContext = createContext<InviteData>(inviteData);

export function useInvite(): InviteData {
  return useContext(InviteContext);
}
