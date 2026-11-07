# [Bride] & [Groom] — Engagement Invitation

A mobile-first digital engagement invitation. Next.js 15 + TypeScript + Tailwind + Framer Motion + Supabase.

## ⚠️ Current status

This is a **working scaffold with placeholder content**, not a finished invitation. Every name, date, venue, and story detail in `app/data/invite.ts` is a bracketed placeholder like `[BRIDE NAME]`. Nothing will look real until that file is filled in with actual details — see "What's NOT done yet" below.

## What's built

- Full page structure: Hero → Story chapters → Events → Countdown → RSVP → Footer
- All content driven from one file: `app/data/invite.ts` (edit this, nothing else, for text/date/venue changes)
- Scroll-triggered animations (Framer Motion), respects `prefers-reduced-motion`
- Timezone-aware live countdown
- RSVP form wired to Supabase with loading/success/error states and a duplicate-submit guard
- "Get directions" buttons that open Google Maps for each venue
- Open Graph / WhatsApp share preview tags (needs a real preview image — see below)
- Accessible: semantic headings, alt text hooks, visible focus states, keyboard-usable form

## What's NOT done yet (and why)

- **Real story content.** Nothing was invented — see Section 3/7 of the original brief ("never invent memories/details"). You need to give me the actual names, how-they-met story, funny habits, proposal story, and event details, then I'll write the real copy into `invite.ts`.
- **Illustrations.** No hand-drawn caricatures exist. I don't have a tool that reliably keeps a couple's likeness consistent across 7+ poses — that's a real limitation, not a corner I'm cutting. Options: commission an illustrator and I'll integrate the files, or we use simple abstract/SVG graphics as a placeholder style instead.
- **Animated video.** Not something I can generate. Once the site's visual identity is locked, this would need a separate video tool or editor.
- **Supabase project.** You need to create your own Supabase project (free tier is fine) and run `supabase/schema.sql` in its SQL editor, then add the URL + anon key to `.env.local`.
- **Deployment.** You'll need your own GitHub repo and Vercel account. Steps below.
- **Social preview image.** `app/data/invite.ts` points at `/public/images/social-preview.jpg`, which doesn't exist yet — add a 1200×630px image there before deploying, or the WhatsApp preview will be broken.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

Open http://localhost:3000.

## Setting up Supabase (for RSVP to actually work)

1. Create a free project at supabase.com
2. Go to SQL Editor → paste the contents of `supabase/schema.sql` → Run
3. Go to Project Settings → API → copy the **Project URL** and **anon public key**
4. Paste them into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Never paste the `service_role` key anywhere in this project — it must never reach the browser

## Deploying

1. Push this repo to GitHub
2. Import the repo in Vercel (vercel.com → New Project)
3. Add the same three env vars from `.env.local` in Vercel's Project Settings → Environment Variables
4. Deploy — Vercel gives you a `*.vercel.app` URL automatically
5. Optional: add a custom domain in Vercel's Domains settings

## Editing content

Everything guest-facing lives in **`app/data/invite.ts`**. Change a name or date there and it updates everywhere on the site automatically — no need to touch components.

## Testing the WhatsApp preview

Social preview crawlers (WhatsApp, iMessage, etc.) only work on a **publicly deployed URL**, not localhost. After deploying to Vercel, paste your production link into a WhatsApp chat to yourself to check how it renders.
