import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Subjects from "./Subjects";
import Schedule from "./Schedule";
import Tasks from "./Tasks";
import TaskList from "./TaskList";
import History from "./History";
import Reminders from "./Reminders";
import Settings from "./Settings";
import Insights from "./Insights";
import Records from "./Records";
import Profile, { Welcome, emptyProfile } from "./Profile";
import AlertPopup from "./AlertPopup";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import Modal from "./Modal";
import Skeleton from "./Skeleton";
import BackupNudge from "./BackupNudge";
import SyncDialog from "./SyncDialog";
import useLocalStorage from "./useLocalStorage";
import { I18nContext, makeI18n, detectLang } from "./i18n";
import { configureAlerts, askPermission } from "./notifications";
import { requestPersistence } from "./persist";
import { initSync } from "./sync";
import { unlockAudio, setSound } from "./sound";
import { buildRows, isoDate } from "./stats";

const TITLES = { History: "Attendance", Insights: "Reports" };
const SIZES = { m: "16px", l: "18px", xl: "20px" };
const SKELETON_MS = 1300; // how long the placeholder screen shows. Set to 0 to skip it.

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [recStatus, setRecStatus] = useState("Absent");
  const [ready, setReady] = useState(false);
  const [pendingSettingsNav, setPendingSettingsNav] = useState(null);
  const [subjects, setSubjects] = useLocalStorage("subjects", []);
  const [classes, setClasses] = useLocalStorage("classes", []);
  const [attendance, setAttendance] = useLocalStorage("attendance", {});
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [profile, setProfile] = useLocalStorage("profile", emptyProfile);
  const [settings, setSettings] = useLocalStorage("settings", {
    lat: null, lng: null, radius: 150, grace: 10, reminders: true, alertMode: "manual", alertMinutes: 2,
    sound: "glass", textSize: "l", lang: null,
  });
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const settingsDirty = JSON.stringify(settingsDraft) !== JSON.stringify(settings);

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
    configureAlerts({ mode: settings.alertMode || "manual", minutes: settings.alertMinutes || 2 });
  }, [settings.alertMode, settings.alertMinutes]);

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
  const attemptSetTab = (next) => {
    if (tab === "Settings" && settingsDirty && next !== "Settings") {
      setPendingSettingsNav(next);
      return;
    }
    if (next === "Settings" && tab !== "Settings") setSettingsDraft(settings);
    setTab(next);
  };
  const confirmSettingsLeave = (action) => {
    const target = pendingSettingsNav;
    setPendingSettingsNav(null);
    if (!target) return;
    if (action === "save") {
      setSettings(settingsDraft);
      setTab(target);
      return;
    }
    if (action === "discard") {
      setSettingsDraft(settings);
      setTab(target);
    }
  };
  const saveSettings = () => setSettings(settingsDraft);
  const back = () => attemptSetTab("Dashboard");
  const openRecords = (s) => { setRecStatus(s); attemptSetTab("Records"); };

  return (
    <I18nContext.Provider value={i18n}>
      <div className="shell">
        <Reminders tasks={tasks} enabled={settings.reminders !== false} />
        <AlertPopup settings={settings} />
        <SyncDialog />

        <Sidebar tab={tab} setTab={attemptSetTab} />

        <div className="main-col">
          <TopBar profile={profile} subjects={subjects} tasks={tasks} bell={bell} setTab={attemptSetTab} />

          <main className="content" key={ready ? tab : "sk"}>
            {!ready ? <Skeleton /> : (
              <>
                {tab !== "Dashboard" && <h2>{t(TITLES[tab] || tab)}</h2>}

                {tab === "Dashboard" && (
                  <>
                    <BackupNudge hasData={subjects.length > 0} />
                    <Dashboard subjects={subjects} classes={classes} attendance={attendance} setAttendance={setAttendance}
                      settings={settings} tasks={tasks} setTasks={setTasks} openRecords={openRecords} go={setTab} profile={profile} />
                  </>
                )}
                {tab === "Subjects" && <Subjects subjects={subjects} setSubjects={setSubjects} classes={classes} />}
                {tab === "Schedule" && <Schedule subjects={subjects} classes={classes} setClasses={setClasses} go={setTab} />}
                {tab === "Calendar" && <Tasks tasks={tasks} setTasks={setTasks} />}
                {tab === "Tasks" && <TaskList tasks={tasks} setTasks={setTasks} go={setTab} />}
                {tab === "History" && <History subjects={subjects} classes={classes} attendance={attendance} />}
                {tab === "Insights" && <Insights rows={rows} subjects={subjects} onBack={back} />}
                {tab === "Records" && <Records rows={rows} setAttendance={setAttendance} initial={recStatus} onBack={back} />}
                {tab === "Profile" && <Profile profile={profile} setProfile={setProfile} onBack={back} />}
                {tab === "Settings" && (
                  <Settings
                    settings={settingsDraft}
                    setSettings={setSettingsDraft}
                    isDirty={settingsDirty}
                    onSave={saveSettings}
                    classes={classes}
                    subjects={subjects}
                    onBack={back}
                  />
                )}
              </>
            )}
          </main>
        </div>

        <BottomNav tab={tab} setTab={attemptSetTab} />

        {ready && needsProfile && (
          <Welcome lang={lang} onLang={(l) => setSettings({ ...settings, lang: l })}
            onSave={(p) => { setProfile(p); unlockAudio(); askPermission(); requestPersistence(); }} />
        )}

        {pendingSettingsNav && (
          <Modal tone="info" icon="info" title={t("Unsaved changes")} text={t("Save your settings before leaving?")}
            confirmLabel={t("Save changes")} cancelLabel={t("Discard")} onConfirm={() => confirmSettingsLeave("save")} onCancel={() => confirmSettingsLeave("discard")} />
        )}
      </div>
    </I18nContext.Provider>
  );
}
