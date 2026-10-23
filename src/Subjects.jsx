import { useState } from "react";
import Empty from "./Empty";
import { ConfirmDelete } from "./Modal";
import { minutesBetween } from "./stats";
import { useT } from "./i18n";

const empty = { name: "", instructor: "", room: "", units: "" };

export default function Subjects({ subjects, setSubjects, classes }) {
  const t = useT();
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
    const k = (s.instructor || "").trim() || t("No teacher set");
    (teachers[k] = teachers[k] || []).push(s);
  });
  const room = (s) => (s.room ? ` • ${t("Room {room}", { room: s.room })}` : "");

  return (
    <div>
      <div className="tiles">
        <div className="tile"><b>{subjects.length}</b><small>{t("Subjects")}</small></div>
        <div className="tile"><b>{totalUnits}</b><small>{t("Units")}</small></div>
        <div className="tile"><b>{hours}h</b><small>{t("Class/week")}</small></div>
      </div>

      <div className="card">
        <input name="name" placeholder={t("Subject (e.g. Math 101)")} value={form.name} onChange={change} />
        <input name="instructor" placeholder={t("Teacher")} value={form.instructor} onChange={change} />
        <input name="room" placeholder={t("Room")} value={form.room} onChange={change} />
        <input name="units" type="number" min="0" step="0.5" inputMode="decimal" placeholder={t("Units")} value={form.units} onChange={change} />
        <button className="primary" onClick={save}>{editingId ? t("Update subject") : t("Add subject")}</button>
      </div>

      {subjects.length === 0 && (
        <Empty art="list" title={t("No subjects yet")} text={t("Add your first subject above to build your schedule.")} />
      )}

      {subjects.length > 0 && (
        <div className="card chart">
          <strong>{t("Teachers and subjects")}</strong>
          {Object.entries(teachers).map(([name, list]) => (
            <div className="teacher" key={name}>
              <b>{name}</b>
              {list.map((s) => (
                <div className="t-sub" key={s.id}>
                  <span>{s.name}{room(s)}</span>
                  <span>{s.units ? t("{n} units", { n: s.units }) : t("– units")}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {subjects.map((s) => (
        <div className="card" key={s.id}>
          <strong>{s.name}</strong>
          <div className="note">{s.instructor}{room(s)}{s.units && ` • ${t("{n} units", { n: s.units })}`}</div>
          <button onClick={() => edit(s)}>{t("Edit")}</button>
          <button onClick={() => setDel(s)}>{t("Delete")}</button>
        </div>
      ))}

      {del && (
        <ConfirmDelete title={t("Delete {name}?", { name: del.name })} text={t("This removes the subject. Its class times will no longer show.")}
          onConfirm={() => { setSubjects(subjects.filter((x) => x.id !== del.id)); setDel(null); }} onCancel={() => setDel(null)} />
      )}
    </div>
  );
}
