"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      setError(data?.error || "Could not sign you in. Please try again.");
      setBusy(false);
      return;
    }
    router.push("/studio");
  }

  return <main className="auth-wrap"><section className="auth-card"><Link className="brand auth-brand" href="/">✦ LumaForge</Link><p className="eyebrow violet">WELCOME BACK</p><h1>Sign in to LumaForge</h1><p className="auth-muted">Pick up where you left off.</p><form className="auth-form" onSubmit={submit}><label>Work email<input autoComplete="email" name="email" type="email" maxLength={254} required /></label><label>Password<input autoComplete="current-password" name="password" type="password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="auth-footer">New to LumaForge? <Link href="/signup">Create an account</Link></p></section></main>;
}
