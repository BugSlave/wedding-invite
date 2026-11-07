import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

// These MUST be the public anon key + URL only.
// Never put the service-role key in a NEXT_PUBLIC_ variable —
// anything prefixed NEXT_PUBLIC_ is shipped to every visitor's browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the whole app at import time in dev before .env.local exists,
  // but make the problem loud in the console.
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "RSVP submissions will fail until these are set in .env.local."
  );
}

// A syntactically valid but non-functional placeholder URL so createClient()
// doesn't throw during build/prerender before .env.local exists. Real
// submissions will fail with a clean network error, caught in submitRSVP.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export interface GuestRecord {
  id: string;
  name: string;
  created_at: string;
}

export interface GuestInfo {
  name: string;
  relation: string | null; // optional personal line, e.g. "Ram's college friend"
}

// cache() → page + generateMetadata share one lookup per request.
export const getGuest = cache(async (id: string): Promise<GuestInfo | null> => {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const withRelation = await supabase
    .from("guests")
    .select("name, relation")
    .eq("id", id)
    .single();
  if (!withRelation.error && withRelation.data) {
    return { name: withRelation.data.name, relation: withRelation.data.relation ?? null };
  }

  // The optional `relation` column may not exist yet — fall back to name only.
  const nameOnly = await supabase.from("guests").select("name").eq("id", id).single();
  return nameOnly.data ? { name: nameOnly.data.name, relation: null } : null;
});
