"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Workspace = { id: string; name: string; plan: string };
type Item = { id: string; title: string; body: string; channel: string; status: string; updatedAt: string };

export default function LibraryPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    fetch("/api/workspaces").then(async (r) => {
      if (r.status === 401) { window.location.href = "/login"; return; }
      const data = await r.json(); if (!r.ok) throw new Error(data.error || "Could not load workspaces");
      setWorkspaces(data.workspaces); if (data.workspaces[0]) setWorkspaceId(data.workspaces[0].id);
    }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/content?workspaceId=${encodeURIComponent(workspaceId)}`).then(async (r) => {
      const data = await r.json(); if (!r.ok) throw new Error(data.error || "Could not load content"); setItems(data.items);
    }).catch((e) => setError(e.message));
  }, [workspaceId]);

  async function updateStatus(item: Item, status: string) {
    setBusy(item.id); setError("");
    const r = await fetch(`/api/content/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).catch(() => null);
    const data = await r?.json().catch(() => ({}));
    if (!r?.ok) setError(data.error || "Could not update content"); else setItems((all) => all.map((current) => current.id === item.id ? { ...current, status } : current));
    setBusy("");
  }

  async function remove(item: Item) {
    if (!window.confirm(`Delete “${item.title}” and its versions? This cannot be undone.`)) return;
    setBusy(item.id); setError("");
    const r = await fetch(`/api/content/${item.id}`, { method: "DELETE" }).catch(() => null);
    if (!r?.ok) setError("Could not delete this item"); else setItems((all) => all.filter((current) => current.id !== item.id));
    setBusy("");
  }

  return <main className="studio-shell"><header className="studio-header"><Link className="brand" href="/">✦ LumaForge</Link><div className="studio-controls"><label className="workspace-label">Workspace<select value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)}>{workspaces.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.plan}</option>)}</select></label><Link className="button primary" href="/studio">New draft</Link></div></header><section className="studio-main"><p className="eyebrow violet">CONTENT LIBRARY</p><h1>Saved work, ready to move.</h1><p className="auth-muted">Review, update, and manage content saved in this workspace.</p>{error && <p className="form-error" role="alert">{error}</p>}{items.length === 0 ? <section className="panel"><p className="auth-muted">No content yet. Create your first draft in Studio.</p></section> : <div className="library-grid">{items.map((item) => <article className="panel saved-item" key={item.id}><span className="status ready">{item.status} · {item.channel}</span><h2>{item.title}</h2><p>{item.body}</p><small className="auth-muted">Updated {new Date(item.updatedAt).toLocaleString()}</small><div className="item-actions"><button className="button secondary" disabled={busy === item.id} onClick={() => updateStatus(item, item.status === "DRAFT" ? "IN_REVIEW" : "DRAFT")}>{item.status === "DRAFT" ? "Send for review" : "Move to draft"}</button><button className="button danger" disabled={busy === item.id} onClick={() => remove(item)}>Delete</button></div></article>)}</div>}</section></main>;
}
