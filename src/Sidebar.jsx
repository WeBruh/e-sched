import { I } from "./Icons";
import { useT } from "./i18n";

const NAV = [
  { id: "Dashboard", label: "Dashboard", Icon: I.Dashboard },
  { id: "Subjects", label: "Subjects", Icon: I.Subjects },
  { id: "Schedule", label: "Schedule", Icon: I.Schedule },
  { id: "Calendar", label: "Calendar", Icon: I.Calendar },
  { id: "Tasks", label: "Tasks", Icon: I.Tasks },
  { id: "History", label: "Attendance", Icon: I.History },
  { id: "Insights", label: "Reports", Icon: I.Insights },
];

export default function Sidebar({ tab, setTab }) {
  const t = useT();
  return (
    <aside className="sidebar">
      <div className="sb-logo"><img src="/favicon.svg" alt="" /><span>E-SCHED</span></div>
      <nav>
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} className={`sb-item ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
            <Icon width="22" height="22" />{t(label)}
          </button>
        ))}
      </nav>
      <div className="sb-h">{t("Quick Actions")}</div>
      <button className="qa" onClick={() => setTab("Calendar")}><I.Plus width="18" height="18" />{t("Add Reminder")}</button>
      <button className="qa" onClick={() => setTab("Schedule")}><I.Schedule width="18" height="18" />{t("View Schedule")}</button>
      <button className="qa" onClick={() => setTab("Dashboard")}><I.History width="18" height="18" />{t("Mark Attendance")}</button>
      <div className="sb-foot">
        <button className={`sb-item ${tab === "Settings" ? "on" : ""}`} onClick={() => setTab("Settings")}>
          <I.Settings width="22" height="22" />{t("Settings")}
        </button>
        <button className={`sb-item ${tab === "Profile" ? "on" : ""}`} onClick={() => setTab("Profile")}>
          <I.Profile width="22" height="22" />{t("Profile")}
        </button>
        <small>v3.0.0</small>
      </div>
    </aside>
  );
}
