import { useEffect, useState } from "react";
import { unlockAudio } from "./sound";
import "./App.css";
import Dashboard from "./Dashboard";
import Subjects from "./Subjects";
import Schedule from "./Schedule";
import useLocalStorage from "./useLocalStorage";
import banner from "./assets/miles-gwen.jpg";
import History from "./History";
import Backup from "./Backup";
import Tasks from "./Tasks";
import Reminders from "./Reminders";
import Settings from "./Settings";
import AlertPopup from "./AlertPopup";
import { configureAlerts } from "./notifications";

const TABS = ["Dashboard", "Subjects", "Schedule", "Tasks", "History", "Settings"];

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [subjects, setSubjects] = useLocalStorage("subjects", []);
  const [classes, setClasses] = useLocalStorage("classes", []);
  const [attendance, setAttendance] = useLocalStorage("attendance", {});
  const [settings, setSettings] = useLocalStorage("settings", {
    lat: null,
    lng: null,
    radius: 150,
    grace: 10,
    notify: false,
    alertMode: "manual",
    alertMinutes: 2,
  });
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [bannerOk, setBannerOk] = useState(false);

  useEffect(() => {
  configureAlerts({ mode: settings.alertMode || "manual", minutes: settings.alertMinutes || 2 });
}, [settings.alertMode, settings.alertMinutes]);

useEffect(() => {
  const block = (e) => { if (!/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) e.preventDefault(); };
  document.addEventListener("contextmenu", block);
  return () => document.removeEventListener("contextmenu", block);
}, []);

useEffect(() => {
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.__splashDone?.();
  const t1 = setTimeout(() => document.getElementById("splash")?.classList.add("hide"), 1100);
  const t2 = setTimeout(() => document.getElementById("splash")?.remove(), 1700);
  return () => { clearTimeout(t1); clearTimeout(t2); };
}, []);

  return (
    <div className="app">
      <Reminders tasks={tasks} enabled={settings.notify} />
      <AlertPopup settings={settings} />
      <header className="header">
  <h1>E-Sched</h1>
  <button className="gear" aria-label="Settings" onClick={() => setTab("Settings")}>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="6.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="10.6" y="1.8" width="2.8" height="3.6" rx="1" fill="currentColor" stroke="none" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  </button>
</header>

      <main className="content" key={tab}>
        <h2>{tab}</h2>

        {tab === "Dashboard" && (
  <>
   <div className={`banner ${bannerOk ? "" : "shimmer"}`}
  style={bannerOk ? { backgroundImage: `url(${banner})` } : undefined} />
<img src={banner} alt="" hidden onLoad={() => setBannerOk(true)} />
    <Dashboard
     tasks={tasks} setTasks={setTasks}
      subjects={subjects}
      classes={classes}
      attendance={attendance}
      setAttendance={setAttendance}
      settings={settings}
      setSettings={setSettings}
    />
  </>
)}
{tab === "Settings" && (
  <Settings settings={settings} setSettings={setSettings} classes={classes} subjects={subjects} onBack={() => setTab("Dashboard")} />
)}

        {tab === "Tasks" && <Tasks tasks={tasks} setTasks={setTasks} />}

        {tab === "Subjects" && (
          <Subjects subjects={subjects} setSubjects={setSubjects} />
        )}

        {tab === "Schedule" && (
          <Schedule subjects={subjects} classes={classes} setClasses={setClasses} />
        )}

        {tab === "History" && (
  <>
    <History subjects={subjects} classes={classes} attendance={attendance} />
    <Backup
      tasks={tasks} setTasks={setTasks}
      subjects={subjects} classes={classes} attendance={attendance}
      setSubjects={setSubjects} setClasses={setClasses} setAttendance={setAttendance}
    />
  </>
)}
      </main>

      <nav className="bottom-nav">
        {TABS.map((name) => (
          <button
            key={name}
            className={tab === name ? "active" : ""}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </nav>
    </div>
  );
}