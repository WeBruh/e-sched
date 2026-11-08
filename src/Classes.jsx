import { useState } from "react";
import Empty from "./Empty";
import PickField from "./PickField";
import TimeField, { Time12 } from "./TimeField";
import { ConfirmDelete } from "./Modal";
import { minutesBetween, fmtHM } from "./stats";
import { useT } from "./i18n";
import "./Classes.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY_SUBJECT = { name: "", instructor: "", room: "", units: "" };
const EMPTY_CLASS = { subjectId: "", day: "Monday", start: "08:00", end: "09:00" };

export default function Classes({ subjects, setSubjects, classes, setClasses }) {
  const t = useT();
  const [tab, setTab] = useState("subject");
  const [subjectForm, setSubjectForm] = useState(EMPTY_SUBJECT);
  const [editingId, setEditingId] = useState(null);
  const [subjectDelete, setSubjectDelete] = useState(null);
  const [classForm, setClassForm] = useState(EMPTY_CLASS);
  const [classError, setClassError] = useState("");
  const [classDelete, setClassDelete] = useState(null);

  const putSubject = (patch) => setSubjectForm((current) => ({ ...current, ...patch }));
  const putClass = (patch) => setClassForm((current) => ({ ...current, ...patch }));

  function saveSubject() {
    const name = subjectForm.name.trim();
    if (!name) return;
    const value = { ...subjectForm, name };
    if (editingId) {
      setSubjects(subjects.map((subject) => (subject.id === editingId ? { ...subject, ...value } : subject)));
    } else {
      setSubjects([...subjects, { id: Date.now(), ...value }]);
    }
    setSubjectForm(EMPTY_SUBJECT);
    setEditingId(null);
  }

  function editSubject(subject) {
    setSubjectForm({
      name: subject.name || "",
      instructor: subject.instructor || "",
      room: subject.room || "",
      units: subject.units || "",
    });
    setEditingId(subject.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addClass() {
    if (!classForm.subjectId) return setClassError(t("Choose a subject first."));
    if (minutesBetween(classForm.start, classForm.end) <= 0) return setClassError(t("End time must be after the start time."));
    setClassError("");
    setClasses([...classes, { id: Date.now(), ...classForm, subjectId: Number(classForm.subjectId) }]);
    setClassForm((current) => ({ ...EMPTY_CLASS, day: current.day }));
  }

  const validClass = (item) => subjects.some((subject) => subject.id === item.subjectId);
  const summary = DAYS.map((day) => {
    const items = classes.filter((item) => item.day === day && validClass(item));
    if (!items.length) return null;
    const start = items.map((item) => item.start).sort()[0];
    const end = items.map((item) => item.end).sort().slice(-1)[0];
    return {
      day,
      start,
      end,
      atSchool: minutesBetween(start, end),
      inClass: items.reduce((total, item) => total + minutesBetween(item.start, item.end), 0),
    };
  }).filter(Boolean);

  const totalUnits = subjects.reduce((total, subject) => total + (Number(subject.units) || 0), 0);
  const weekMins = classes
    .filter((item) => subjects.some((subject) => subject.id === item.subjectId))
    .reduce((total, item) => total + minutesBetween(item.start, item.end), 0);
  const totalHours = (weekMins / 60).toFixed(1).replace(".0", "");

  return (
    <div className="classes-page">
      <div className="tiles">
        <div className="tile"><b>{subjects.length}</b><small>{t("Subjects")}</small></div>
        <div className="tile"><b>{totalUnits}</b><small>{t("Units")}</small></div>
        <div className="tile"><b>{totalHours}h</b><small>{t("Class/week")}</small></div>
      </div>

      <div className="class-tabs">
        <button type="button" className={tab === "subject" ? "on" : ""} onClick={() => setTab("subject")}>{t("By subject")}</button>
        <button type="button" className={tab === "day" ? "on" : ""} onClick={() => setTab("day")}>{t("By day")}</button>
      </div>

      {tab === "subject" ? (
        <>
          <div className="card class-form">
            <input name="name" placeholder={t("Subject (e.g. Math 101)")} value={subjectForm.name} onChange={(e) => putSubject({ name: e.target.value })} />
            <input name="instructor" placeholder={t("Teacher")} value={subjectForm.instructor} onChange={(e) => putSubject({ instructor: e.target.value })} />
            <input name="room" placeholder={t("Room")} value={subjectForm.room} onChange={(e) => putSubject({ room: e.target.value })} />
            <input name="units" type="number" min="0" step="0.5" inputMode="decimal" placeholder={t("Units")} value={subjectForm.units} onChange={(e) => putSubject({ units: e.target.value })} />
            <button type="button" className="primary" onClick={saveSubject}>{editingId ? t("Update subject") : t("Add subject")}</button>
          </div>

          {subjects.length === 0 ? (
            <Empty art="list" title={t("No subjects yet")} text={t("Add your first subject above to build your schedule.")} />
          ) : (
            <div className="list-stack">
              {subjects.map((subject) => (
                <div className="card subject-card" key={subject.id}>
                  <div className="subject-head">
                    <strong>{subject.name}</strong>
                    <div className="subject-actions">
                      <button type="button" onClick={() => editSubject(subject)}>{t("Edit")}</button>
                      <button type="button" onClick={() => setSubjectDelete(subject)}>{t("Delete")}</button>
                    </div>
                  </div>
                  <div className="subject-meta">
                    {(subject.instructor || t("No teacher set")) + (subject.room ? ` • ${t("Room {room}", { room: subject.room })}` : "")}
                    {subject.units ? ` • ${t("{n} units", { n: subject.units })}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card class-form">
            <PickField label={t("Subject")} title={t("Choose subject")} icon="info" placeholder={t("Choose subject")} value={classForm.subjectId}
              options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))} onChange={(value) => putClass({ subjectId: value })} />
            <PickField label={t("Day")} title={t("Choose a day")} icon="calendar" value={classForm.day}
              options={DAYS.map((day) => ({ value: day, label: t(day) }))} onChange={(value) => putClass({ day: value })} />
            <div className="time-row">
              <TimeField label={t("Starts")} value={classForm.start} onChange={(value) => putClass({ start: value })} />
              <TimeField label={t("Ends")} value={classForm.end} onChange={(value) => putClass({ end: value })} />
            </div>
            {classError && <div className="note error-text">{classError}</div>}
            <button type="button" className="primary" onClick={addClass}>{t("Add class")}</button>
          </div>

          {summary.length > 0 && (
            <div className="card chart">
              <strong>{t("Time in school per day")}</strong>
              {summary.map((day) => (
                <div className="day-row" key={day.day}>
                  <div><b>{t(day.day)}</b><small><Time12 t={day.start} /> – <Time12 t={day.end} /></small></div>
                  <div style={{ textAlign: "right" }}><b>{fmtHM(day.atSchool)}</b><small>{t("{time} in class", { time: fmtHM(day.inClass) })}</small></div>
                </div>
              ))}
            </div>
          )}

          {summary.length === 0 && <Empty art="calendar" title={t("No classes yet")} text={t("Pick a subject, day and time above.")} />}

          {DAYS.map((day) => {
            const items = classes.filter((item) => item.day === day && validClass(item)).sort((a, b) => a.start.localeCompare(b.start));
            if (!items.length) return null;
            return (
              <div key={day} className="day-group">
                <h3>{t(day)}</h3>
                {items.map((item) => {
                  const subject = subjects.find((candidate) => candidate.id === item.subjectId);
                  if (!subject) return null;
                  return (
                    <div className="card class-card" key={item.id}>
                      <div className="subject-head">
                        <strong>{subject.name}</strong>
                        <button type="button" onClick={() => setClassDelete({ item, subject })}>{t("Delete")}</button>
                      </div>
                      <div className="subject-meta">
                        <Time12 t={item.start} /> – <Time12 t={item.end} />
                        {subject.room ? ` • ${t("Room {room}", { room: subject.room })}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}

      {subjectDelete && (
        <ConfirmDelete title={t("Delete {name}?", { name: subjectDelete.name })} text={t("This removes the subject. Its class times will no longer show.")}
          onConfirm={() => { setSubjects(subjects.filter((subject) => subject.id !== subjectDelete.id)); setSubjectDelete(null); }} onCancel={() => setSubjectDelete(null)} />
      )}

      {classDelete && (
        <ConfirmDelete title={t("Delete this class?")} text={`${classDelete.subject.name}, ${t(classDelete.item.day)}`}
          onConfirm={() => { setClasses(classes.filter((item) => item.id !== classDelete.item.id)); setClassDelete(null); }} onCancel={() => setClassDelete(null)} />
      )}
    </div>
  );
}
