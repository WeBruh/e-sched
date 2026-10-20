import { useState } from "react";
import "./App.css";
import Subjects from "./Subjects";
import useLocalStorage from "./useLocalStorage";


const TABS = ["Dashboard", "Subjects", "Schedule", "History"];

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [subjects, setSubjects] = useLocalStorage("subjects", []);

  return (
    <div className="app">
      <header className="header">
        <h1>E-Sched</h1>
      </header>

      <main className="content">
  <h2>{tab}</h2>
  {tab === "Subjects" ? (
    <Subjects subjects={subjects} setSubjects={setSubjects} />
  ) : (
    <p>This page is coming soon.</p>
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