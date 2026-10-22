import { useState } from "react";
import { I } from "./Icons";

const initials = (n) => (n || "").trim().split(/\s+/).slice(0, 2).map((w) => (w[0] || "").toUpperCase()).join("") || "?";

export default function TopBar({ profile, subjects, tasks, bell, setTab }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const has = (v) => (v || "").toLowerCase().includes(term);
  const results = term
    ? [
        ...subjects
          .filter((s) => has(s.name) || has(s.instructor) || has(s.room))
          .map((s) => ({ id: `s${s.id}`, title: s.name, sub: [s.instructor, s.room && `Room ${s.room}`].filter(Boolean).join(" • ") || "Subject", tab: "Subjects" })),
        ...tasks
          .filter((k) => has(k.title))
          .map((k) => ({ id: `t${k.id}`, title: k.title, sub: `Reminder • ${k.date}`, tab: "Calendar" })),
      ].slice(0, 6)
    : [];

  return (
    <header className="topbar">
      <div className="tb-logo"><img src="/favicon.svg" alt="" /><span>E-SCHED</span></div>

      <div className="tb-search">
        <I.Search width="18" height="18" />
        <input placeholder="Search classes, tasks, or anything..." value={q} onChange={(e) => setQ(e.target.value)} />
        {term && (
          <div className="sr">
            {results.length === 0 && <div className="sr-empty">No matches</div>}
            {results.map((r) => (
              <button key={r.id} onClick={() => { setTab(r.tab); setQ(""); }}>
                <b>{r.title}</b><small>{r.sub}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tb-right">
        <button className="tb-btn" aria-label="Reminders" onClick={() => setTab("Tasks")}>
          <I.Bell width="20" height="20" />
          {bell > 0 && <span className="badge">{bell}</span>}
        </button>
        <button className="me" aria-label="Profile" onClick={() => setTab("Profile")}>
          <span className="avatar">{initials(profile.name)}</span>
          <span className="me-t"><b>{profile.name || "Student"}</b><small>Student</small></span>
          <I.Chevron width="16" height="16" />
        </button>
      </div>
    </header>
  );
}
