import { useState } from "react";

export default function History({ subjects, classes, attendance }) {
  const [filter, setFilter] = useState("all");

  const records = Object.values(attendance)
    .map((r) => {
      const cls = classes.find((c) => c.id === r.classId);
      const subject = cls && subjects.find((s) => s.id === cls.subjectId);
      return cls && subject ? { ...r, cls, subject } : null;
    })
    .filter(Boolean)
    .filter((r) => r.status !== "Pending")
    .filter((r) => filter === "all" || r.subject.id === Number(filter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const count = (s) => records.filter((r) => r.status === s).length;
  const present = count("Present");
  const late = count("Late");
  const absent = count("Absent");
  const excused = count("Excused");
  const counted = present + late + absent;
  const percent = counted ? Math.round(((present + late) / counted) * 100) : 100;

  return (
    <div>
      <div className="card">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <strong>Attendance: {percent}%</strong>
        <div>Present {present} • Late {late} • Absent {absent} • Excused {excused}</div>
      </div>

      {records.length === 0 && <p>No records yet. Mark attendance on the Dashboard.</p>}

      {records.map((r) => (
        <div className="card" key={`${r.classId}_${r.date}`}>
          <strong>{r.subject.name}</strong>
          <div>{r.date} • {r.cls.start} – {r.cls.end}</div>
          <span className={`pill ${r.status.toLowerCase()} tag`}>{r.status}</span>
          {r.checkIn && (
  <div className="note">
    In {new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    {r.checkOut && ` • Out ${new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
    {r.verified && " • ✓ verified"}
  </div>
)}
          {r.note && <div className="note">Note: {r.note}</div>}
        </div>
      ))}
    </div>
  );
}