"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        workspaceName: form.get("workspaceName"),
      }),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      setError(data?.error || "Could not create your account. Please try again.");
      setBusy(false);
      return;
    }
    router.push("/studio");
  }

  return <main className="auth-wrap"><section className="auth-card"><Link className="brand auth-brand" href="/">✦ LumaForge</Link><p className="eyebrow violet">START CREATING</p><h1>Create your workspace</h1><p className="auth-muted">Set up your account and make your first content workspace.</p><form className="auth-form" onSubmit={submit}><label>Your name<input autoComplete="name" name="name" maxLength={80} required /></label><label>Work email<input autoComplete="email" name="email" type="email" maxLength={254} required /></label><label>Workspace name<input name="workspaceName" maxLength={80} required /></label><label>Password<input autoComplete="new-password" name="password" type="password" minLength={12} maxLength={128} required /><small>Use at least 12 characters.</small></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Creating…" : "Create account"}</button></form><p className="auth-footer">Already registered? <Link href="/login">Sign in</Link></p><small className="legal-note">By continuing, you agree to our Terms and Privacy Policy. Publish these policies before accepting customers.</small></section></main>;
}
