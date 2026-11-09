// Central type definitions. If you add a field to invite.ts data,
// add it here first so TypeScript catches mistakes everywhere it's used.

export interface ParentNames {
  father: string;
  mother?: string;
}

export interface Couple {
  brideName: string;
  groomName: string;
  brideFullName?: string; // shown in the hero, story header and link preview
  groomFullName?: string;
  brideParents?: ParentNames;
  groomParents?: ParentNames;
  brideSiblings?: string; // free text shown as given, e.g. "Brother – Name"
  groomSiblings?: string;
  bridePersonality: string;
  groomPersonality: string;
  togetherDynamic: string;
  brideImage?: string;
  groomImage?: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: string; // e.g. "01"
  title: string;
  body: string; // plain text, one or more paragraphs separated by \n\n
  mood: "curious" | "playful" | "comedic" | "romantic" | "emotional" | "celebratory";
  illustration?: string; // path under /public/illustrations, optional
}

export interface EventDetail {
  id: string;
  name: string;
  date: string; // ISO date string, e.g. "2026-12-14"
  time: string; // display string, e.g. "6:00 PM"
  dateTimeISO: string; // full ISO datetime for countdown math, e.g. "2026-12-14T18:00:00+05:30"
  venue: string;
  address: string;
  mapsUrl?: string; // if omitted, one is generated from address
  durationHours?: number; // used for calendar end time; defaults to 3
  illustration?: string;
  theme?: "default" | "lavender"; // colour theme of the event card
}

export interface GalleryPhoto {
  id: string;
  src: string;      // path under /public (e.g. "/gallery/photo-1.jpg"), or "" for placeholder
  alt: string;
  caption?: string;
  aspect?: number;  // width / height; when set on every photo, they're shown uncropped
}

export interface SocialPreview {
  title: string;
  description: string;
  imagePath: string; // under /public
  themeColor: string;
}

export interface InviteData {
  couple: Couple;
  howTheyMet: string;
  firstImpressions: {
    brideOnGroom: string;
    groomOnBride: string;
  };
  funnyDetails: {
    brideHabit: string;
    groomHabit: string;
    biggestDisagreement: string;
    insideJoke: string;
    teasingPoint: string;
  };
  proposalStory: string;
  chapters: StoryChapter[];
  gallery: GalleryPhoto[];
  mainEvent: EventDetail;
  additionalEvents: EventDetail[];
  social: SocialPreview;
  sharingTheJoy?: string[]; // names for the closing "Sharing the joy" section
  contact: {
    name: string;
    phone?: string;
  };
}
