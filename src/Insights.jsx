import { useEffect, useRef } from "react";
import { Line, Donut, Bars, Gauge } from "./Charts";
import Empty from "./Empty";
import { summarize, toDate, weekStart } from "./stats";
import { useI18n } from "./i18n";

export default function Insights({ rows, subjects, onBack }) {
  const { t, locale } = useI18n();
  const ref = useRef(null);
  const now = new Date();

  useEffect(() => {
    const cards = [...ref.current.querySelectorAll(".chart")];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle("play", e.isIntersecting && document.visibilityState === "visible")),
      { threshold: 0.3 }
    );
    cards.forEach((c) => io.observe(c));
    const vis = () => cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      c.classList.toggle("play", document.visibilityState === "visible" && r.bottom > 0 && r.top < innerHeight);
    });
    document.addEventListener("visibilitychange", vis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);

  const all = summarize(rows);
  const weeks = [7, 6, 5, 4, 3, 2, 1, 0].map((k) => {
    const start = weekStart(new Date(now.getTime() - k * 7 * 86400000));
    const end = new Date(start.getTime() + 7 * 86400000);
    const inWeek = rows.filter((r) => { const d = toDate(r.date, "00:00"); return d >= start && d < end; });
    return { label: start.toLocaleDateString(locale, { month: "numeric", day: "numeric" }), value: summarize(inWeek).percent };
  });
  const per = subjects.map((s) => ({ id: s.id, label: s.name, ...summarize(rows.filter((r) => r.subject.id === s.id)) }));
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const byDay = days.map((d, i) => ({
    label: new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }),
    value: summarize(rows.filter((r) => r.cls.day === d)).percent,
  }));

  return (
    <div ref={ref}>
      <button className="wide" onClick={onBack}>‹ {t("Back")}</button>
      {rows.length === 0 && <Empty art="list" title={t("No attendance yet")} text={t("Check in to a class and your charts will appear here.")} />}
      <div className="card chart"><div className="chart-title">{t("Weekly attendance %")}</div><Line data={weeks} /></div>
      <div className="card chart">
        <div className="chart-title">{t("Status breakdown")}</div>
        <Donut center={all.percent === null ? "–" : `${all.percent}%`} slices={[
          { label: t("Present"), value: all.present, color: "#19d3c5" },
          { label: t("Late"), value: all.late, color: "#ffd23f" },
          { label: t("Absent"), value: all.absent, color: "#e8202f" },
          { label: t("Excused"), value: all.excused, color: "#ff2e93" },
        ]} />
      </div>
      <div className="card chart"><div className="chart-title">{t("Absences by subject")}</div><Bars data={per.map((p) => ({ label: p.label, value: p.absent }))} /></div>
      <div className="card chart">
        <div className="chart-title">{t("Attendance per subject")}</div>
        <div className="gauges">{per.map((p) => <div key={p.id} className="g"><Gauge value={p.percent} /><div>{p.label}</div></div>)}</div>
      </div>
      <div className="card chart">
        <div className="chart-title">{t("By weekday")}</div>
        <div className="weekdays">{byDay.map((d) => <div key={d.label}><small>{d.label}</small><b>{d.value === null ? "–" : `${d.value}%`}</b></div>)}</div>
      </div>
    </div>
  );
}
