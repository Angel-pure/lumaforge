"use client";

import { useEffect, useState } from "react";

type Workspace = { id: string; name: string; plan: string };
type Item = { id: string; title: string; body: string; channel: string; status: string };

export default function StudioPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/workspaces").then(async (response) => {
      if (response.status === 401) { window.location.href = "/login"; return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load workspaces");
      setWorkspaces(data.workspaces);
      if (data.workspaces[0]) setWorkspaceId(data.workspaces[0].id);
    }).catch((reason) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/content?workspaceId=${encodeURIComponent(workspaceId)}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load saved content");
      setItems(data.items);
    }).catch((reason) => setError(reason.message));
  }, [workspaceId]);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspaceId) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, prompt: form.get("prompt"), channel: form.get("channel"), tone: form.get("tone") }),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (!response?.ok) setError(data?.error || "Generation failed");
    else setItems((current) => [data.content, ...current]);
    setBusy(false);
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return <main className="studio-shell"><header className="studio-header"><a className="brand" href="/">✦ LumaForge</a><div className="studio-controls"><label className="workspace-label">Workspace<select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)}>{workspaces.map((workspace) => <option value={workspace.id} key={workspace.id}>{workspace.name} · {workspace.plan}</option>)}</select></label><button className="button secondary" onClick={signOut}>Sign out</button></div></header><section className="studio-main"><p className="eyebrow violet">STUDIO</p><h1>Turn a brief into a first draft.</h1><p className="auth-muted">Generated content is saved to your workspace. Always review before publishing.</p><form className="studio-form" onSubmit={generate}><label>What would you like to create?<textarea name="prompt" minLength={3} maxLength={4000} rows={5} required placeholder="Describe the idea, audience, offer, and any details the draft should include…" /></label><div className="studio-options"><label>Channel<select name="channel"><option value="LINKEDIN">LinkedIn</option><option value="INSTAGRAM">Instagram</option><option value="EMAIL">Email</option><option value="BLOG">Blog</option><option value="X">X</option></select></label><label>Tone<select name="tone"><option value="CLEAR">Clear</option><option value="BOLD">Bold</option><option value="WARM">Warm</option><option value="PLAYFUL">Playful</option></select></label></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary" disabled={busy || !workspaceId}>{busy ? "Drafting…" : "Generate draft"}</button></form><section className="library"><div className="panel-heading"><div><p className="eyebrow">CONTENT LIBRARY</p><h2>Saved drafts</h2></div><span className="auth-muted">{items.length} items</span></div>{items.length === 0 ? <p className="auth-muted">Your saved drafts will appear here.</p> : items.map((item) => <article className="saved-item" key={item.id}><div><span className="status ready">{item.status} · {item.channel}</span><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</section></section></main>;
}
