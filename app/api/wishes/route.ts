import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { UUID_RE, cleanWish, type Wish } from "@/lib/wishes";

// The `wishes` table has RLS on and NO public policies — the browser can never
// read or write it directly. Everything goes through these server routes, which
// check the guest link (id) before doing anything.

const NO_STORE = { "Cache-Control": "no-store" };
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? "";

function isLocalHost(req: NextRequest): boolean {
  // Never trust a "localhost" Host header in production builds.
  if (process.env.NODE_ENV === "production") return false;
  const host = (req.headers.get("host") ?? "").replace(/:\d+$/, "");
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/**
 * GET /api/wishes?id=<guest id>  →  { wishes, alreadyWished }
 * Only guests with a valid link can read the wall (localhost is allowed for development).
 * Only first names are exposed.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const empty = { wishes: [] as Wish[], alreadyWished: false };

  try {
    const supabase = getAdminClient();

    // Must be a real guest on the list.
    let isGuest = false;
    if (UUID_RE.test(id)) {
      const g = await supabase.from("guests").select("id").eq("id", id).maybeSingle();
      isGuest = Boolean(g.data);
    }
    if (!isGuest && !isLocalHost(req)) {
      return NextResponse.json(empty, { status: 403, headers: NO_STORE });
    }

    const { data, error } = await supabase
      .from("wishes")
      .select("name, message, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    // Table missing / any DB problem → show an empty wall rather than break the page.
    if (error) return NextResponse.json(empty, { headers: NO_STORE });

    let alreadyWished = false;
    if (isGuest) {
      const mine = await supabase.from("wishes").select("id", { count: "exact", head: true }).eq("guest_id", id);
      alreadyWished = (mine.count ?? 0) > 0;
    }

    const wishes = (data ?? []).map((w) => ({ ...w, name: firstName(w.name) }));
    return NextResponse.json({ wishes, alreadyWished }, { headers: NO_STORE });
  } catch {
    return NextResponse.json(empty, { headers: NO_STORE });
  }
}

/** POST /api/wishes  { id, message }  — one wish per guest link. */
export async function POST(req: NextRequest) {
  let body: { id?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const message = cleanWish(body.message);

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Wish likhna zaroori hai." }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();

    // The name comes from the guest list, never from the browser.
    // (invite_id exists once the multi-customer migration has run; fall back to name only before that.)
    let guest: { name: string; invite_id?: string | null } | null = null;
    const withInvite = await supabase.from("guests").select("name, invite_id").eq("id", id).single();
    if (!withInvite.error && withInvite.data) {
      guest = withInvite.data;
    } else {
      const plain = await supabase.from("guests").select("name").eq("id", id).single();
      guest = plain.data ?? null;
    }
    if (!guest) {
      return NextResponse.json({ error: "Invalid link" }, { status: 403 });
    }

    const row: { guest_id: string; name: string; message: string; invite_id?: string } = {
      guest_id: id,
      name: guest.name,
      message,
    };
    if (guest.invite_id) row.invite_id = guest.invite_id;

    const { data, error } = await supabase
      .from("wishes")
      .insert([row])
      .select("name, message, created_at")
      .single();

    if (error) {
      // 23505 = unique violation → this link already left a wish.
      if (error.code === "23505") {
        return NextResponse.json({ error: "Aap wish pehle hi bhej chuke ho." }, { status: 409 });
      }
      return NextResponse.json({ error: "Kuch gadbad ho gayi. Dobara try karo." }, { status: 500 });
    }

    return NextResponse.json({ wish: { ...data, name: firstName(data.name) } }, { status: 201, headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "Kuch gadbad ho gayi. Dobara try karo." }, { status: 500 });
  }
}
