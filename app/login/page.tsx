"use client";

import { useState, type FormEvent } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setInfo("");
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) {
      // Same message for "no such user" and "wrong password" — don't reveal which.
      setError("Email ya password galat hai.");
      return;
    }
    router.replace("/admin");
  }

  async function onForgot() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Pehle upar apna email likho.");
      return;
    }
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    // Always the same reply, whether or not that email has an account.
    setInfo("Agar ye email registered hai to password badalne ka link bhej diya gaya hai.");
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #3A0008 0%, #5C0F18 40%, #4A0010 100%)",
        padding: 24,
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: 22, fontWeight: 700, color: "#3A0008", margin: "0 0 4px" }}>
            Login
          </h1>
          <p style={{ color: "#8a7f75", fontSize: 13, margin: 0 }}>Apne invite ko manage karo</p>
        </div>

        <input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          style={input}
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ ...input, borderColor: error ? "#e53e3e" : "#ecdfd3" }}
        />

        {error && <p role="alert" style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>{error}</p>}
        {info && <p style={{ color: "#2f7a3f", fontSize: 13, margin: 0 }}>{info}</p>}

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "13px", borderRadius: 8, border: "none", background: "#3A0008", color: "#fff",
            fontWeight: 600, fontSize: 15, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Please wait…" : "Login"}
        </button>

        <button
          type="button"
          onClick={onForgot}
          disabled={busy}
          style={{ background: "none", border: "none", color: "#8a7f75", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
        >
          Password bhool gaye?
        </button>
      </form>
    </div>
  );
}
