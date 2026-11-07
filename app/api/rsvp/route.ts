import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { getInvite } from "@/lib/invites";
import { UUID_RE, cleanWish } from "@/lib/wishes";

// RSVPs are saved by the SERVER, not by the browser. A browser-side insert uses
// whatever Supabase login the visitor has (e.g. the owner logged into /admin in
// the same browser) and gets blocked by the database rules. Here the name and
// invite always come from the guest list, never from the request.

const ANSWERS = ["yes", "no", "maybe"] as const;
type Answer = (typeof ANSWERS)[number];

function isLocalDev(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const host = (req.headers.get("host") ?? "").replace(/:\d+$/, "");
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export async function POST(req: NextRequest) {
  let body: { id?: unknown; name?: unknown; attendance?: unknown; guest_count?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const attendance = body.attendance as Answer;
  if (!ANSWERS.includes(attendance)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const invite = await getInvite();
    const max = invite.data.rsvp.maxGuestsPerRSVP ?? 5;

    let name = "";
    let inviteId: string | null = invite.id;

    const id = typeof body.id === "string" ? body.id : "";
    if (id) {
      if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid link" }, { status: 400 });
      const g = await supabase.from("guests").select("name, invite_id").eq("id", id).maybeSingle();
      if (g.error || !g.data) return NextResponse.json({ error: "Invalid link" }, { status: 403 });
      name = g.data.name;
      inviteId = g.data.invite_id ?? invite.id;
    } else if (isLocalDev(req)) {
      // Development convenience: no guest link, typed name.
      name = cleanWish(body.name).slice(0, 60);
    }
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const count = attendance === "no" ? 1 : Math.min(max, Math.max(1, Math.floor(Number(body.guest_count) || 1)));
    const message = cleanWish(body.message) || null;

    const row: Record<string, unknown> = { name, attendance, guest_count: count, message };
    if (inviteId) row.invite_id = inviteId;

    const { error } = await supabase.from("rsvps").insert([row]);
    if (error) return NextResponse.json({ error: "Could not save RSVP." }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
