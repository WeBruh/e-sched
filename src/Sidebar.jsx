import { I } from "./Icons";

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
  return (
    <aside className="sidebar">
      <div className="sb-logo"><img src="/favicon.svg" alt="" /><span>E-SCHED</span></div>
      <nav>
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} className={`sb-item ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
            <Icon width="20" height="20" />{label}
          </button>
        ))}
      </nav>
      <div className="sb-h">Quick Actions</div>
      <button className="qa" onClick={() => setTab("Calendar")}><I.Plus width="18" height="18" />Add Reminder</button>
      <button className="qa" onClick={() => setTab("Schedule")}><I.Schedule width="18" height="18" />View Schedule</button>
      <button className="qa" onClick={() => setTab("Dashboard")}><I.History width="18" height="18" />Mark Attendance</button>
      <div className="sb-foot">
        <button className={`sb-item ${tab === "Settings" ? "on" : ""}`} onClick={() => setTab("Settings")}>
          <I.Settings width="20" height="20" />Settings
        </button>
        <button className={`sb-item ${tab === "Profile" ? "on" : ""}`} onClick={() => setTab("Profile")}>
          <I.Profile width="20" height="20" />Profile
        </button>
        <small>v2.0.0</small>
      </div>
    </aside>
  );
}
