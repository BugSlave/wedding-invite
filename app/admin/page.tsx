"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Guest {
  id: string;
  name: string;
  relation?: string | null;
  created_at: string;
}

const btn = (bg: string, color = "#fff"): React.CSSProperties => ({
  padding: "9px 18px",
  borderRadius: 8,
  background: bg,
  color,
  fontWeight: 600,
  fontSize: 13,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.15s",
  whiteSpace: "nowrap" as const,
});

// Calls an /api/admin route with the logged-in user's Supabase token.
async function authFetch(url: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("no-session");
  return fetch(url, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [who, setWho] = useState<{ email: string; invite: string | null; isSuper: boolean } | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<{ id: string; name: string; message: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [addError, setAddError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const siteUrl =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/guests");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setGuests(data.guests ?? []);
      setWho({ email: data.email ?? "", invite: data.invite ?? null, isSuper: Boolean(data.isSuper) });
      const wr = await authFetch("/api/admin/wishes");
      if (wr.ok) setWishes((await wr.json()).wishes ?? []);
      setReady(true);
    } catch {
      router.replace("/login"); // no session
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddLoading(true);
    setAddError("");
    try {
      const res = await authFetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), relation: newRelation.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuests((prev) => [data.guest, ...prev]);
        setNewName("");
        setNewRelation("");
      } else {
        setAddError("Guest add karne mein problem aayi.");
      }
    } catch {
      setAddError("Session khatam ho gaya. Dobara login karo.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    const prev = guests;
    setGuests((g) => g.filter((x) => x.id !== id));
    try {
      const res = await authFetch(`/api/admin/guests/${id}`, { method: "DELETE" });
      if (!res.ok) setGuests(prev);
    } catch {
      setGuests(prev);
    }
    setDeletingId(null);
  }

  async function handleDeleteWish(id: string) {
    const prev = wishes;
    setWishes((w) => w.filter((x) => x.id !== id));
    try {
      const res = await authFetch(`/api/admin/wishes/${id}`, { method: "DELETE" });
      if (!res.ok) setWishes(prev);
    } catch {
      setWishes(prev);
    }
  }

  function getInviteLink(id: string) {
    return `${siteUrl}/?id=${id}`;
  }

  async function handleCopy(id: string) {
    await navigator.clipboard.writeText(getInviteLink(id));
    setCopied(id);
    setTimeout(() => setCopied(null), 2200);
  }

  async function handleCopyAll() {
    const text = guests
      .map((g) => `${g.name}: ${getInviteLink(g.id)}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 2200);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // ─── Checking login / no invite assigned ─────────────────────────────────────
  if (!ready || !who?.invite) {
    return (
      <div
        style={{
          minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 14, padding: 24, textAlign: "center", background: "#f8f5f0", color: "#5c1520",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        {!ready ? (
          <p style={{ margin: 0 }}>Loading…</p>
        ) : (
          <>
            <p style={{ margin: 0, maxWidth: 320 }}>
              Is account ({who?.email}) se abhi koi invite juda hua nahi hai. Jisne aapka account banaya hai unse baat karo.
            </p>
            <button onClick={handleLogout} style={btn("#3A0008")}>Logout</button>
          </>
        )}
      </div>
    );
  }

  // ─── Main Admin UI ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100svh",
        background: "#f8f5f0",
        padding: "28px 16px 60px",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: 26,
                fontWeight: 700,
                color: "#3A0008",
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: 0,
              }}
            >
              🪷 Guest List
            </h1>
            <p
              style={{
                color: "#8a7f75",
                fontSize: 13,
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              {guests.length} guest{guests.length !== 1 ? "s" : ""} added · {who.email}{who.isSuper ? ` (owner · ${who.invite})` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {guests.length > 0 && (
              <button
                onClick={handleCopyAll}
                style={{
                  ...btn(copied === "all" ? "#22c55e" : "#fff", copied === "all" ? "#fff" : "#555"),
                  border: "1.5px solid #ddd",
                }}
              >
                {copied === "all" ? "Copied All!" : "Copy All Links"}
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{ ...btn("transparent", "#8a7f75"), border: "1.5px solid #ddd" }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add Guest */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #ecdfd3",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#3A0008",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Add Guest
          </h2>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Guest ka naam likhao (e.g. Himanshu)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: "10px 14px",
                borderRadius: 8,
                border: "2px solid #ecdfd3",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <input
              type="text"
              placeholder="Optional line (e.g. Ram's college friend)"
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
              style={{
                flex: "1 1 220px",
                padding: "10px 14px",
                borderRadius: 8,
                border: "2px solid #ecdfd3",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={addLoading || !newName.trim()}
              style={{ ...btn("#3A0008"), opacity: addLoading || !newName.trim() ? 0.55 : 1 }}
            >
              {addLoading ? "Adding…" : "+ Add"}
            </button>
          </form>
          {addError && (
            <p style={{ color: "#e53e3e", fontSize: 13, marginTop: 8 }}>
              {addError}
            </p>
          )}
        </div>

        {/* Guest List */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #ecdfd3",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#aaa", fontSize: 14 }}>
              Loading guests…
            </div>
          ) : guests.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "#aaa",
              }}
            >
              <p style={{ fontSize: 36, marginBottom: 10 }}>🪷</p>
              <p style={{ fontSize: 14 }}>
                Koi guest nahi abhi. Upar se add karo!
              </p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr auto auto",
                  gap: 12,
                  padding: "10px 20px",
                  background: "#faf7f4",
                  borderBottom: "1px solid #ecdfd3",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#8a7f75",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <span>Name</span>
                <span>Invite Link</span>
                <span />
                <span />
              </div>

              {guests.map((guest, i) => (
                <div
                  key={guest.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr auto auto",
                    gap: 12,
                    padding: "13px 20px",
                    borderBottom:
                      i < guests.length - 1 ? "1px solid #f5f0eb" : "none",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#1a0005",
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {guest.name}
                    {guest.relation && (
                      <span style={{ display: "block", fontWeight: 400, fontSize: 11, color: "#8a7f75", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {guest.relation}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      color: "#aaa",
                      fontSize: 11,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getInviteLink(guest.id)}
                  </span>
                  <button
                    onClick={() => handleCopy(guest.id)}
                    style={{
                      ...btn(
                        copied === guest.id ? "#22c55e" : "#f0ece8",
                        copied === guest.id ? "#fff" : "#555"
                      ),
                      padding: "7px 14px",
                    }}
                  >
                    {copied === guest.id ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDelete(guest.id)}
                    disabled={deletingId === guest.id}
                    style={{
                      ...btn("#fff0f0", "#e53e3e"),
                      padding: "7px 14px",
                      border: "1px solid #fecaca",
                      opacity: deletingId === guest.id ? 0.5 : 1,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guest wall wishes — delete anything inappropriate */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #ecdfd3",
            marginTop: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 20px", background: "#faf7f4", borderBottom: "1px solid #ecdfd3", fontSize: 11, fontWeight: 700, color: "#8a7f75", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Guest wall wishes ({wishes.length})
          </div>
          {wishes.length === 0 ? (
            <p style={{ padding: 24, textAlign: "center", color: "#aaa", fontSize: 13, margin: 0 }}>
              Abhi koi wish nahi aayi.
            </p>
          ) : (
            wishes.map((w, i) => (
              <div
                key={w.id}
                style={{
                  display: "flex", gap: 12, alignItems: "center", padding: "12px 20px",
                  borderBottom: i < wishes.length - 1 ? "1px solid #f5f0eb" : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1a0005" }}>{w.name}</div>
                  <div style={{ fontSize: 13, color: "#555", overflowWrap: "anywhere" }}>{w.message}</div>
                </div>
                <button
                  onClick={() => handleDeleteWish(w.id)}
                  style={{ ...btn("#fff0f0", "#e53e3e"), padding: "7px 14px", border: "1px solid #fecaca" }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <p
          style={{
            fontSize: 11,
            color: "#bbb",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Links are permanent as long as the guest is in the list.
        </p>
      </div>
    </div>
  );
}
