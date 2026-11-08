"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Workspace = { id: string; name: string; plan: string };

export default function BillingPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/workspaces").then(async (r) => {
      if (r.status === 401) { window.location.href = "/login"; return; }
      const d = await r.json(); setWorkspaces(d.workspaces || []);
    }).catch(() => setMessage("Could not load workspace billing."));
  }, []);

  async function checkout(plan: "CREATOR" | "TEAM") {
    setBusy(true); setMessage("");
    const response = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (!response?.ok || !data.url) { setMessage(data.error || "Checkout could not be started."); setBusy(false); return; }
    window.location.assign(data.url);
  }

  return <main className="studio-shell"><header className="studio-header"><Link className="brand" href="/">✦ LumaForge</Link><Link className="button secondary" href="/studio">Back to Studio</Link></header><section className="studio-main"><p className="eyebrow violet">ACCOUNT & BILLING</p><h1>Choose the right room to grow.</h1><p className="auth-muted">Prices are configured in Stripe and may vary by currency and tax. Secure checkout is hosted by Stripe.</p>{workspaces.map((workspace) => <p className="workspace-label" key={workspace.id}>{workspace.name} · Current plan: {workspace.plan}</p>)}{message && <p className="form-error" role="alert">{message}</p>}<div className="plan-grid"><article className="panel"><p className="eyebrow">CREATOR</p><h2>Build your rhythm</h2><p>100 generations per month. Scheduling, exports, and brand controls.</p><button className="button primary" disabled={busy} onClick={() => checkout("CREATOR")}>{busy ? "Opening checkout…" : "Choose Creator"}</button></article><article className="panel"><p className="eyebrow">TEAM</p><h2>Make it together</h2><p>500 generations per month. Collaboration, approvals, and advanced analytics.</p><button className="button primary" disabled={busy} onClick={() => checkout("TEAM")}>{busy ? "Opening checkout…" : "Choose Team"}</button></article></div><p className="legal-note">Before enabling live billing, configure Stripe prices, Terms, Privacy, cancellation/refund information, and tax settings. This page does not promise a refund policy or tax outcome.</p></section></main>;
}
