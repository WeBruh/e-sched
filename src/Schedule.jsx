import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeNow = () => Date.now();

export default function Schedule({ subjects, classes, setClasses }) {
  const [form, setForm] = useState({ subjectId: "", day: "Monday", start: "08:00", end: "09:00" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd() {
    if (!form.subjectId) return;
    setClasses([...classes, { id: timeNow(), ...form, subjectId: Number(form.subjectId) }]);
  }

  function handleDelete(id) {
    setClasses(classes.filter((c) => c.id !== id));
  }

  if (subjects.length === 0) {
    return <p>Add a subject first (Subjects tab).</p>;
  }

  return (
    <div>
      <div className="card">
        <select name="subjectId" value={form.subjectId} onChange={handleChange}>
          <option value="">Choose subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select name="day" value={form.day} onChange={handleChange}>
          {DAYS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input type="time" name="start" value={form.start} onChange={handleChange} />
        <input type="time" name="end" value={form.end} onChange={handleChange} />
        <button className="primary" onClick={handleAdd}>Add class</button>
      </div>

      {DAYS.map((day) => {
        const items = classes
          .filter((c) => c.day === day && subjects.some((s) => s.id === c.subjectId))
          .sort((a, b) => a.start.localeCompare(b.start));
        if (items.length === 0) return null;
        return (
          <div key={day}>
            <h3>{day}</h3>
            {items.map((c) => {
              const s = subjects.find((s) => s.id === c.subjectId);
              return (
                <div className="card" key={c.id}>
                  <strong>{s.name}</strong>
                  <div>{c.start} – {c.end} {s.room && `• Room ${s.room}`}</div>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}