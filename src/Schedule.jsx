import { useState } from "react";
import Empty from "./Empty";
import { ConfirmDelete } from "./Modal";
import { minutesBetween, fmtHM } from "./stats";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Schedule({ subjects, classes, setClasses, go }) {
  const [form, setForm] = useState({ subjectId: "", day: "Monday", start: "08:00", end: "09:00" });
  const [err, setErr] = useState("");
  const [del, setDel] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function add() {
    if (!form.subjectId) return setErr("Choose a subject first.");
    if (minutesBetween(form.start, form.end) <= 0) return setErr("End time must be after the start time.");
    setErr("");
    setClasses([...classes, { id: Date.now(), ...form, subjectId: Number(form.subjectId) }]);
  }

  if (subjects.length === 0)
    return <Empty art="calendar" title="Add a subject first" text="Your schedule is built from your subjects."
      actionLabel="Go to Subjects" onAction={() => go("Subjects")} />;

  const valid = (c) => subjects.some((s) => s.id === c.subjectId);
  const summary = DAYS.map((day) => {
    const items = classes.filter((c) => c.day === day && valid(c));
    if (!items.length) return null;
    const start = items.map((c) => c.start).sort()[0];
    const end = items.map((c) => c.end).sort().slice(-1)[0];
    return { day, start, end, atSchool: minutesBetween(start, end), inClass: items.reduce((a, c) => a + minutesBetween(c.start, c.end), 0) };
  }).filter(Boolean);

  return (
    <div>
      <div className="card">
        <select name="subjectId" value={form.subjectId} onChange={change}>
          <option value="">Choose subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="day" value={form.day} onChange={change}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
        <input type="time" name="start" value={form.start} onChange={change} />
        <input type="time" name="end" value={form.end} onChange={change} />
        {err && <div className="note" style={{ color: "#ff6b76" }}>{err}</div>}
        <button className="primary" onClick={add}>Add class</button>
      </div>

      {summary.length > 0 && (
        <div className="card chart">
          <strong>Time in school per day</strong>
          {summary.map((d) => (
            <div className="day-row" key={d.day}>
              <div><b>{d.day}</b><small>{d.start} – {d.end}</small></div>
              <div style={{ textAlign: "right" }}><b>{fmtHM(d.atSchool)}</b><small>{fmtHM(d.inClass)} in class</small></div>
            </div>
          ))}
        </div>
      )}

      {summary.length === 0 && <Empty art="calendar" title="No classes yet" text="Pick a subject, day and time above." />}

      {DAYS.map((day) => {
        const items = classes.filter((c) => c.day === day && valid(c)).sort((a, b) => a.start.localeCompare(b.start));
        if (!items.length) return null;
        return (
          <div key={day}>
            <h3>{day}</h3>
            {items.map((c) => {
              const s = subjects.find((x) => x.id === c.subjectId);
              return (
                <div className="card" key={c.id}>
                  <strong>{s.name}</strong>
                  <div>{c.start} – {c.end} {s.room && `• Room ${s.room}`}</div>
                  <button onClick={() => setDel({ c, s })}>Delete</button>
                </div>
              );
            })}
          </div>
        );
      })}

      {del && (
        <ConfirmDelete title="Delete this class?" text={`${del.s.name}, ${del.c.day} ${del.c.start}–${del.c.end}`}
          onConfirm={() => { setClasses(classes.filter((x) => x.id !== del.c.id)); setDel(null); }} onCancel={() => setDel(null)} />
      )}
    </div>
  );
}