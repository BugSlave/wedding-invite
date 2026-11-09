# Ram & Mansi — Wedding Invitation

A mobile-first digital wedding invitation built with Next.js, TypeScript, Tailwind and Framer Motion.
It is a fully static site: no database, no login, no guest list. Anyone with the link can open it.

## What's in it

- Envelope reveal → hero → scratch-to-reveal date → Story → Events (Ring Ceremony, Haldi, Marriage) → Countdown → Gallery
- Per-event "Save the date" (.ics) and Google Calendar buttons, plus Google Maps directions
- Soft piano background music (starts when the envelope is opened, with a mute button)
- Link-preview (Open Graph) tags for WhatsApp / social sharing

## Editing content

Everything lives in **`app/data/invite.ts`** — names, events, story, gallery and the link preview text.
Photos go in `public/gallery/`, the preview image is `public/images/social-preview.jpg`, and the music is `public/music/wedding-piano.mp3`.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set `NEXT_PUBLIC_SITE_URL` to your site's URL (for example `https://your-site.vercel.app`) so link previews use the right image URL.
3. Make sure Deployment Protection is off, otherwise WhatsApp can't read the preview.
