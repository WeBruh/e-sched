import { useState } from "react";
import { I } from "./Icons";
import { useT } from "./i18n";

const MAIN = [
  { id: "Dashboard", Icon: I.Dashboard },
  { id: "Schedule", Icon: I.Schedule },
  { id: "Calendar", Icon: I.Calendar },
  { id: "Tasks", Icon: I.Tasks },
];
const MORE = [
  { id: "Subjects", label: "Subjects", Icon: I.Subjects },
  { id: "History", label: "Attendance", Icon: I.History },
  { id: "Insights", label: "Reports", Icon: I.Insights },
  { id: "Profile", label: "Profile", Icon: I.Profile },
  { id: "Settings", label: "Settings", Icon: I.Settings },
];

export default function BottomNav({ tab, setTab }) {
  const t = useT();
  const [more, setMore] = useState(false);
  const inMore = MORE.some((m) => m.id === tab);
  return (
    <>
      <nav className="bnav">
        {MAIN.map(({ id, Icon }) => (
          <button key={id} className={tab === id ? "on" : ""} aria-label={t(id)} title={t(id)} onClick={() => setTab(id)}>
            <Icon width="26" height="26" /><span>{t(id)}</span>
          </button>
        ))}
        <button className={inMore || more ? "on" : ""} aria-label={t("More")} title={t("More")} onClick={() => setMore(true)}>
          <I.More width="26" height="26" /><span>{t("More")}</span>
        </button>
      </nav>

      {more && (
        <div className="sheet-back" onClick={() => setMore(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head"><strong>{t("More")}</strong><button onClick={() => setMore(false)}>{t("Close")}</button></div>
            {MORE.map(({ id, label, Icon }) => (
              <button key={id} className={`more-item ${tab === id ? "on" : ""}`} onClick={() => { setMore(false); setTab(id); }}>
                <Icon width="24" height="24" />{t(label)}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
