// Background music for the invitation. One shared <audio> element so the music
// keeps playing when the envelope screen hands over to the invitation page.
// Put the track at public/music/wedding-piano.mp3 (or change MUSIC_SRC).
//
// "Off" really pauses the track (volume changes are ignored on iPhone/Safari).

export const MUSIC_SRC = "/music/wedding-piano.mp3";
const VOLUME = 0.35;
const FADE_MS = 2500;

let audio: HTMLAudioElement | null = null;
let userPaused = false; // the guest pressed the button to turn it off
let failed = false;
let fadeToken = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || failed) return null;
  if (!audio) {
    audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.addEventListener("play", emit);
    audio.addEventListener("pause", emit);
    audio.addEventListener("error", () => { failed = true; emit(); });
  }
  return audio;
}

function fadeIn(a: HTMLAudioElement) {
  const token = ++fadeToken;
  const start = performance.now();
  const step = (now: number) => {
    if (token !== fadeToken || a.paused) return; // cancelled or turned off
    // rAF timestamps can be a hair earlier than `start`, so clamp to [0, 1]
    const p = Math.min(Math.max((now - start) / FADE_MS, 0), 1);
    a.volume = VOLUME * p;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function play(a: HTMLAudioElement) {
  a.volume = 0;
  return a.play().then(() => { fadeIn(a); });
}

/** Call from a tap/click. If the browser blocks it, retries on the next tap. */
export function startMusic() {
  const a = getAudio();
  if (!a || userPaused || !a.paused) return;
  play(a).catch(() => {
    document.addEventListener("pointerup", () => startMusic(), { once: true });
  });
}

/** Sound button: pauses when playing, resumes when paused. */
export function toggleMusic() {
  const a = getAudio();
  if (!a) return;
  if (!a.paused) {
    userPaused = true;
    fadeToken++; // stop any fade-in in progress
    a.pause();
  } else {
    userPaused = false;
    play(a).catch(() => { /* needs another tap */ });
  }
  emit();
}

export function getMusicState() {
  return { failed, playing: !!audio && !audio.paused };
}

export function subscribeMusic(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
