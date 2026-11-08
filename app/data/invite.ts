import type { InviteData } from "@/types/invite";

/**
 * ⚠️ PLACEHOLDER CONTENT ⚠️
 * Every bracketed value below is fake. Replace with real details before
 * this site goes anywhere near a guest. Nothing in this file was invented
 * to "sound real" — it's intentionally obvious placeholder text so it's
 * impossible to accidentally ship it by mistake.
 *
 * This is the ONLY file you should need to edit for content changes.
 * Change a date/name here and it updates everywhere on the site.
 */
export const inviteData: InviteData = {
  couple: {
    brideName: "Mansi",
    groomName: "Ram",
    brideParents: {
      father: "Narendra Arora",
    },
    groomParents: {
      father: "Ashwani Bhasin",
    },
    bridePersonality: "[BRIDE PERSONALITY]",
    groomPersonality: "[GROOM PERSONALITY]",
    togetherDynamic: "[TOGETHER DYNAMIC]",
    brideImage: "",
    groomImage: "",
  },

  howTheyMet: "[HOW THEY MET — real story goes here]",

  firstImpressions: {
    brideOnGroom: "[BRIDE'S FIRST IMPRESSION OF GROOM]",
    groomOnBride: "[GROOM'S FIRST IMPRESSION OF BRIDE]",
  },

  funnyDetails: {
    brideHabit: "[BRIDE'S FUNNY HABIT]",
    groomHabit: "[GROOM'S FUNNY HABIT]",
    biggestDisagreement: "[THEIR BIGGEST FUNNY DISAGREEMENT]",
    insideJoke: "[INSIDE JOKE]",
    teasingPoint: "[SOMETHING THEY TEASE EACH OTHER ABOUT]",
  },

  proposalStory: "[THE ACTUAL PROPOSAL / ENGAGEMENT STORY]",

  // Story chapters map to Sections 8 & 10 of the brief.
  // Fill `body` with real details once available — do not leave AI-generated
  // filler in a live site.
  chapters: [
    {
      id: "our-story",
      chapterNumber: "01",
      title: "Our Story",
      body:
        "Every love story has a beginning, and ours started with a little eye contact, a sweet hello, and a few unexpected conversations. What began with simple talks soon turned into endless chats, silly smiles, cute little moments, and a special bond.\n\n" +
        "Before we knew it, we had become each other’s favourite notification, favourite person, and happiest place.\n\n" +
        "And now, two hearts, one beautiful story, and a lifetime of adventures await!",
      mood: "romantic",
    },
  ],

  // Add real photo paths here after the pre-wedding shoot.
  // src should be relative to /public, e.g. "/gallery/photo-1.jpg"
  gallery: [
    { id: "g1", src: "/gallery/photo-1.jpg", aspect: 2618 / 4160, alt: "Ram & Mansi", caption: "The First Chapter" },
    { id: "g2", src: "/gallery/photo-2.jpg", aspect: 4160 / 2774, alt: "Ram & Mansi", caption: "Just the Two of Us" },
  ],

  mainEvent: {
    id: "ring-ceremony",
    name: "Ring Ceremony",
    date: "December 8, 2026",
    time: "7:00 PM onwards",
    dateTimeISO: "2026-12-08T19:00:00+05:30",
    venue: "Club Riviera",
    address: "Bareilly, Uttar Pradesh",
  },

  additionalEvents: [
    {
      id: "haldi",
      name: "Haldi",
      date: "December 10, 2026",
      time: "10:30 AM onwards",
      dateTimeISO: "2026-12-10T10:30:00+05:30",
      venue: "Surya Banquet Hall",
      address: "Bareilly, Uttar Pradesh",
      theme: "lavender",
    },
    {
      id: "marriage",
      name: "Marriage",
      date: "December 10, 2026",
      time: "7:00 PM onwards",
      dateTimeISO: "2026-12-10T19:00:00+05:30",
      venue: "Surya Banquet Hall",
      address: "Bareilly, Uttar Pradesh",
    },
  ],

  rsvp: {
    enabled: true,
    askGuestCount: true,
    maxGuestsPerRSVP: 5,
    askMessage: true,
  },

  social: {
    title: "Ram & Mansi are getting engaged!",
    description: "Join us to celebrate on December 8, 2026 at Club Riviera, Bareilly.",
    imagePath: "/images/social-preview.jpg",
    themeColor: "#D97757",
  },

  contact: {
    name: "[CONTACT NAME]",
    phone: "[CONTACT PHONE]",
  },
};
