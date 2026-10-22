import { useState } from "react";
import Empty from "./Empty";
import { ConfirmDelete } from "./Modal";
import { minutesBetween } from "./stats";

const empty = { name: "", instructor: "", room: "", units: "" };

export default function Subjects({ subjects, setSubjects, classes }) {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [del, setDel] = useState(null);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function save() {
    if (!form.name.trim()) return;
    if (editingId) setSubjects(subjects.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    else setSubjects([...subjects, { id: Date.now(), ...form }]);
    setForm(empty); setEditingId(null);
  }
  function edit(s) {
    setForm({ name: s.name, instructor: s.instructor || "", room: s.room || "", units: s.units || "" });
    setEditingId(s.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalUnits = subjects.reduce((a, s) => a + (Number(s.units) || 0), 0);
  const weekMins = classes
    .filter((c) => subjects.some((s) => s.id === c.subjectId))
    .reduce((a, c) => a + minutesBetween(c.start, c.end), 0);
  const hours = (weekMins / 60).toFixed(1).replace(".0", "");
  const teachers = {};
  subjects.forEach((s) => {
    const t = (s.instructor || "").trim() || "No teacher set";
    (teachers[t] = teachers[t] || []).push(s);
  });

  return (
    <div>
      <div className="tiles">
        <div className="tile"><b>{subjects.length}</b><small>Subjects</small></div>
        <div className="tile"><b>{totalUnits}</b><small>Units</small></div>
        <div className="tile"><b>{hours}h</b><small>Class/week</small></div>
      </div>

      <div className="card">
        <input name="name" placeholder="Subject (e.g. Math 101)" value={form.name} onChange={change} />
        <input name="instructor" placeholder="Teacher" value={form.instructor} onChange={change} />
        <input name="room" placeholder="Room" value={form.room} onChange={change} />
        <input name="units" type="number" min="0" step="0.5" inputMode="decimal" placeholder="Units" value={form.units} onChange={change} />
        <button className="primary" onClick={save}>{editingId ? "Update subject" : "Add subject"}</button>
      </div>

      {subjects.length === 0 && (
        <Empty art="list" title="No subjects yet" text="Add your first subject above to build your schedule." />
      )}

      {subjects.length > 0 && (
        <div className="card chart">
          <strong>Teachers and subjects</strong>
          {Object.entries(teachers).map(([t, list]) => (
            <div className="teacher" key={t}>
              <b>{t}</b>
              {list.map((s) => (
                <div className="t-sub" key={s.id}>
                  <span>{s.name}{s.room && ` • Room ${s.room}`}</span>
                  <span>{s.units ? `${s.units} units` : "– units"}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {subjects.map((s) => (
        <div className="card" key={s.id}>
          <strong>{s.name}</strong>
          <div className="note">{s.instructor} {s.room && `• Room ${s.room}`} {s.units && `• ${s.units} units`}</div>
          <button onClick={() => edit(s)}>Edit</button>
          <button onClick={() => setDel(s)}>Delete</button>
        </div>
      ))}

      {del && (
        <ConfirmDelete title={`Delete ${del.name}?`} text="This removes the subject. Its class times will no longer show."
          onConfirm={() => { setSubjects(subjects.filter((x) => x.id !== del.id)); setDel(null); }} onCancel={() => setDel(null)} />
      )}
    </div>
  );
}