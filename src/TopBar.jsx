import { useState } from "react";
import { I } from "./Icons";
import { useT } from "./i18n";

const initials = (n) => (n || "").trim().split(/\s+/).slice(0, 2).map((w) => (w[0] || "").toUpperCase()).join("") || "?";

export default function TopBar({ profile, subjects, tasks, bell, setTab, onMenu }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [brokenPhoto, setBrokenPhoto] = useState("");
  const term = q.trim().toLowerCase();
  const has = (v) => (v || "").toLowerCase().includes(term);
  const results = term
    ? [
        ...subjects
          .filter((x) => has(x.name) || has(x.instructor) || has(x.room))
          .map((x) => ({ id: `s${x.id}`, title: x.name, sub: [x.instructor, x.room && t("Room {room}", { room: x.room })].filter(Boolean).join(" • ") || t("Subject"), tab: "Subjects" })),
        ...tasks
          .filter((k) => has(k.title))
          .map((k) => ({ id: `t${k.id}`, title: k.title, sub: `${t("Reminder")} • ${k.date}`, tab: "Calendar" })),
      ].slice(0, 6)
    : [];

  return (
    <header className="topbar">
      <button className="tb-menu" aria-label={t("Menu")} onClick={onMenu}><I.Menu width="24" height="24" /></button>
      <div className="tb-logo"><img src="/favicon.svg" alt="" /><span>E-SCHED</span></div>

      <div className="tb-search">
        <I.Search width="18" height="18" />
        <input placeholder={t("Search classes, tasks, or anything...")} value={q} onChange={(e) => setQ(e.target.value)} />
        {term && (
          <div className="sr">
            {results.length === 0 && <div className="sr-empty">{t("No matches")}</div>}
            {results.map((r) => (
              <button key={r.id} onClick={() => { setTab(r.tab); setQ(""); }}>
                <b>{r.title}</b><small>{r.sub}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tb-right">
        <button className="tb-btn" aria-label={t("Reminders")} onClick={() => setTab("Tasks")}>
          <I.Bell width="20" height="20" />
          {bell > 0 && <span className="badge">{bell}</span>}
        </button>
        <button className="me" aria-label={t("Profile")} onClick={() => setTab("Profile")}>
          {profile.photo && brokenPhoto !== profile.photo
            ? <img className="avatar" src={profile.photo} alt="" onError={() => setBrokenPhoto(profile.photo)} />
            : <span className="avatar">{initials(profile.name)}</span>}
          <span className="me-t"><b>{profile.name || t("Student")}</b><small>{t("Student")}</small></span>
          <I.Chevron width="16" height="16" />
        </button>
      </div>
    </header>
  );
}
