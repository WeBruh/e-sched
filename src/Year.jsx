import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import PickField from "./PickField";
import SchoolYearFields from "./SchoolYearFields";
import { Time12 } from "./TimeField";
import { reasonText } from "./ReasonModal";
import { isoDate, toDate, weekStart } from "./stats";
import { defaultYear, validYear } from "./schoolYear";
import { useI18n } from "./i18n";
import useNow from "./useNow";

const DAY = 86400000;
const STEP = 24;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_COLORS = {
  Present: "#2fbf71",
  Late: "#ffd23f",
  Absent: "#e8202f",
  Excused: "#4cc9f0",
  None: "#7a7a8c",
  Upcoming: "#2a2a3a",
  Off: "#15151f",
};
const PICKS = ["Present", "Late", "Absent", "Excused"];
const REASONS = {
  Late: ["Transport or traffic", "Overslept", "Not feeling well", "Family matter", "Other"],
  Absent: ["Not feeling well", "Transport problem", "Family emergency", "Overslept", "Other"],
  Excused: ["Medical", "School activity", "Family emergency", "Other"],
};

export default function Year({ subjects, classes, attendance, setAttendance, settings, setSettings }) {
  const { t, locale } = useI18n();
  const now = new Date(useNow());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [dateDialog, setDateDialog] = useState(null);
  const [setup, setSetup] = useState(() => defaultYear());
  const scroller = useRef(null);
  const isConfigured = !validYear(settings.yearStart, settings.yearEnd);

  useEffect(() => {
    const element = scroller.current;
    if (!element || !isConfigured) return;
    const firstWeek = weekStart(toDate(settings.yearStart, "00:00"));
    const currentWeek = Math.max(0, Math.floor((Date.now() - firstWeek.getTime()) / (7 * DAY)));
    element.scrollLeft = Math.max(0, currentWeek * STEP - element.clientWidth / 2);
  }, [isConfigured, settings.yearStart, settings.yearEnd]);

  if (!isConfigured) {
    const error = validYear(setup.start, setup.end);
    return (
      <div className="card">
        <strong>{t("Set your school year")}</strong>
        <div className="note">{t("Your whole school year in one map. Tell the app when it starts and ends.")}</div>
        <div className="fields"><SchoolYearFields start={setup.start} end={setup.end} onChange={setSetup} /></div>
        {error && <div className="note" style={{ color: "#ff6b76" }}>{t(error)}</div>}
        <button className="primary" disabled={!!error}
          onClick={() => setSettings({ ...settings, yearStart: setup.start, yearEnd: setup.end })}>
          {t("Save dates")}
        </button>
      </div>
    );
  }

  const today = isoDate(now);
  const start = toDate(settings.yearStart, "00:00");
  const end = toDate(settings.yearEnd, "23:59");
  const firstWeek = weekStart(start);
  const weeks = Math.min(62, Math.floor((end.getTime() - firstWeek.getTime()) / (7 * DAY)) + 1);
  const formatDate = (date) => date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const statusLabel = (status) => ({ None: t("No record"), Upcoming: t("Upcoming") }[status] || t(status));
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Date(2024, 0, index + 1).toLocaleDateString(locale, { weekday: "short" })
  );

  const classesByDay = {};
  classes.forEach((classItem) => {
    const subject = subjects.find((item) => item.id === classItem.subjectId);
    if (subject) (classesByDay[classItem.day] = classesByDay[classItem.day] || []).push({ classItem, subject });
  });
  Object.values(classesByDay).forEach((list) => list.sort((a, b) => a.classItem.start.localeCompare(b.classItem.start)));

  const getDayClasses = (dateString) => {
    const date = toDate(dateString, "00:00");
    return (classesByDay[WEEKDAYS[date.getDay()]] || []).map(({ classItem, subject }) => {
      const key = `${classItem.id}_${dateString}`;
      const record = attendance[key];
      let status = record?.status && record.status !== "Pending" ? record.status : null;
      const ended = toDate(dateString, classItem.end) <= now;
      if (!status) status = ended ? "None" : "Upcoming";
      return { classItem, subject, key, record, status, ended };
    });
  };

  const dayColor = (items) => {
    if (items.length === 0) return STATUS_COLORS.Off;
    const finished = items.filter((item) => item.status !== "Upcoming").map((item) => item.status);
    if (finished.length === 0) return STATUS_COLORS.Upcoming;
    for (const status of ["Absent", "None", "Late"]) {
      if (finished.includes(status)) return STATUS_COLORS[status];
    }
    if (finished.every((status) => status === "Excused")) return STATUS_COLORS.Excused;
    return STATUS_COLORS.Present;
  };

  const count = { Present: 0, Late: 0, Absent: 0, Excused: 0, None: 0 };
  const cells = [];
  const months = [];
  let previousMonth = -1;
  for (let week = 0; week < weeks; week++) {
    const monday = new Date(firstWeek);
    monday.setDate(firstWeek.getDate() + week * 7);
    if (monday.getMonth() !== previousMonth) {
      previousMonth = monday.getMonth();
      months.push(
        <span key={week} style={{ left: week * STEP }}>
          {monday.toLocaleDateString(locale, { month: "short" })}
        </span>
      );
    }
    for (let row = 0; row < 7; row++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + row);
      if (date < start || date > end) continue;
      const dateString = isoDate(date);
      const items = getDayClasses(dateString);
      items.forEach((item) => { if (count[item.status] !== undefined) count[item.status]++; });
      const ariaLabel = date.toLocaleDateString(locale, {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      cells.push(
        <button
          type="button"
          key={dateString}
          aria-label={ariaLabel}
          aria-pressed={dateString === selectedDate}
          className={`yr-cell ${dateString === today ? "today" : ""} ${dateString === selectedDate ? "sel" : ""}`}
          style={{ gridRow: row + 1, gridColumn: week + 1, background: dayColor(items) }}
          onClick={() => { setSelectedDate(dateString); setEditing(false); }}
        />
      );
    }
  }

  const counted = count.Present + count.Late + count.Absent;
  const attendancePercent = counted ? Math.round(((count.Present + count.Late) / counted) * 100) : null;
  const selectedItems = selectedDate ? getDayClasses(selectedDate) : [];
  const canEdit = selectedItems.some((item) => item.ended);
  const dateError = dateDialog ? validYear(dateDialog.start, dateDialog.end) : "";

  function startEditing() {
    setDraft(selectedItems.filter((item) => item.ended).map((item) => ({
      key: item.key,
      classId: item.classItem.id,
      status: item.status,
      reason: item.record?.reason || "",
      detail: item.record?.detail || "",
    })));
    setEditing(true);
  }

  const updateStatus = (key, status) => setDraft((items) => items.map((item) => (
    item.key === key
      ? { ...item, status, reason: (REASONS[status] || []).includes(item.reason) ? item.reason : "" }
      : item
  )));
  const updateDraft = (key, changes) => setDraft((items) => items.map((item) => (
    item.key === key ? { ...item, ...changes } : item
  )));

  function saveDay() {
    setAttendance((previous) => {
      const next = { ...previous };
      draft.forEach((item) => {
        if (item.status === "None") return;
        const old = previous[item.key];
        const oldStatus = old?.status && old.status !== "Pending" ? old.status : "None";
        const changedStatus = item.status !== oldStatus;
        const hasReason = item.status !== "Present";
        const detail = item.detail.trim();
        const sameReason = (old?.reason || "") === item.reason && (old?.detail || "") === detail;
        if (!changedStatus && (!hasReason || sameReason)) return;
        const clearsLocation = item.status === "Absent" || item.status === "Excused";
        next[item.key] = {
          ...(old || {}),
          classId: item.classId,
          date: selectedDate,
          status: item.status,
          verified: changedStatus ? false : !!old?.verified,
          edited: !!old?.edited || changedStatus,
          auto: false,
          reason: hasReason ? item.reason : "",
          detail: hasReason ? detail : "",
          note: hasReason ? [item.reason, detail].filter(Boolean).join(" — ") : "",
          skipped: hasReason && !item.reason,
          ...(clearsLocation ? { checkIn: null, checkOut: null, leftEarly: false } : {}),
        };
      });
      return next;
    });
    setEditing(false);
  }

  return (
    <div className="yr">
      <div className="card">
        <div className="yr-head">
          <div>
            <strong>{t("School year")}</strong>
            <div className="note">{formatDate(start)} – {formatDate(end)}</div>
          </div>
          <button type="button" onClick={() => setDateDialog({ start: settings.yearStart, end: settings.yearEnd })}>
            {t("Edit dates")}
          </button>
        </div>

        <div className="yr-stats">
          <span className="yr-pct">{attendancePercent === null ? "–" : `${attendancePercent}%`}</span>
          <span>{t("Attendance")}</span>
          {["Present", "Late", "Absent", "Excused"].map((status) => (
            <span key={status}><b style={{ color: STATUS_COLORS[status] }}>{count[status]}</b> {t(status)}</span>
          ))}
        </div>

        <div className="yr-wrap">
          <div className="yr-days">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="yr-scroll" ref={scroller}>
            <div className="yr-months" style={{ width: weeks * STEP }}>{months}</div>
            <div className="yr-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 20px)` }}>{cells}</div>
          </div>
        </div>
        <div className="yr-hint">{t("Slide sideways to see the whole year")}</div>

        <div className="yr-legend">
          {[
            ["Present", t("Present")], ["Late", t("Late")], ["Absent", t("Absent")],
            ["Excused", t("Excused")], ["None", t("No record")], ["Upcoming", t("Upcoming")],
            ["Off", t("No class")],
          ].map(([key, label]) => (
            <span key={key}><i style={{ background: STATUS_COLORS[key] }} />{label}</span>
          ))}
        </div>
      </div>

      <div className="card">
        {!selectedDate && <div className="note">{t("Tap a box to see that day.")}</div>}
        {selectedDate && (
          <>
            <div className="yr-top">
              <strong>{toDate(selectedDate, "00:00").toLocaleDateString(locale, {
                weekday: "long", month: "short", day: "numeric",
              })}</strong>
              {canEdit && !editing && <button type="button" onClick={startEditing}>{t("Edit day")}</button>}
              {editing && (
                <span className="yr-edit">
                  <button type="button" className="primary" onClick={saveDay}>{t("Save")}</button>
                  <button type="button" onClick={() => setEditing(false)}>{t("Cancel")}</button>
                </span>
              )}
            </div>
            {selectedItems.length === 0 && <div className="note">{t("No classes on this day.")}</div>}
            {selectedItems.map((item) => {
              const editItem = editing ? draft.find((draftItem) => draftItem.key === item.key) : null;
              const info = [];
              if (item.record?.checkIn) info.push(t("In {time}", { time: formatTime(item.record.checkIn) }));
              if (item.record?.checkOut) info.push(t("Out {time}", { time: formatTime(item.record.checkOut) }));
              if (item.record?.verified) info.push(t("verified"));
              if (item.record?.leftEarly) info.push(t("left early"));
              if (item.record?.edited) info.push(t("Set by you (edited)"));
              return (
                <div className="yr-item" key={item.key}>
                  <div className="yr-row">
                    <div>
                      <b>{item.subject.name}</b>
                      <small>
                        <Time12 t={item.classItem.start} /> – <Time12 t={item.classItem.end} />
                        {item.subject.room && ` • ${t("Room {room}", { room: item.subject.room })}`}
                      </small>
                    </div>
                    {!editItem && (
                      <span className={`yr-chip ${item.status}`} style={{ background: STATUS_COLORS[item.status] }}>
                        {statusLabel(item.status)}
                      </span>
                    )}
                  </div>

                  {!editItem && info.length > 0 && <div className="note">{info.join(" • ")}</div>}
                  {!editItem && ["Late", "Absent", "Excused"].includes(item.status) && (
                    <div className="note">
                      {t("Reason")}: {item.record?.note ? reasonText(item.record, t) : t("Reason not set")}
                    </div>
                  )}
                  {!editItem && item.status === "None" && (
                    <div className="note">{t("No check-in was saved for this class. Edit the day to fix it.")}</div>
                  )}
                  {editing && !editItem && (
                    <div className="note">{t("Not finished yet. You can edit it after the class ends.")}</div>
                  )}

                  {editItem && (
                    <>
                      <div className="yr-opts">
                        {PICKS.map((status) => (
                          <span
                            key={status}
                            role="button"
                            tabIndex={0}
                            className={`yr-opt ${status} ${editItem.status === status ? "on" : ""}`}
                            style={{ "--c": STATUS_COLORS[status] }}
                            onClick={() => updateStatus(item.key, status)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                updateStatus(item.key, status);
                              }
                            }}
                          >
                            {t(status)}
                          </span>
                        ))}
                      </div>
                      {REASONS[editItem.status] && (
                        <>
                          <PickField
                            label={t("Reason")}
                            title={t("Choose a reason")}
                            icon="info"
                            placeholder={t("Choose a reason")}
                            value={editItem.reason}
                            options={REASONS[editItem.status].map((reason) => ({ value: reason, label: t(reason) }))}
                            onChange={(value) => updateDraft(item.key, { reason: value })}
                          />
                          <input
                            placeholder={t("Add details (optional)")}
                            value={editItem.detail}
                            onChange={(event) => updateDraft(item.key, { detail: event.target.value })}
                          />
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

      {dateDialog && (
        <Modal
          tone="info"
          icon="calendar"
          title={t("School year")}
          confirmLabel={t("Save dates")}
          confirmDisabled={!!dateError}
          onConfirm={() => {
            setSettings({ ...settings, yearStart: dateDialog.start, yearEnd: dateDialog.end });
            setDateDialog(null);
            setSelectedDate(null);
          }}
          onCancel={() => setDateDialog(null)}
        >
          <div className="fields">
            <SchoolYearFields start={dateDialog.start} end={dateDialog.end} onChange={setDateDialog} />
          </div>
          {dateError && <div className="note" style={{ color: "#ff6b76" }}>{t(dateError)}</div>}
        </Modal>
      )}
    </div>
  );
}
