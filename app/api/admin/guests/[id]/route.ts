import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, authenticate } from "@/lib/supabase-admin";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await authenticate(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ctx.invite) return NextResponse.json({ error: "No invite is assigned to this account." }, { status: 403 });

  try {
    const { id } = await context.params;
    const supabase = getAdminClient();
    // Scoped to the caller's invite: deleting another customer's guest matches 0 rows.
    const { error } = await supabase.from("guests").delete().eq("id", id).eq("invite_id", ctx.invite.id);

    if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
