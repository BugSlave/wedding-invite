import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, authenticate } from "@/lib/supabase-admin";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const noInvite = () => NextResponse.json({ error: "No invite is assigned to this account." }, { status: 403 });

export async function GET(req: NextRequest) {
  const ctx = await authenticate(req);
  if (!ctx) return unauthorized();
  if (!ctx.invite) return NextResponse.json({ guests: [], invite: null, email: ctx.email, isSuper: ctx.isSuper });

  try {
    const supabase = getAdminClient();
    const first = await supabase
      .from("guests")
      .select("id, name, relation, created_at")
      .eq("invite_id", ctx.invite.id)
      .order("created_at", { ascending: false });
    let data: unknown[] | null = first.data;
    let error = first.error;

    // Optional `relation` column not created yet → list without it.
    if (error) {
      const fallback = await supabase
        .from("guests")
        .select("id, name, created_at")
        .eq("invite_id", ctx.invite.id)
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return NextResponse.json({ error: "Could not load guests." }, { status: 500 });
    return NextResponse.json({ guests: data, invite: ctx.invite.slug, email: ctx.email, isSuper: ctx.isSuper });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await authenticate(req);
  if (!ctx) return unauthorized();
  if (!ctx.invite) return noInvite();

  try {
    const { name, relation } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const row: { name: string; relation?: string; invite_id: string } = {
      name: String(name).trim().slice(0, 80),
      invite_id: ctx.invite.id, // always the caller's own invite — never taken from the request
    };
    if (typeof relation === "string" && relation.trim()) row.relation = relation.trim().slice(0, 80);

    const supabase = getAdminClient();
    let { data, error } = await supabase.from("guests").insert([row]).select().single();

    // The optional `relation` column may not exist yet → retry without it.
    if (error && row.relation) {
      const { relation: _skip, ...withoutRelation } = row;
      void _skip;
      ({ data, error } = await supabase.from("guests").insert([withoutRelation]).select().single());
    }

    if (error) return NextResponse.json({ error: "Could not add guest." }, { status: 500 });
    return NextResponse.json({ guest: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
