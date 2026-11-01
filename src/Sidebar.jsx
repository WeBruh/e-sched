import { I } from "./Icons";
import { useSync, signInGoogle, signOutUser } from "./sync";
import { useT } from "./i18n";

const MENU = [
  { id: "Dashboard", label: "Dashboard", Icon: I.Grid },
  { id: "Subjects", label: "Subjects", Icon: I.Subjects },
  { id: "Schedule", label: "Schedule", Icon: I.Schedule },
  { id: "Calendar", label: "Calendar", Icon: I.Calendar },
  { id: "Tasks", label: "Tasks", Icon: I.Tasks },
  { id: "History", label: "Attendance", Icon: I.History },
  { id: "Insights", label: "Reports", Icon: I.Insights },
];

// Desktop: always visible, can shrink to an icon rail. Phone: slides in from the left.
export default function Sidebar({ tab, setTab, collapsed, setCollapsed, open, setOpen }) {
  const t = useT();
  const s = useSync();
  const go = (id) => { setTab(id); setOpen(false); };
  const toggle = () => (window.innerWidth < 900 ? setOpen(false) : setCollapsed(!collapsed));
  const signIn = () => (s.enabled && s.ready ? signInGoogle().catch(() => go("Profile")) : go("Profile"));

  return (
    <>
      {open && <div className="nav-scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${open ? "open" : ""}`}>
        <div className="sb-top">
          <div className="sb-logo"><img src="/favicon.svg" alt="" /><span>E-SCHED</span></div>
          <button className="sb-toggle" aria-label={collapsed ? t("Expand menu") : t("Collapse menu")} onClick={toggle}>
            {collapsed ? <I.ChevR width="18" height="18" /> : <I.ChevL width="18" height="18" />}
          </button>
        </div>

        <div className="sb-h">{t("Menu")}</div>
        <nav>
          {MENU.map(({ id, label, Icon }) => (
            <button key={id} className={`sb-item ${tab === id ? "on" : ""}`} title={t(label)} onClick={() => go(id)}>
              <Icon width="24" height="24" /><span>{t(label)}</span>
            </button>
          ))}
        </nav>

        <div className="sb-h">{t("Account")}</div>
        <button className={`sb-item ${tab === "Profile" ? "on" : ""}`} title={t("Profile")} onClick={() => go("Profile")}>
          <I.Profile width="24" height="24" /><span>{t("Profile")}</span>
        </button>
        {s.user && (
          <button className="sb-item" title={t("Log out")} onClick={() => { signOutUser(); setOpen(false); }}>
            <I.Logout width="24" height="24" /><span>{t("Log out")}</span>
          </button>
        )}

        <div className="sb-card">
          <span className="sb-bolt"><I.Bolt width="20" height="20" /></span>
          <div className="sb-card-t">
            <small>{t("Sync")}</small>
            <b>{s.user ? s.user.name || t("Signed in") : t("Not signed in")}</b>
          </div>
          <p>{s.user ? t("Your schedule is on every device.") : t("Keep your schedule on every device.")}</p>
          {s.user
            ? <button className="sb-btn" onClick={() => go("Profile")}>{t("Manage account")}</button>
            : <button className="sb-btn" onClick={signIn}>{t("Sign in with Google")}</button>}
        </div>
      </aside>
    </>
  );
}
