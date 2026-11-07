// Creates a customer login (email + password) and links it to an invite.
//   node scripts/create-customer.mjs <email> <password> [slug]
// If the invite (slug) doesn't exist yet it is created with the sample content.
import fs from "node:fs";

const [email, password, slug = "ram-mansi"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/create-customer.mjs <email> <password> [slug]");
  process.exit(1);
}
if (password.length < 8) { console.error("Password must be at least 8 characters."); process.exit(1); }

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

// 1) the login
let res = await fetch(`${url}/auth/v1/admin/users`, {
  method: "POST", headers: H,
  body: JSON.stringify({ email, password, email_confirm: true }),
});
let user = await res.json();
if (!res.ok) {
  console.error("Could not create user:", user.msg ?? user.message ?? JSON.stringify(user));
  process.exit(1);
}

// 2) link to the invite (create it if needed)
res = await fetch(`${url}/rest/v1/invites?slug=eq.${encodeURIComponent(slug)}`, {
  method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify({ owner_id: user.id }),
});
let rows = await res.json();
if (!rows?.length) {
  res = await fetch(`${url}/rest/v1/invites`, {
    method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify({ slug, owner_id: user.id }),
  });
  rows = await res.json();
}
if (!rows?.length) { console.error("Could not link the invite:", JSON.stringify(rows)); process.exit(1); }
console.log(`OK: ${email} can now log in at /login and manages invite "${slug}".`);
