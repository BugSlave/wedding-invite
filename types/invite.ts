// Central type definitions. If you add a field to invite.ts data,
// add it here first so TypeScript catches mistakes everywhere it's used.

export interface ParentNames {
  father: string;
  mother?: string;
}

export interface Couple {
  brideName: string;
  groomName: string;
  brideParents?: ParentNames;
  groomParents?: ParentNames;
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
}

export interface GalleryPhoto {
  id: string;
  src: string;      // path under /public (e.g. "/gallery/photo-1.jpg"), or "" for placeholder
  alt: string;
  caption?: string;
  aspect?: number;  // width / height; when set on every photo, they're shown uncropped
}

export interface RSVPConfig {
  enabled: boolean;
  deadlineISO?: string;
  askGuestCount: boolean;
  maxGuestsPerRSVP: number;
  askMessage: boolean;
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
  rsvp: RSVPConfig;
  social: SocialPreview;
  contact: {
    name: string;
    phone?: string;
  };
}
