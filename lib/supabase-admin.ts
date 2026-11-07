// SERVER-SIDE ONLY — never import this in client components or NEXT_PUBLIC_ contexts.
// The service-role key bypasses RLS and must never reach the browser.
import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set both in .env.local before using the admin panel."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export interface AdminContext {
  userId: string;
  email: string;
  /** The platform owner (SUPER_ADMIN_EMAIL): can open any invite with ?invite=<slug>. */
  isSuper: boolean;
  /** The invite this admin manages. Every query is scoped to it. null = none assigned. */
  invite: { id: string; slug: string } | null;
}

const DEFAULT_SLUG = process.env.DEFAULT_INVITE_SLUG ?? "ram-mansi";

/**
 * Identifies who is calling an /api/admin route from the Supabase login token
 * (Authorization: Bearer <access token>). Returns null if not logged in.
 *
 * A customer only ever gets THEIR invite (the one whose owner_id is them),
 * so they can never read or change another customer's guests.
 */
export async function authenticate(req: Request): Promise<AdminContext | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const user = data.user;
  const email = user.email ?? "";
  const superEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const isSuper = Boolean(superEmail) && email.toLowerCase() === superEmail;

  let query = admin.from("invites").select("id, slug");
  if (isSuper) {
    const slug = new URL(req.url).searchParams.get("invite") ?? DEFAULT_SLUG;
    query = query.eq("slug", slug);
  } else {
    query = query.eq("owner_id", user.id);
  }
  const { data: invite } = await query.limit(1).maybeSingle();

  return { userId: user.id, email, isSuper, invite: invite ?? null };
}
