import { useState } from "react";
import "./App.css";

const TABS = ["Dashboard", "Subjects", "Schedule", "History"];

export default function App() {
  const [tab, setTab] = useState("Dashboard");

  return (
    <div className="app">
      <header className="header">
        <h1>E-Sched</h1>
      </header>

      <main className="content">
        <h2>{tab}</h2>
        <p>This page is coming soon.</p>
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