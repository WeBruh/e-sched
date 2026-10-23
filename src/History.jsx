import { useState } from "react";
import { buildRows, summarize, toDate } from "./stats";
import Empty from "./Empty";
import PickField from "./PickField";
import { Time12 } from "./TimeField";
import { reasonText } from "./ReasonModal";
import { useI18n } from "./i18n";

export default function History({ subjects, classes, attendance }) {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState("all");
  const rows = buildRows(attendance, classes, subjects)
    .filter((r) => filter === "all" || String(r.subject.id) === String(filter))
    .sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));
  const s = summarize(rows);
  const options = [{ value: "all", label: t("All subjects") }, ...subjects.map((x) => ({ value: x.id, label: x.name }))];
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const dateLabel = (iso) => toDate(iso, "00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div>
      <div className="card chart">
        <PickField label={t("Subject")} title={t("Choose subject")} value={filter} options={options} onChange={setFilter} />
        <div className="hist-sum"><b>{s.percent === null ? "–" : `${s.percent}%`}</b><small>{t("Attendance")}</small></div>
        <div className="note">{t("Present")} {s.present} • {t("Late")} {s.late} • {t("Absent")} {s.absent} • {t("Excused")} {s.excused}</div>
      </div>

      {rows.length === 0 && <Empty art="list" title={t("No records yet")} text={t("Check in to a class and it will show up here.")} />}

      {rows.map((r) => (
        <div className={`card rec-card ${r.status.toLowerCase()}`} key={r.key}>
          <div className="rc-top"><b>{r.subject.name}</b><small>{dateLabel(r.date)}</small></div>
          <small className="muted"><Time12 t={r.cls.start} /> – <Time12 t={r.cls.end} /></small>
          <div><span className={`ag-tag ${r.status.toLowerCase()}`}>{t(r.status)}</span></div>
          {r.checkIn && (
            <div className="note">
              {t("In {time}", { time: fmtTime(r.checkIn) })}{r.checkOut && ` • ${t("Out {time}", { time: fmtTime(r.checkOut) })}`}{r.verified && ` • ${t("verified")}`}{r.leftEarly && ` • ${t("left early")}`}
            </div>
          )}
          {r.note && <div className="note">{t("Reason")}: {reasonText(r, t)}</div>}
        </div>
      ))}
    </div>
  );
}
