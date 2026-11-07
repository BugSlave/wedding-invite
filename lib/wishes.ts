export const WISH_MAX = 120;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface Wish {
  name: string;
  message: string;
  created_at: string;
}

/** Collapse whitespace/newlines, drop control characters, trim, cap length. */
export function cleanWish(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, WISH_MAX);
}
