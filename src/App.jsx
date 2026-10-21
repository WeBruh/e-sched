import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Subjects from "./Subjects";
import Schedule from "./Schedule";
import useLocalStorage from "./useLocalStorage";
import banner from "./assets/miles-gwen.jpg";
import History from "./History";
import Backup from "./Backup";

const TABS = ["Dashboard", "Subjects", "Schedule", "History"];

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [subjects, setSubjects] = useLocalStorage("subjects", []);
  const [classes, setClasses] = useLocalStorage("classes", []);
  const [attendance, setAttendance] = useLocalStorage("attendance", {});
  const [settings, setSettings] = useLocalStorage("settings", { lat: null, lng: null, radius: 150, grace: 10 });

  return (
    <div className="app">
      <header className="header">
        <h1>E-Sched</h1>
      </header>

      <main className="content">
        <h2>{tab}</h2>

        {tab === "Dashboard" && (
  <>
    <div className="banner" style={{ backgroundImage: `url(${banner})` }} />
    <Dashboard
      subjects={subjects}
      classes={classes}
      attendance={attendance}
      setAttendance={setAttendance}
      settings={settings}
      setSettings={setSettings}
    />
  </>
)}

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