import { useState } from "react";
import Modal from "./Modal";
import Radio from "./Radio";
import { toDate } from "./stats";

const REASONS = {
  Late: ["Transport or traffic", "Overslept", "Not feeling well", "Family matter", "Other"],
  Absent: ["Not feeling well", "Transport problem", "Family emergency", "Overslept", "Other"],
  Excused: ["Medical", "School activity", "Family emergency", "Other"],
};

export function reasonHandlers(setAttendance) {
  return {
    save: (rec, { reason, detail, excused }) =>
      setAttendance((prev) => {
        const old = prev[rec.key] || {};
        return {
          ...prev,
          [rec.key]: {
            ...old, reason, detail, skipped: false,
            note: [reason, detail].filter(Boolean).join(" — "),
            status: old.status === "Absent" && excused ? "Excused" : old.status,
          },
        };
      }),
    skip: (rec) => setAttendance((prev) => ({ ...prev, [rec.key]: { ...prev[rec.key], skipped: true } })),
  };
}

export default function ReasonModal({ rec, onSave, onSkip }) {
  const [reason, setReason] = useState(rec.reason || "");
  const [detail, setDetail] = useState(rec.detail || "");
  const [excused, setExcused] = useState(rec.status === "Excused");
  const when = `${toDate(rec.date, "00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} • ${rec.cls.start}–${rec.cls.end}`;
  const title = rec.status === "Late" ? `You were late to ${rec.subject.name}`
    : rec.status === "Excused" ? `Reason for missing ${rec.subject.name}` : `You missed ${rec.subject.name}`;

  return (
    <Modal tone="info" icon="info" title={title} text={`${when}. What happened?`}
      confirmLabel="Save" cancelLabel="Skip" confirmDisabled={!reason}
      onConfirm={() => onSave({ reason, detail, excused })} onCancel={onSkip}>
      <div className="radios">
        {REASONS[rec.status].map((r) => (
          <Radio key={r} name="reason" checked={reason === r} label={r} onChange={() => setReason(r)} />
        ))}
      </div>
      <input className="m-input" placeholder="Add details (optional)" value={detail} onChange={(e) => setDetail(e.target.value)} />
      {rec.status === "Absent" && (
        <div className="radios">
          <Radio name="exc" checked={!excused} label="Unexcused absence" onChange={() => setExcused(false)} />
          <Radio name="exc" checked={excused} label="Excused (I have permission or proof)" onChange={() => setExcused(true)} />
        </div>
      )}
    </Modal>
  );
}
