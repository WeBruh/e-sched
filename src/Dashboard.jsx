const STATUSES = ["Present", "Absent", "Late", "Excused", "Pending"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Dashboard({ subjects, classes, attendance, setAttendance }) {
  const date = todayISO();
  const dayName = DAY_NAMES[new Date().getDay()];

  const todays = classes
    .filter((c) => c.day === dayName && subjects.some((s) => s.id === c.subjectId))
    .sort((a, b) => a.start.localeCompare(b.start));

  function update(classId, changes) {
    const key = `${classId}_${date}`;
    setAttendance({ ...attendance, [key]: { ...attendance[key], classId, date, ...changes } });
  }

  const records = Object.values(attendance);
  const count = (s) => records.filter((r) => r.status === s).length;
  const present = count("Present");
  const late = count("Late");
  const absent = count("Absent");
  const excused = count("Excused");
  const counted = present + late + absent;
  const percent = counted ? Math.round(((present + late) / counted) * 100) : 100;

  return (
    <div>
      <div className="card stats">
        <strong>Attendance: {percent}%</strong>
        <div>Present {present} • Late {late} • Absent {absent} • Excused {excused}</div>
      </div>

      <h3>Today, {dayName}</h3>
      {todays.length === 0 && <p>No classes today.</p>}

      {todays.map((c) => {
        const s = subjects.find((s) => s.id === c.subjectId);
        const rec = attendance[`${c.id}_${date}`] || {};
        const status = rec.status || "Pending";
        return (
          <div className="card" key={c.id}>
            <strong>{s.name}</strong>
            <div>{c.start} – {c.end} {s.room && `• Room ${s.room}`}</div>
            <div className="pills">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  className={`pill ${st.toLowerCase()} ${status === st ? "on" : ""}`}
                  onClick={() => update(c.id, { status: st })}
                >
                  {st}
                </button>
              ))}
            </div>
            <input
              placeholder="Note (e.g. reason for absence)"
              value={rec.note || ""}
              onChange={(e) => update(c.id, { note: e.target.value, status })}
            />
          </div>
        );
      })}
    </div>
  );
}