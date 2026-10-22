import { useState } from "react";
import Empty from "./Empty";
import PickField from "./PickField";
import TimeField, { Time12 } from "./TimeField";
import { ConfirmDelete } from "./Modal";
import { minutesBetween, fmtHM } from "./stats";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_OPTIONS = DAYS.map((d) => ({ value: d, label: d }));

export default function Schedule({ subjects, classes, setClasses, go }) {
  const [form, setForm] = useState({ subjectId: "", day: "Monday", start: "08:00", end: "09:00" });
  const [err, setErr] = useState("");
  const [del, setDel] = useState(null);
  const put = (patch) => setForm({ ...form, ...patch });

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
        <PickField label="Subject" title="Choose subject" icon="info" placeholder="Choose subject" value={form.subjectId}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))} onChange={(v) => put({ subjectId: v })} />
        <PickField label="Day" title="Choose a day" icon="calendar" value={form.day} options={DAY_OPTIONS} onChange={(v) => put({ day: v })} />
        <div className="time-row">
          <TimeField label="Starts" value={form.start} onChange={(v) => put({ start: v })} />
          <TimeField label="Ends" value={form.end} onChange={(v) => put({ end: v })} />
        </div>
        {err && <div className="note" style={{ color: "#ff6b76" }}>{err}</div>}
        <button className="primary" onClick={add}>Add class</button>
      </div>

      {summary.length > 0 && (
        <div className="card chart">
          <strong>Time in school per day</strong>
          {summary.map((d) => (
            <div className="day-row" key={d.day}>
              <div><b>{d.day}</b><small><Time12 t={d.start} /> – <Time12 t={d.end} /></small></div>
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
                  <div><Time12 t={c.start} /> – <Time12 t={c.end} /> {s.room && `• Room ${s.room}`}</div>
                  <button onClick={() => setDel({ c, s })}>Delete</button>
                </div>
              );
            })}
          </div>
        );
      })}

      {del && (
        <ConfirmDelete title="Delete this class?" text={`${del.s.name}, ${del.c.day}`}
          onConfirm={() => { setClasses(classes.filter((x) => x.id !== del.c.id)); setDel(null); }} onCancel={() => setDel(null)} />
      )}
    </div>
  );
}
