// Copies the content from app/data/invite.ts into the `invites` table.
// Run:  node --experimental-strip-types scripts/seed-invite.mjs [slug]
import fs from "node:fs";
import { inviteData } from "../app/data/invite.ts";

const slug = process.argv[2] ?? "ram-mansi";
const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };

const res = await fetch(`${url}/rest/v1/invites?slug=eq.${encodeURIComponent(slug)}`, {
  method: "PATCH", headers, body: JSON.stringify({ content: inviteData }),
});
const body = await res.json().catch(() => null);
if (!res.ok) { console.error("Failed:", res.status, JSON.stringify(body)); process.exit(1); }
if (!body?.length) { console.error(`No invite with slug "${slug}". Run supabase/migrations/001_invites.sql first.`); process.exit(1); }
console.log(`OK: content saved to invite "${slug}" (id ${body[0].id}).`);
