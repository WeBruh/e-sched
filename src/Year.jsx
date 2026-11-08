import { useEffect, useRef, useState } from "react";
import "./Year.css";
import Modal from "./Modal";
import PickField from "./PickField";
import SchoolYearFields from "./SchoolYearFields";
import { Time12 } from "./TimeField";
import { reasonText } from "./ReasonModal";
import { isoDate, toDate, weekStart } from "./stats";
import { defaultYear, validYear } from "./schoolYear";
import { useI18n } from "./i18n";
import { Flame, Check, ArrowUp, ArrowDown, Refresh, Sparkle } from "./StreakIcons";
import useNow from "./useNow";

const DAY = 86400000;
const STEP = 24; // 20 px box + 4 px gap
const FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COL = { Present: "#2fbf71", Late: "#ffd23f", Absent: "#e8202f", Excused: "#4cc9f0", None: "#7a7a8c", Upcoming: "#2a2a3a", Off: "#15151f" };
const PICKS = ["Present", "Late", "Absent", "Excused"];
const REASONS = {
  Late: ["Transport or traffic", "Overslept", "Not feeling well", "Family matter", "Other"],
  Absent: ["Not feeling well", "Transport problem", "Family emergency", "Overslept", "Other"],
  Excused: ["Holiday", "Bad weather", "Class suspended", "No class for this subject", "Medical", "School activity", "Family emergency", "Other"],
};

