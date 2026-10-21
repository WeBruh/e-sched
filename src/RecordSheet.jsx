import { toDate } from "./stats";

const hints = { Late: "Why were you late?", Absent: "Why were you absent?", Excused: "Reason" };
const dateLabel = (iso) => toDate(iso, "00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

export default function RecordSheet({ status, rows, setAttendance, onClose }) {
  const list = rows
    .filter((r) => r.status === status)
    .sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));

  function setNote(r, note) {
    const k = `${r.classId}_${r.date}`;
    setAttendance((prev) => ({ ...prev, [k]: { ...prev[k], note } }));
  }

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <strong>{status} ({list.length})</strong>
          <button onClick={onClose}>Close</button>
        </div>
        {list.length === 0 && <p className="note">Nothing here. Keep it up.</p>}
        {list.map((r) => {
          const mins = r.checkIn ? Math.round((new Date(r.checkIn) - toDate(r.date, r.cls.start)) / 60000) : null;
          return (
            <div className="rec" key={`${r.classId}_${r.date}`}>
              <b>{r.subject.name}</b>
              <div className="note">
                {dateLabel(r.date)} • {r.cls.start}–{r.cls.end}
                {r.auto && " • auto-marked"}
                {status === "Late" && mins !== null && ` • in ${mins} min after start`}
              </div>
              <input placeholder={hints[status]} value={r.note || ""} onChange={(e) => setNote(r, e.target.value)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}