import { useState } from "react";
import Modal from "./Modal";
import Radio from "./Radio";
import { toDate } from "./stats";
import { useI18n } from "./i18n";

const REASONS = {
  Late: ["Transport or traffic", "Overslept", "Not feeling well", "Family matter", "Other"],
  Absent: ["Not feeling well", "Transport problem", "Family emergency", "Overslept", "Other"],
  Excused: ["Medical", "School activity", "Family emergency", "Other"],
};

// reasons are saved in English and translated when shown
export const reasonText = (r, t) => (r.reason ? [t(r.reason), r.detail].filter(Boolean).join(" — ") : r.note);

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
  const { t, locale } = useI18n();
  const [reason, setReason] = useState(rec.reason || "");
  const [detail, setDetail] = useState(rec.detail || "");
  const [excused, setExcused] = useState(rec.status === "Excused");
  const day = toDate(rec.date, "00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
  const when = `${day} • ${rec.cls.start}–${rec.cls.end}`;
  const name = rec.subject.name;
  const title = rec.status === "Late" ? t("You were late to {name}", { name })
    : rec.status === "Excused" ? t("Reason for missing {name}", { name }) : t("You missed {name}", { name });

  return (
    <Modal tone="info" icon="info" title={title} text={t("{when}. What happened?", { when })}
      confirmLabel={t("Save")} cancelLabel={t("Skip")} confirmDisabled={!reason}
      onConfirm={() => onSave({ reason, detail, excused })} onCancel={onSkip}>
      <div className="radios">
        {REASONS[rec.status].map((r) => (
          <Radio key={r} name="reason" checked={reason === r} label={t(r)} onChange={() => setReason(r)} />
        ))}
      </div>
      <input className="m-input" placeholder={t("Add details (optional)")} value={detail} onChange={(e) => setDetail(e.target.value)} />
      {rec.status === "Absent" && (
        <div className="radios">
          <Radio name="exc" checked={!excused} label={t("Unexcused absence")} onChange={() => setExcused(false)} />
          <Radio name="exc" checked={excused} label={t("Excused (I have permission or proof)")} onChange={() => setExcused(true)} />
        </div>
      )}
    </Modal>
  );
}
