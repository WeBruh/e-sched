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
import OpenPopup from "./OpenPopup";
import PullRefresh from "./PullRefresh";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Skeleton from "./Skeleton";
import BackupNudge from "./BackupNudge";
import IdleToday from "./IdleToday";
import WallpaperPicker from "./WallpaperPicker";
import Year from "./Year";
import useLocalStorage from "./useLocalStorage";
import { I18nContext, makeI18n, detectLang } from "./i18n";
import { askPermission } from "./notifications";
import { requestPersistence } from "./persist";
import { unlockAudio, setSound } from "./sound";
import { buildRows, isoDate } from "./stats";
import { WALLPAPERS } from "./wallpapers";
import SpiderWallpaper from "./SpiderWallpaper";

const TITLES = { History: "Attendance", Insights: "Reports", Wallpapers: "Wallpapers" };
const SIZES = { m: "17px", l: "19px", xl: "21px" };
const SKELETON_MS = 1300; // how long the placeholder screen shows. Set to 0 to skip it.

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [recStatus, setRecStatus] = useState("Absent");
  const [ready, setReady] = useState(false);
  const [idleHidden, setIdleHidden] = useState(false);
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
    const t1 = setTimeout(() => document.getElementById("splash")?.classList.add("hide"), 800);
    const t2 = setTimeout(() => document.getElementById("splash")?.remove(), 1400);
    const t3 = setTimeout(() => setReady(true), SKELETON_MS);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 899px)");
    let timer;
    const scheduleHide = () => {
      clearTimeout(timer);
      if (!mobile.matches) {
        setIdleHidden(false);
        return;
      }
      timer = setTimeout(() => setIdleHidden(true), 5000);
    };
    const onActivity = () => {
      setIdleHidden(false);
      scheduleHide();
    };
    const onViewportChange = () => {
      setIdleHidden(false);
      scheduleHide();
    };

    scheduleHide();
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("pointermove", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("touchmove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    mobile.addEventListener("change", onViewportChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("pointermove", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("touchmove", onActivity);
      window.removeEventListener("keydown", onActivity);
      mobile.removeEventListener("change", onViewportChange);
    };
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

  // Wallpaper: list lives in wallpapers.js (image = still, video = live)
  const saved = settings.wallpaper;
  // spider = default until the user picks something (also if a saved wallpaper was removed)
  const wpId = saved === "none" ? "none" : WALLPAPERS.some((w) => w.id === saved) ? saved : "spider";
  const wp = WALLPAPERS.find((w) => w.id === wpId);
  const wallpaper = wp ? wp.src : null;

  // Live wallpapers: save only the chosen video for offline use
  useEffect(() => {
    if (!wp || wp.type !== "video" || !("caches" in window)) return;
    caches.open("esched-wp")
      .then((c) => c.match(wp.src).then((hit) => hit || c.add(wp.src)))
      .catch(() => {});
  }, [wp]);

  return (
    <I18nContext.Provider value={i18n}>
      {wp && (
        <div className={`wallpaper-layer wallpaper-${wp.id} ${idleHidden ? "wallpaper-idle" : ""}`} aria-hidden="true">
          {wp.type === "spider" ? (
            <SpiderWallpaper />
          ) : wp.type === "image" ? (
            <img key={wp.src} src={wp.src} alt="" />
          ) : (
            <video key={wp.src} autoPlay muted loop playsInline preload="none">
              <source src={wp.src} type="video/mp4" />
            </video>
          )}
        </div>
      )}
      <div className={`shell ${wallpaper ? `wallpaper-on wallpaper-${wpId}` : ""} ${idleHidden ? "idle-hidden" : ""}`}>
        <Reminders tasks={tasks} classes={classes} subjects={subjects} attendance={attendance} grace={settings.grace}
          enabled={settings.reminders !== false} flashOn={settings.flash !== false} />
        <AlertPopup />
        <ScreenFlash enabled={settings.flash !== false} />
        <OpenPopup ready={ready} />
        <PullRefresh />

        <Sidebar tab={page} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} open={menuOpen} setOpen={setMenuOpen} />

        <div className="main-col">
          <TopBar profile={profile} subjects={subjects} tasks={tasks} bell={bell} setTab={setTab} onMenu={() => setMenuOpen(true)} />
          {ready && idleHidden && (
            <IdleToday classes={classes} subjects={subjects} tasks={tasks} />
          )}

          <main className="content" key={ready ? page : "sk"}>
            {!ready ? <Skeleton /> : (
              <>
                {page !== "Dashboard" && page !== "Year" && <h2>{t(TITLES[page] || page)}</h2>}

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
                {page === "Wallpapers" && <WallpaperPicker settings={settings} setSettings={setSettings} />}
                {page === "Year" && (
                  <Year subjects={subjects} classes={classes} attendance={attendance} setAttendance={setAttendance}
                    settings={settings} setSettings={setSettings} />
                )}
                {page === "Profile" && (
                  <Profile profile={profile} setProfile={setProfile} settings={settings} setSettings={setSettings} classes={classes} subjects={subjects} />
                )}
              </>
            )}
          </main>
        </div>

        {ready && needsProfile && (
          <Welcome lang={lang} onLang={(l) => setSettings({ ...settings, lang: l })}
            onSave={(p, year) => {
              setProfile(p);
              setSettings({ ...settings, ...year });
              unlockAudio();
              askPermission();
              requestPersistence();
            }} />
        )}
      </div>
    </I18nContext.Provider>
  );
}
