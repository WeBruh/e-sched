import { useState } from "react";
import { toDate } from "./stats";
import Empty from "./Empty";
import ReasonModal from "./ReasonModal";
import reasonHandlers from "./reasonHandlers";

const STATUSES = ["Absent", "Late", "Excused"];
const dateLabel = (iso) => toDate(iso, "00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

export default function Records({ rows, setAttendance, initial, onBack }) {
  const [status, setStatus] = useState(initial || "Absent");
  const [editing, setEditing] = useState(null);
  const h = reasonHandlers(setAttendance);
  const list = rows.filter((r) => r.status === status).sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));
  const rec = editing && rows.find((r) => r.key === editing);

  return (
    <div>
      <button className="wide" onClick={onBack}>‹ Back</button>
      <div className="seg3">
        {STATUSES.map((s) => (
          <button key={s} className={`${s.toLowerCase()} ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>
            <b>{rows.filter((r) => r.status === s).length}</b><small>{s}</small>
          </button>
        ))}
      </div>

      {list.length === 0 && <Empty art="check" title={`No ${status.toLowerCase()} records`} text="Nothing to explain here. Keep it up." />}

      {list.map((r) => {
        const mins = r.checkIn ? Math.round((new Date(r.checkIn) - toDate(r.date, r.cls.start)) / 60000) : null;
        return (
          <div className={`card rec-card ${r.status.toLowerCase()}`} key={r.key}>
            <div className="rc-top"><b>{r.subject.name}</b><small>{dateLabel(r.date)}</small></div>
            <small className="muted">
              {r.cls.start}–{r.cls.end}{r.auto && " • auto-marked"}{r.status === "Late" && mins !== null && ` • in ${mins} min after start`}
            </small>
            <div className="reason-box">
              {r.note ? <><small>Reason</small><div>{r.note}</div></> : <div className="muted">No reason added yet</div>}
            </div>
            <button onClick={() => setEditing(r.key)}>{r.note ? "Edit reason" : "Add reason"}</button>
          </div>
        );
      })}

      {rec && <ReasonModal rec={rec} onSave={(v) => { h.save(rec, v); setEditing(null); }} onSkip={() => setEditing(null)} />}
    </div>
  );
}