// The whole school year as one map: a box per school day (Mon to Sat), coloured by attendance.
export default function Year({ subjects, classes, attendance, setAttendance, settings, setSettings, streak }) {
  const { t, locale } = useI18n();
  const now = useNow(60000);
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [dlg, setDlg] = useState(null);
  const [setup, setSetup] = useState(() => defaultYear());
  const scroller = useRef(null);

  const ok = !validYear(settings.yearStart, settings.yearEnd);

  // open the map at the current week
  useEffect(() => {
    const el = scroller.current;
    if (!el || !ok) return;
    const first = weekStart(toDate(settings.yearStart, "00:00"));
    const w = Math.max(0, Math.floor((Date.now() - first.getTime()) / (7 * DAY)));
    el.scrollLeft = Math.max(0, w * STEP - el.clientWidth / 2);
  }, [ok, settings.yearStart, settings.yearEnd]);

  if (!ok) {
    const err = validYear(setup.start, setup.end);
    return (
      <div className="card">
        <strong>{t("Set your school year")}</strong>
        <div className="note">{t("Your whole school year in one map. Tell the app when it starts and ends.")}</div>
        <div className="fields"><SchoolYearFields start={setup.start} end={setup.end} onChange={setSetup} /></div>
        {err && <div className="note" style={{ color: "#ff6b76" }}>{t(err)}</div>}
        <button className="primary" disabled={!!err} onClick={() => setSettings({ ...settings, yearStart: setup.start, yearEnd: setup.end })}>{t("Save dates")}</button>
      </div>
    );
  }

  const todayIso = isoDate(now);
  const start = toDate(settings.yearStart, "00:00");
  const end = toDate(settings.yearEnd, "23:59");
  const first = weekStart(start);
  const weeks = Math.min(62, Math.floor((end.getTime() - first.getTime()) / (7 * DAY)) + 1);
  const fmtDate = (d) => d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const label = (st) => ({ None: t("No record"), Upcoming: t("Upcoming") }[st] || t(st));
  const dow = Array.from({ length: 6 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }));

  const byDay = {};
  classes.forEach((c) => {
    const s = subjects.find((x) => x.id === c.subjectId);
    if (s) (byDay[c.day] = byDay[c.day] || []).push({ c, s });
  });
  Object.values(byDay).forEach((l) => l.sort((a, b) => a.c.start.localeCompare(b.c.start)));

  const dayInfo = (iso) => {
    const date = toDate(iso, "00:00");
    return (byDay[FULL[date.getDay()]] || []).map(({ c, s }) => {
      const key = `${c.id}_${iso}`;
      const rec = attendance[key];
      let st = rec && rec.status && rec.status !== "Pending" ? rec.status : null;
      const ended = toDate(iso, c.end) <= now;
      if (!st) st = ended ? "None" : "Upcoming";
      return { c, s, key, rec, st, ended };
    });
  };
  const colorOf = (items) => {
    if (!items.length) return COL.Off;
    const done = items.filter((i) => i.st !== "Upcoming").map((i) => i.st);
    if (!done.length) return COL.Upcoming;
    for (const s of ["Absent", "None", "Late"]) if (done.includes(s)) return COL[s];
    if (done.every((s) => s === "Excused")) return COL.Excused;
    return COL.Present;
  };

  const count = { Present: 0, Late: 0, Absent: 0, Excused: 0, None: 0 };
  const cells = [];
  const months = [];
  let prevMonth = -1;
  const pick = (iso) => { setSel(iso); setEditing(false); };
  for (let w = 0; w < weeks; w++) {
    const mon = new Date(first);
    mon.setDate(first.getDate() + w * 7);
    if (mon.getMonth() !== prevMonth) {
      prevMonth = mon.getMonth();
      months.push(<span key={w} style={{ left: w * STEP }}>{mon.toLocaleDateString(locale, { month: "short" })}</span>);
    }
    for (let r = 0; r < 6; r++) {
      const date = new Date(mon);
      date.setDate(mon.getDate() + r);
      if (date < start || date > end) continue;
      const iso = isoDate(date);
      const items = dayInfo(iso);
      items.forEach((i) => { if (count[i.st] !== undefined) count[i.st]++; });
      const aria = `${date.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}`;
      cells.push(
        <div key={iso} role="button" tabIndex={0} aria-label={aria}
          className={`yr-cell ${iso === todayIso ? "today" : ""} ${iso === sel ? "sel" : ""}`}
          style={{ gridRow: r + 1, gridColumn: w + 1, background: colorOf(items) }}
          onClick={() => pick(iso)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(iso); } }} />
      );
    }
  }
  const counted = count.Present + count.Late + count.Absent;
  const percent = counted ? Math.round(((count.Present + count.Late) / counted) * 100) : null;

  const items = sel ? dayInfo(sel) : [];
  const canEdit = items.some((i) => i.ended);
  const dlgErr = dlg ? validYear(dlg.start, dlg.end) : "";

  function startEdit() {
    setDraft(items.filter((i) => i.ended).map((i) => ({
      key: i.key, cid: i.c.id, st: i.st, reason: (i.rec && i.rec.reason) || "", detail: (i.rec && i.rec.detail) || "",
    })));
    setEditing(true);
  }
  const setPickSt = (key, st) => setDraft((d) => d.map((x) => (x.key === key ? { ...x, st, reason: (REASONS[st] || []).includes(x.reason) ? x.reason : "" } : x)));
  const setField = (key, patch) => setDraft((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  function save() {
    const iso = sel;
    setAttendance((prev) => {
      const next = { ...prev };
      draft.forEach((d) => {
        if (d.st === "None") return; // nothing chosen
        const old = prev[d.key];
        const oldSt = old && old.status && old.status !== "Pending" ? old.status : "None";
        const changedSt = d.st !== oldSt;
        const reasoned = d.st !== "Present";
        const detail = d.detail.trim();
        const sameReason = (old && old.reason ? old.reason : "") === d.reason && (old && old.detail ? old.detail : "") === detail;
        if (!changedSt && (!reasoned || sameReason)) return;
        const noPlace = d.st === "Absent" || d.st === "Excused";
        next[d.key] = {
          ...(old || {}),
          classId: d.cid, date: iso, status: d.st,
          verified: changedSt ? false : !!(old && old.verified),
          edited: !!(old && old.edited) || changedSt,
          auto: false,
          reason: reasoned ? d.reason : "",
          detail: reasoned ? detail : "",
          note: reasoned ? [d.reason, detail].filter(Boolean).join(" — ") : "",
          skipped: reasoned && !d.reason,
          ...(noPlace ? { checkIn: null, checkOut: null, leftEarly: false } : {}),
        };
      });
      return next;
    });
    setEditing(false);
  }

  const trend = streak.trend;
  const shortDate = (iso) => toDate(iso, "00:00").toLocaleDateString(locale, { month: "short", day: "numeric" });
  const lines = [];
  if (!streak.last30.total) lines.push(t("Clock in to a few classes and your analysis will show up here."));
  else {
    lines.push(t("You clocked in on time for {n} out of {total} classes in the last 30 days.", { n: streak.last30.onTime, total: streak.last30.total }));
    if (trend !== null && trend > 0) lines.push(t("Your attendance went up {p}% compared with last month.", { p: trend }));
    else if (trend !== null && trend < 0) lines.push(t("Your attendance went down {p}% compared with last month. A small push gets it back up.", { p: -trend }));
    lines.push(streak.current >= 3 ? t("You are on a {n} day streak. Keep it going.", { n: streak.current }) : t("Clock in on time tomorrow to start a new streak."));
  }
  const bold = (text) => text.split(/(\d+%?)/).map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));

  return (
    <div className="yr">
      <div className="yr-headrow">
        <div>
          <div className="yr-h">{t("School year")}</div>
          <div className="yr-mut">{fmtDate(start)} – {fmtDate(end)}</div>
        </div>
        <button onClick={() => setDlg({ start: settings.yearStart, end: settings.yearEnd })}>{t("Edit dates")}</button>
      </div>

      <div className="yr-two">
        <div className="yr-card">
          <div className="yr-stat"><Check width="20" height="20" style={{ color: COL.Present }} /><b>{count.Present}</b><span className="yr-mut">/{counted}</span></div>
          <div className="yr-mut">{t("Classes on time")}</div>
        </div>
        <div className="yr-card">
          <div className={`yr-stat ${trend === null ? "" : trend >= 0 ? "up" : "down"}`}>
            {trend !== null && (trend >= 0 ? <ArrowUp width="20" height="20" /> : <ArrowDown width="20" height="20" />)}
            <b>{trend === null ? "–" : `${trend > 0 ? "+" : ""}${trend}`}</b>{trend !== null && <span>%</span>}
          </div>
          <div className="yr-mut">{t("vs last month")}</div>
        </div>
      </div>

      <div className="yr-card">
        <div className="yr-ct">{t("Consistency")}</div>
        <div className="yr-pctrow"><Refresh width="20" height="20" /><b className="yr-big">{percent === null ? "–" : percent}</b><span className="yr-mut">%</span></div>
        <div className="yr-wrap">
          <div className="yr-days">{dow.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="yr-scroll" ref={scroller}>
            <div className="yr-months" style={{ width: weeks * STEP }}>{months}</div>
            <div className="yr-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 20px)` }}>{cells}</div>
          </div>
        </div>
        <div className="yr-hint">{t("Slide sideways to see the whole year")}</div>
        <div className="yr-legend">
          {[["Present", t("Present")], ["Late", t("Late")], ["Absent", t("Absent")], ["Excused", t("Excused")], ["None", t("No record")], ["Upcoming", t("Upcoming")], ["Off", t("No class")]].map(([k, name]) => (
            <span key={k}><i style={{ background: COL[k] }} />{name}</span>
          ))}
        </div>
      </div>

      <div className="yr-two">
        <div className="yr-card">
          <div className="yr-ct">{t("Current Streak")}</div>
          <div className="yr-stat"><Flame width="22" height="25" /><b className="yr-big">{streak.current}</b><span className="yr-mut">{t("days")}</span></div>
          <div className="yr-dots">{streak.week.map((s, i) => <span key={i} className={`yr-dot ${s === "hit" ? "on" : ""}`}>{s === "hit" && <Check width="11" height="11" />}</span>)}</div>
        </div>
        <div className="yr-card">
          <div className="yr-ct">{t("Longest Streak")}</div>
          <div className="yr-stat"><Flame width="22" height="25" /><b className="yr-big">{streak.longest}</b><span className="yr-mut">{t("days")}</span></div>
          {streak.longestRange && <div className="yr-mut" style={{ marginTop: 12 }}>{shortDate(streak.longestRange.start)} – {shortDate(streak.longestRange.end)}</div>}
        </div>
      </div>

      <div className="yr-card yr-an">
        <div className="yr-ct"><Sparkle width="18" height="18" />{t("Your analysis")}</div>
        {lines.map((l, i) => <p key={i}>{bold(l)}</p>)}
      </div>

      <div className="card">
        {!sel && <div className="note">{t("Tap a box to see that day.")}</div>}
        {sel && (
          <>
            <div className="yr-top">
              <strong>{toDate(sel, "00:00").toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" })}</strong>
              {canEdit && !editing && <button onClick={startEdit}>{t("Edit day")}</button>}
              {editing && (
                <span className="yr-edit">
                  <button className="primary" onClick={save}>{t("Save")}</button>
                  <button onClick={() => setEditing(false)}>{t("Cancel")}</button>
                </span>
              )}
            </div>
            {items.length === 0 && <div className="note">{t("No classes on this day.")}</div>}
            {items.map((i) => {
              const d = editing ? draft.find((x) => x.key === i.key) : null;
              const info = [];
              if (i.rec && i.rec.checkIn) info.push(t("In {time}", { time: fmtTime(i.rec.checkIn) }));
              if (i.rec && i.rec.checkOut) info.push(t("Out {time}", { time: fmtTime(i.rec.checkOut) }));
              if (i.rec && i.rec.verified) info.push(t("verified"));
              if (i.rec && i.rec.leftEarly) info.push(t("left early"));
              if (i.rec && i.rec.edited) info.push(t("Set by you (edited)"));
              return (
                <div className="yr-item" key={i.key}>
                  <div className="yr-row">
                    <div>
                      <b>{i.s.name}</b>
                      <small><Time12 t={i.c.start} /> – <Time12 t={i.c.end} />{i.s.room && ` • ${t("Room {room}", { room: i.s.room })}`}</small>
                    </div>
                    {!d && <span className={`yr-chip ${i.st}`} style={{ background: COL[i.st] }}>{label(i.st)}</span>}
                  </div>

                  {!d && info.length > 0 && <div className="note">{info.join(" • ")}</div>}
                  {!d && ["Late", "Absent", "Excused"].includes(i.st) && (
                    <div className="note">{t("Reason")}: {i.rec && i.rec.note ? reasonText(i.rec, t) : t("Reason not set")}</div>
                  )}
                  {!d && i.st === "None" && <div className="note">{t("No check-in was saved for this class. Edit the day to fix it.")}</div>}
                  {editing && !d && <div className="note">{t("Not finished yet. You can edit it after the class ends.")}</div>}

                  {d && (
                    <>
                      <div className="yr-opts">
                        {PICKS.map((s) => (
                          <span key={s} role="button" tabIndex={0} className={`yr-opt ${s} ${d.st === s ? "on" : ""}`} style={{ "--c": COL[s] }}
                            onClick={() => setPickSt(i.key, s)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPickSt(i.key, s); } }}>{t(s)}</span>
                        ))}
                      </div>
                      {REASONS[d.st] && (
                        <>
                          <PickField label={t("Reason")} title={t("Choose a reason")} icon="info" placeholder={t("Choose a reason")} value={d.reason}
                            options={REASONS[d.st].map((r) => ({ value: r, label: t(r) }))} onChange={(v) => setField(i.key, { reason: v })} />
                          <input placeholder={t("Add details (optional)")} value={d.detail} onChange={(e) => setField(i.key, { detail: e.target.value })} />
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {dlg && (
        <Modal tone="info" icon="calendar" title={t("School year")} confirmLabel={t("Save dates")} confirmDisabled={!!dlgErr}
          onConfirm={() => { setSettings({ ...settings, yearStart: dlg.start, yearEnd: dlg.end }); setDlg(null); setSel(null); }}
          onCancel={() => setDlg(null)}>
          <div className="fields"><SchoolYearFields start={dlg.start} end={dlg.end} onChange={setDlg} /></div>
          {dlgErr && <div className="note" style={{ color: "#ff6b76" }}>{t(dlgErr)}</div>}
        </Modal>
      )}
    </div>
  );
}
