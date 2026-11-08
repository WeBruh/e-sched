import { isoDate, toDate, weekStart } from "./stats";

// Present counts. Late counts too while LATE_COUNTS is true (set false for on-time only).
export const LATE_COUNTS = true;

const FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function computeStreaks({ classes, subjects, attendance, settings, now = new Date() }) {
  const byDay = {};
  classes.forEach((classItem) => {
    if (subjects.some((subject) => subject.id === classItem.subjectId)) {
      (byDay[classItem.day] = byDay[classItem.day] || []).push(classItem);
    }
  });

  const todayIso = isoDate(now);
  const records = Object.values(attendance).filter((record) => record && record.date);
  const firstRecord = records.map((record) => record.date).sort()[0];

  let startIso = settings.yearStart || firstRecord || todayIso;
  if (firstRecord && firstRecord > startIso) startIso = firstRecord;
  let endIso = todayIso;
  if (settings.yearEnd && settings.yearEnd < todayIso) endIso = settings.yearEnd;

  const state = (iso) => {
    const date = toDate(iso, "00:00");
    const dayClasses = byDay[FULL[date.getDay()]] || [];
    if (!dayClasses.length || date.getDay() === 0) return "off";

    let counted = 0;
    let missed = false;
    let upcoming = false;
    let unrecorded = false;
    dayClasses.forEach((classItem) => {
      const record = attendance[`${classItem.id}_${iso}`];
      const status = record && record.status && record.status !== "Pending" ? record.status : null;
      if (!status) {
        if (toDate(iso, classItem.end) > now) upcoming = true;
        else unrecorded = true;
        return;
      }
      if (status === "Present") counted++;
      else if (status === "Late") {
        if (LATE_COUNTS) counted++;
        else missed = true;
      } else if (status === "Absent") missed = true;
    });

    if (missed) return "miss";
    if (upcoming) return "pending";
    if (unrecorded) return "off";
    return counted ? "hit" : "off";
  };

  let run = 0;
  let runStart = null;
  let longest = 0;
  let longestStart = null;
  let longestEnd = null;
  const date = toDate(startIso, "00:00");
  for (let day = 0; day < 440 && isoDate(date) <= endIso; day++, date.setDate(date.getDate() + 1)) {
    const iso = isoDate(date);
    const status = state(iso);
    if (status === "hit") {
      if (run === 0) runStart = iso;
      run++;
      if (run > longest) {
        longest = run;
        longestStart = runStart;
        longestEnd = iso;
      }
    } else if (status === "miss") {
      run = 0;
    }
  }

  const monday = weekStart(now);
  const week = [];
  let done = 0;
  let total = 0;
  for (let index = 0; index < 6; index++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const iso = isoDate(day);
    week.push(iso > todayIso ? "future" : state(iso));
    (byDay[FULL[day.getDay()]] || []).forEach((classItem) => {
      total++;
      const record = attendance[`${classItem.id}_${iso}`];
      if (record && (record.status === "Present" || record.status === "Late")) done++;
    });
  }

  const from = new Date(now);
  from.setDate(from.getDate() - 29);
  const fromIso = isoDate(from);
  const monthOf = (record) => record.date.slice(0, 7);
  const thisMonth = todayIso.slice(0, 7);
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  const monthTotals = { [thisMonth]: [0, 0], [previousMonth]: [0, 0] };
  let onTime = 0;
  let total30 = 0;
  records.forEach((record) => {
    if (!["Present", "Late", "Absent"].includes(record.status)) return;
    const attended = record.status !== "Absent";
    if (monthTotals[monthOf(record)]) {
      monthTotals[monthOf(record)][1]++;
      if (attended) monthTotals[monthOf(record)][0]++;
    }
    if (record.date >= fromIso && record.date <= todayIso) {
      total30++;
      if (record.status === "Present") onTime++;
    }
  });

  const percentage = (values) => (values[1] ? (values[0] / values[1]) * 100 : null);
  const currentPercentage = percentage(monthTotals[thisMonth]);
  const previousPercentage = percentage(monthTotals[previousMonth]);

  return {
    current: run,
    longest,
    longestRange: longestStart ? { start: longestStart, end: longestEnd } : null,
    week,
    weekProgress: { done, total },
    last30: { onTime, total: total30 },
    trend: currentPercentage !== null && previousPercentage !== null
      ? Math.round(currentPercentage - previousPercentage)
      : null,
    todayHit: state(todayIso) === "hit",
    hasClasses: classes.length > 0 && Object.keys(byDay).length > 0,
  };
}
