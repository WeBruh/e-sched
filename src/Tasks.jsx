import { useState } from "react";
import { isoDate, toDate } from "./stats";
import { downloadTasksICS } from "./calendar";
import Modal, { ConfirmDelete } from "./Modal";
import Empty from "./Empty";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const label = (iso) => toDate(iso, "00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

export default function Tasks({ tasks, setTasks }) {
  const todayStr = isoDate(new Date());
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(todayStr);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [evening, setEvening] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(null);
  const [del, setDel] = useState(null);

  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  function pick(d) { setSelected(isoDate(d)); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setErr(""); }
  function jump(n) { const d = new Date(); d.setDate(d.getDate() + n); pick(d); }
  function soon() { const d = new Date(Date.now() + 2 * 60000); pick(d); setTime(d.toTimeString().slice(0, 5)); }

  function add() {
    if (!title.trim()) return setErr("Type what you need to do.");
    if (toDate(selected, time) <= new Date()) return setErr("That time has already passed. Pick a later time.");
    const k = { id: Date.now(), title: title.trim(), date: selected, time, evening, done: false };
    setTasks([...tasks, k]); setTitle(""); setErr(""); setSaved(k);
  }
  const toggle = (id) => setTasks(tasks.map((k) => (k.id === id ? { ...k, done: !k.done } : k)));

  const dayTasks = tasks.filter((k) => k.date === selected).sort((a, b) => a.time.localeCompare(b.time));
  const overdue = tasks.filter((k) => !k.done && k.date < todayStr).sort((a, b) => a.date.localeCompare(b.date));

  const row = (k) => (
    <label key={k.id} className={`task ${k.done ? "done" : ""}`}>
      <input type="checkbox" checked={k.done} onChange={() => toggle(k.id)} />
      <span>{k.title} <small>{k.date !== selected ? `${label(k.date)} • ` : ""}{k.time}</small></span>
      <button type="button" className="mini" onClick={(e) => { e.preventDefault(); setDel(k); }}>Delete</button>
    </label>
  );

  return (
    <div>
      <div className="card">
        <strong>New reminder</strong>
        <div className="quick">
          <button onClick={() => jump(0)}>Today</button>
          <button onClick={() => jump(1)}>Tomorrow</button>
          <button onClick={soon}>In 2 min</button>
        </div>
        <div className="note">For: {label(selected)} (or tap a day below)</div>
        <input placeholder="What do you need to do?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <label className="task">
          <input type="checkbox" checked={evening} onChange={(e) => setEvening(e.target.checked)} />
          <span>Also remind me the evening before</span>
        </label>
        {err && <div className="note" style={{ color: "#ff6b76" }}>{err}</div>}
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
        {dayTasks.length === 0 ? <Empty compact art="list" title="Nothing planned" text="Add a reminder above for this day." /> : dayTasks.map(row)}
      </div>

      {overdue.length > 0 && <div className="card"><strong>Overdue</strong>{overdue.map(row)}</div>}

      <button className="wide" onClick={() => downloadTasksICS(tasks)}>Add all reminders to phone calendar</button>

      {saved && (
        <Modal tone="success" icon="check" title="Reminder saved"
          text={`${label(saved.date)} at ${saved.time}. You'll get an alert while the app is open. For an alarm that rings even when it's closed, add it to your phone calendar.`}
          cancelLabel="Done" confirmLabel="Add phone alarm"
          onConfirm={() => { downloadTasksICS([saved]); setSaved(null); }} onCancel={() => setSaved(null)} />
      )}
      {del && (
        <ConfirmDelete title="Delete this reminder?" text={del.title}
          onConfirm={() => { setTasks(tasks.filter((k) => k.id !== del.id)); setDel(null); }} onCancel={() => setDel(null)} />
      )}
    </div>
  );
}