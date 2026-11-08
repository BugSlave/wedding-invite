// Background music for the invitation. One shared <audio> element so the music
// keeps playing when the envelope screen hands over to the invitation page.
// Put the track at public/music/wedding-piano.mp3 (or change MUSIC_SRC).

export const MUSIC_SRC = "/music/wedding-piano.mp3";
const VOLUME = 0.35;
const FADE_MS = 2500;

let audio: HTMLAudioElement | null = null;
let muted = false;
let failed = false;
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
    audio.addEventListener("error", () => { failed = true; emit(); });
  }
  return audio;
}

function fadeIn(a: HTMLAudioElement) {
  const start = performance.now();
  const step = (now: number) => {
    if (muted) return;
    const p = Math.min((now - start) / FADE_MS, 1);
    a.volume = VOLUME * p;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Call from a tap/click. If the browser blocks it, retries on the next tap. */
export function startMusic() {
  const a = getAudio();
  if (!a || !a.paused) return;
  a.play().then(() => { if (!muted) fadeIn(a); emit(); }).catch(() => {
    const retry = () => { startMusic(); };
    document.addEventListener("pointerup", retry, { once: true });
  });
}

export function toggleMute() {
  const a = getAudio();
  if (!a) return;
  muted = !muted;
  a.volume = muted ? 0 : VOLUME;
  if (!muted && a.paused) startMusic();
  emit();
}

export function getMusicState() {
  return { muted, failed, playing: !!audio && !audio.paused };
}

export function subscribeMusic(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
