import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Subjects from "./Subjects";
import Schedule from "./Schedule";
import Tasks from "./Tasks";
import TaskList from "./TaskList";
import History from "./History";
import Reminders from "./Reminders";
import Insights from "./Insights";
import Records from "./Records";
import Profile, { Welcome, emptyProfile } from "./Profile";
import AlertPopup from "./AlertPopup";
import ScreenFlash from "./ScreenFlash";
import PullRefresh from "./PullRefresh";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Skeleton from "./Skeleton";
import BackupNudge from "./BackupNudge";
import SyncDialog from "./SyncDialog";
import useLocalStorage from "./useLocalStorage";
import { I18nContext, makeI18n, detectLang } from "./i18n";
import { askPermission } from "./notifications";
import { requestPersistence } from "./persist";
import { initSync } from "./sync";
import { unlockAudio, setSound } from "./sound";
import { buildRows, isoDate } from "./stats";

const TITLES = { History: "Attendance", Insights: "Reports" };
const SIZES = { m: "17px", l: "19px", xl: "21px" };
const SKELETON_MS = 1300; // how long the placeholder screen shows. Set to 0 to skip it.

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [recStatus, setRecStatus] = useState("Absent");
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(() => {
    try { return localStorage.getItem("esched_nav_collapsed") === "1"; } catch { return false; }
  });
  const [subjects, setSubjects] = useLocalStorage("subjects", []);
  const [classes, setClasses] = useLocalStorage("classes", []);
  const [attendance, setAttendance] = useLocalStorage("attendance", {});
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [profile, setProfile] = useLocalStorage("profile", emptyProfile);
  const [settings, setSettings] = useLocalStorage("settings", {
    lat: null, lng: null, radius: 150, grace: 10, reminders: true,
    sound: "glass", textSize: "l", lang: null, roast: true, flash: true,
  });

  const setCollapsed = (v) => {
    setCollapsedState(v);
    try { localStorage.setItem("esched_nav_collapsed", v ? "1" : "0"); } catch { /* ignore */ }
  };

  const lang = settings.lang || detectLang();
  const i18n = useMemo(() => makeI18n(lang), [lang]);
  const t = i18n.t;

  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.__splashDone?.();
    requestPersistence();
    initSync();
    const t1 = setTimeout(() => document.getElementById("splash")?.classList.add("hide"), 800);
    const t2 = setTimeout(() => document.getElementById("splash")?.remove(), 1400);
    const t3 = setTimeout(() => setReady(true), SKELETON_MS);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("esched_lang", lang); } catch { /* ignore */ }
    document.documentElement.lang = lang === "tl" ? "fil" : "en";
  }, [lang]);

  useEffect(() => { document.documentElement.style.fontSize = SIZES[settings.textSize] || SIZES.l; }, [settings.textSize]);
  useEffect(() => { setSound(settings.sound || "glass"); }, [settings.sound]);

  useEffect(() => {
    const block = (e) => { if (!/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) e.preventDefault(); };
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  useEffect(() => {
    const ripple = (e) => {
      const el = e.target.closest?.("button");
      if (!el || el.disabled) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    };
    document.addEventListener("pointerdown", ripple, { passive: true });
    return () => document.removeEventListener("pointerdown", ripple);
  }, []);

  const rows = buildRows(attendance, classes, subjects);
  const needsProfile = !(profile.name || "").trim() || !(profile.studentId || "").trim();
  const todayStr = isoDate(new Date());
  const bell = tasks.filter((k) => !k.done && k.date <= todayStr).length;
  const back = () => setTab("Dashboard");
  const openRecords = (s) => { setRecStatus(s); setTab("Records"); };
  const page = tab === "Settings" ? "Profile" : tab; // Settings now lives inside Profile

  return (
    <I18nContext.Provider value={i18n}>
      <div className="shell">
        <Reminders tasks={tasks} enabled={settings.reminders !== false} flashOn={settings.flash !== false} />
        <AlertPopup />
        <ScreenFlash enabled={settings.flash !== false} />
        <PullRefresh />
        <SyncDialog />

        <Sidebar tab={page} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} open={menuOpen} setOpen={setMenuOpen} />

        <div className="main-col">
          <TopBar profile={profile} subjects={subjects} tasks={tasks} bell={bell} setTab={setTab} onMenu={() => setMenuOpen(true)} />

          <main className="content" key={ready ? page : "sk"}>
            {!ready ? <Skeleton /> : (
              <>
                {page !== "Dashboard" && <h2>{t(TITLES[page] || page)}</h2>}

                {page === "Dashboard" && (
                  <>
                    <BackupNudge hasData={subjects.length > 0} />
                    <Dashboard subjects={subjects} classes={classes} attendance={attendance} setAttendance={setAttendance}
                      settings={settings} tasks={tasks} setTasks={setTasks} openRecords={openRecords} go={setTab} profile={profile} />
                  </>
                )}
                {page === "Subjects" && <Subjects subjects={subjects} setSubjects={setSubjects} classes={classes} />}
                {page === "Schedule" && <Schedule subjects={subjects} classes={classes} setClasses={setClasses} go={setTab} />}
                {page === "Calendar" && <Tasks tasks={tasks} setTasks={setTasks} />}
                {page === "Tasks" && <TaskList tasks={tasks} setTasks={setTasks} go={setTab} />}
                {page === "History" && <History subjects={subjects} classes={classes} attendance={attendance} />}
                {page === "Insights" && <Insights rows={rows} subjects={subjects} onBack={back} />}
                {page === "Records" && <Records rows={rows} setAttendance={setAttendance} initial={recStatus} onBack={back} />}
                {page === "Profile" && (
                  <Profile profile={profile} setProfile={setProfile} settings={settings} setSettings={setSettings} classes={classes} subjects={subjects} />
                )}
              </>
            )}
          </main>
        </div>

        {ready && needsProfile && (
          <Welcome lang={lang} onLang={(l) => setSettings({ ...settings, lang: l })}
            onSave={(p) => { setProfile(p); unlockAudio(); askPermission(); requestPersistence(); }} />
        )}
      </div>
    </I18nContext.Provider>
  );
}
