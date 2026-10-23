import { useState } from "react";
import { toDate } from "./stats";
import Empty from "./Empty";
import ReasonModal, { reasonHandlers, reasonText } from "./ReasonModal";
import { useI18n } from "./i18n";

const STATUSES = ["Absent", "Late", "Excused"];

export default function Records({ rows, setAttendance, initial, onBack }) {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState(initial || "Absent");
  const [editing, setEditing] = useState(null);
  const h = reasonHandlers(setAttendance);
  const list = rows.filter((r) => r.status === status).sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));
  const rec = editing && rows.find((r) => r.key === editing);
  const dateLabel = (iso) => toDate(iso, "00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div>
      <button className="wide" onClick={onBack}>‹ {t("Back")}</button>
      <div className="seg3">
        {STATUSES.map((s) => (
          <button key={s} className={`${s.toLowerCase()} ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>
            <b>{rows.filter((r) => r.status === s).length}</b><small>{t(s)}</small>
          </button>
        ))}
      </div>

      {list.length === 0 && <Empty art="check" title={t("Nothing here yet")} text={t("Nothing to explain here. Keep it up.")} />}

      {list.map((r) => {
        const mins = r.checkIn ? Math.round((new Date(r.checkIn) - toDate(r.date, r.cls.start)) / 60000) : null;
        const extra = [
          `${r.cls.start}–${r.cls.end}`,
          r.auto && t("auto-marked"),
          r.status === "Late" && mins !== null && t("in {m} min after start", { m: mins }),
        ].filter(Boolean).join(" • ");
        return (
          <div className={`card rec-card ${r.status.toLowerCase()}`} key={r.key}>
            <div className="rc-top"><b>{r.subject.name}</b><small>{dateLabel(r.date)}</small></div>
            <small className="muted">{extra}</small>
            <div className="reason-box">
              {r.note ? <><small>{t("Reason")}</small><div>{reasonText(r, t)}</div></> : <div className="muted">{t("No reason added yet")}</div>}
            </div>
            <button onClick={() => setEditing(r.key)}>{r.note ? t("Edit reason") : t("Add reason")}</button>
          </div>
        );
      })}

      {rec && <ReasonModal rec={rec} onSave={(v) => { h.save(rec, v); setEditing(null); }} onSkip={() => setEditing(null)} />}
    </div>
  );
}
