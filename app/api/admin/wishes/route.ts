import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, authenticate } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const ctx = await authenticate(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ctx.invite) return NextResponse.json({ wishes: [] });

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("wishes")
      .select("id, name, message, created_at")
      .eq("invite_id", ctx.invite.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ wishes: [] });
    return NextResponse.json({ wishes: data ?? [] });
  } catch {
    return NextResponse.json({ wishes: [] });
  }
}
