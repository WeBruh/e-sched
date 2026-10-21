import { useState } from "react";
import { isoDate, toDate } from "./stats";
import { downloadTasksICS } from "./calendar";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const label = (iso) => toDate(iso, "00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const timeNow = () => Date.now();
const INITIAL_NOW = new Date(timeNow());
const INITIAL_TODAY_STR = isoDate(INITIAL_NOW);
const INITIAL_MONTH = new Date(INITIAL_NOW.getFullYear(), INITIAL_NOW.getMonth(), 1);

export default function Tasks({ tasks, setTasks }) {
  const todayStr = INITIAL_TODAY_STR;
  const [month, setMonth] = useState(INITIAL_MONTH);
  const [selected, setSelected] = useState(todayStr);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [evening, setEvening] = useState(false);

  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  function jump(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    setSelected(isoDate(d));
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  function add() {
    if (!title.trim()) return;
    setTasks([...tasks, { id: timeNow(), title: title.trim(), date: selected, time, evening, done: false }]);
    setTitle("");
  }
  const toggle = (id) => setTasks(tasks.map((k) => (k.id === id ? { ...k, done: !k.done } : k)));
  const remove = (id) => setTasks(tasks.filter((k) => k.id !== id));

  const byTime = (a, b) => a.time.localeCompare(b.time);
  const dayTasks = tasks.filter((k) => k.date === selected).sort(byTime);
  const overdue = tasks.filter((k) => !k.done && k.date < todayStr).sort((a, b) => a.date.localeCompare(b.date));

  const row = (k) => (
    <label key={k.id} className={`task ${k.done ? "done" : ""}`}>
      <input type="checkbox" checked={k.done} onChange={() => toggle(k.id)} />
      <span>{k.title} <small>{k.date !== selected ? `${label(k.date)} • ` : ""}{k.time}</small></span>
      <button type="button" className="mini" onClick={(e) => { e.preventDefault(); remove(k.id); }}>Delete</button>
    </label>
  );

  return (
    <div>
      <div className="card">
        <strong>New reminder</strong>
        <div className="quick">
          <button onClick={() => jump(0)}>Today</button>
          <button onClick={() => jump(1)}>Tomorrow</button>
        </div>
        <div className="note">For: {label(selected)} (or tap a day below)</div>
        <input placeholder="What do you need to do?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <label className="task">
          <input type="checkbox" checked={evening} onChange={(e) => setEvening(e.target.checked)} />
          <span>Also remind me the evening before</span>
        </label>
        <button className="primary" onClick={add}>Add reminder</button>
      </div>

      <div className="card chart">
        <div className="cal-head">
          <button onClick={() => setMonth(new Date(y, m - 1, 1))}>‹</button>
          <strong>{MONTHS[m]} {y}</strong>
          <button onClick={() => setMonth(new Date(y, m + 1, 1))}>›</button>
        </div>
        <div className="cal">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} className="dow">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = isoDate(new Date(y, m, d));
            const cls = [iso === todayStr && "today", iso === selected && "sel", tasks.some((k) => k.date === iso && !k.done) && "has"].filter(Boolean).join(" ");
            return <button key={i} className={cls} onClick={() => setSelected(iso)}>{d}</button>;
          })}
        </div>
      </div>

      <div className="card">
        <strong>{label(selected)}</strong>
        {dayTasks.length === 0 && <div className="note">Nothing planned. Enjoy it.</div>}
        {dayTasks.map(row)}
      </div>

      {overdue.length > 0 && (
        <div className="card">
          <strong>Overdue</strong>
          {overdue.map(row)}
        </div>
      )}

      <button className="wide" onClick={() => downloadTasksICS(tasks)}>Add reminders to phone calendar</button>
    </div>
  );
}