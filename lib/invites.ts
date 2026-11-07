import { cache } from "react";
import { getAdminClient } from "@/lib/supabase-admin";
import { inviteData as sampleInvite } from "@/app/data/invite";
import type { InviteData } from "@/types/invite";

// Which invite `/` shows. Becomes `/c/<slug>` routing in a later step.
export const DEFAULT_SLUG = process.env.DEFAULT_INVITE_SLUG ?? "ram-mansi";

export interface InviteRecord {
  /** null = no database row yet (using the sample content from app/data/invite.ts) */
  id: string | null;
  slug: string;
  data: InviteData;
}

/**
 * Loads one invite's content from the `invites` table (server-side only).
 * Falls back to app/data/invite.ts when the table/row doesn't exist yet,
 * so the site keeps working before and during the migration.
 */
export const getInvite = cache(async (slug: string = DEFAULT_SLUG): Promise<InviteRecord> => {
  try {
    const { data, error } = await getAdminClient()
      .from("invites")
      .select("id, slug, content")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      const content = (data.content ?? {}) as Partial<InviteData>;
      // Shallow-merge so a missing field falls back to the sample instead of crashing.
      return { id: data.id, slug: data.slug, data: { ...sampleInvite, ...content } };
    }
  } catch {
    /* fall through to the sample */
  }
  return { id: null, slug, data: sampleInvite };
});
