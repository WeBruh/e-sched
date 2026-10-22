import { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Subjects from "./Subjects";
import Schedule from "./Schedule";
import Tasks from "./Tasks";
import TaskList from "./TaskList";
import History from "./History";
import Backup from "./Backup";
import Reminders from "./Reminders";
import Settings from "./Settings";
import Insights from "./Insights";
import Records from "./Records";
import Profile, { Welcome } from "./Profile";
import { emptyProfile } from "./profileData";
import AlertPopup from "./AlertPopup";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import Skeleton from "./Skeleton";
import BackupNudge from "./BackupNudge";
import useLocalStorage from "./useLocalStorage";
import { configureAlerts, askPermission } from "./notifications";
import { requestPersistence } from "./persist";
import { unlockAudio } from "./sound";
import { buildRows, isoDate } from "./stats";

const TITLES = { History: "Attendance", Insights: "Reports" };
const SKELETON_MS = 1300; // how long the placeholder screen shows. Set to 0 to skip it.

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [recStatus, setRecStatus] = useState("Absent");
  const [ready, setReady] = useState(false);
  const [subjects, setSubjects] = useLocalStorage("subjects", []);
  const [classes, setClasses] = useLocalStorage("classes", []);
  const [attendance, setAttendance] = useLocalStorage("attendance", {});
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [profile, setProfile] = useLocalStorage("profile", emptyProfile);
  const [settings, setSettings] = useLocalStorage("settings", {
    lat: null, lng: null, radius: 150, grace: 10, reminders: true, alertMode: "manual", alertMinutes: 2,
  });

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
  const back = () => setTab("Dashboard");
  const openRecords = (s) => { setRecStatus(s); setTab("Records"); };

  return (
    <div className="shell">
      <Reminders tasks={tasks} enabled={settings.reminders !== false} />
      <AlertPopup settings={settings} />

      <Sidebar tab={tab} setTab={setTab} />

      <div className="main-col">
        <TopBar profile={profile} subjects={subjects} tasks={tasks} bell={bell} setTab={setTab} />

        <main className="content" key={ready ? tab : "sk"}>
          {!ready ? <Skeleton /> : (
            <>
              {tab !== "Dashboard" && <h2>{TITLES[tab] || tab}</h2>}

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
              {tab === "History" && (
                <>
                  <History subjects={subjects} classes={classes} attendance={attendance} />
                  <Backup subjects={subjects} classes={classes} attendance={attendance} tasks={tasks} profile={profile}
                    setSubjects={setSubjects} setClasses={setClasses} setAttendance={setAttendance} setTasks={setTasks} setProfile={setProfile} />
                </>
              )}
              {tab === "Insights" && <Insights rows={rows} subjects={subjects} onBack={back} />}
              {tab === "Records" && <Records rows={rows} setAttendance={setAttendance} initial={recStatus} onBack={back} />}
              {tab === "Profile" && <Profile profile={profile} setProfile={setProfile} onBack={back} />}
              {tab === "Settings" && <Settings settings={settings} setSettings={setSettings} classes={classes} subjects={subjects} onBack={back} />}
            </>
          )}
        </main>
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      {ready && needsProfile && (
        <Welcome onSave={(p) => { setProfile(p); unlockAudio(); askPermission(); requestPersistence(); }} />
      )}
    </div>
  );
}
