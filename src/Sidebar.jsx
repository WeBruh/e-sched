import { I } from "./Icons";
import { useT } from "./i18n";

const MENU = [
  { id: "Dashboard", label: "Dashboard", Icon: I.Grid },
  { id: "Subjects", label: "Subjects", Icon: I.Subjects },
  { id: "Schedule", label: "Schedule", Icon: I.Schedule },
  { id: "Calendar", label: "Calendar", Icon: I.Calendar },
  { id: "Tasks", label: "Tasks", Icon: I.Tasks },
  { id: "History", label: "Attendance", Icon: I.History },
  { id: "Insights", label: "Reports", Icon: I.Insights },
  { id: "Wallpapers", label: "Wallpapers", Icon: I.Wallpaper },
];

// Desktop: always visible, can shrink to an icon rail. Phone: slides in from the left.
export default function Sidebar({ tab, setTab, collapsed, setCollapsed, open, setOpen }) {
  const t = useT();
  const go = (id) => { setTab(id); setOpen(false); };
  const toggle = () => (window.innerWidth < 900 ? setOpen(false) : setCollapsed(!collapsed));

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

      </aside>
    </>
  );
}
