const metrics = [
  { label: "Generations this month", value: "18 / 100", detail: "Creator plan" },
  { label: "Awaiting approval", value: "07", detail: "Across 3 workspaces" },
  { label: "Scheduled this week", value: "12", detail: "Next: Tue, 10:30" },
];

const navItems = ["Command Center", "Studio", "Content Library", "Approvals", "Calendar", "Brand System", "Analytics"];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>LumaForge</span></div>
        <p className="eyebrow">WORKSPACE</p>
        <div className="workspace">Northstar Studio <span>⌄</span></div>
        <nav>{navItems.map((item, index) => <a className={index === 0 ? "active" : ""} href="#" key={item}>{item}</a>)}</nav>
        <div className="sidebar-bottom"><a href="#">Account & Billing</a><div className="profile"><span className="avatar">AP</span><span><strong>Angel Pure</strong><small>Creator plan</small></span></div></div>
      </aside>
      <section className="content">
        <header className="topbar"><div><p className="eyebrow">MONDAY, NOVEMBER 9, 2026</p><h1>Good morning, Angel.</h1></div><button className="button primary">＋ New creation</button></header>
        <div className="hero"><div><p className="eyebrow violet">COMMAND CENTER</p><h2>Create clearly.<br /><span>Publish confidently.</span></h2><p className="hero-copy">Your focused space for turning ideas into on-brand content that moves.</p><button className="button light">Open Studio <span>→</span></button></div><div className="orb" aria-hidden="true"><div className="orb-core" /></div></div>
        <section className="metric-grid">{metrics.map((metric) => <article className="metric" key={metric.label}><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.detail}</span></article>)}</section>
        <section className="lower-grid"><article className="panel"><div className="panel-heading"><div><p className="eyebrow">RECENT WORK</p><h3>Keep the momentum</h3></div><a href="#">View library →</a></div><div className="work-row"><span className="status ready">READY</span><div><strong>Autumn launch campaign</strong><p>4 assets · Updated 18 min ago</p></div><span className="arrow">→</span></div><div className="work-row"><span className="status review">REVIEW</span><div><strong>Founder story — LinkedIn</strong><p>2 assets · Updated 1 hr ago</p></div><span className="arrow">→</span></div><div className="work-row"><span className="status draft">DRAFT</span><div><strong>Weekly newsletter #42</strong><p>1 asset · Updated yesterday</p></div><span className="arrow">→</span></div></article><article className="panel insight"><p className="eyebrow">BRAND PULSE</p><h3>Your voice is on point.</h3><p>Content is tracking <strong>92% aligned</strong> with your Northstar brand system this month.</p><div className="progress"><span /></div><a href="#">Review brand system →</a></article></section>
      </section>
    </main>
  );
}
