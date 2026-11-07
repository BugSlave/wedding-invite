"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "2px solid #ecdfd3",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

/** Landing page of the "reset password" email link. Supabase signs the user in
 *  with the link (recovery session); here they choose a new password. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The recovery link creates a session; wait for it.
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => setReady(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password kam se kam 8 characters ka rakho.");
    if (password !== again) return setError("Dono password same nahi hain.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError("Password badal nahi paya. Link purana ho sakta hai — dobara 'Password bhool gaye?' try karo.");
    router.replace("/admin");
  }

  return (
    <div
      style={{
        minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        background: "linear-gradient(160deg, #3A0008 0%, #5C0F18 40%, #4A0010 100%)",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: "#fff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: 22, fontWeight: 700, color: "#3A0008", margin: 0, textAlign: "center" }}>
          Naya password
        </h1>
        {!ready ? (
          <p style={{ color: "#8a7f75", fontSize: 13, margin: 0, textAlign: "center" }}>
            Link check ho raha hai… agar kuch nahi hota to email se link dobara kholo.
          </p>
        ) : (
          <>
            <input type="password" autoComplete="new-password" placeholder="Naya password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} required style={input} />
            <input type="password" autoComplete="new-password" placeholder="Dobara likho" value={again} onChange={(e) => setAgain(e.target.value)} required style={input} />
            {error && <p role="alert" style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>{error}</p>}
            <button
              type="submit" disabled={busy}
              style={{ padding: 13, borderRadius: 8, border: "none", background: "#3A0008", color: "#fff", fontWeight: 600, fontSize: 15, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
            >
              {busy ? "Please wait…" : "Password set karo"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
