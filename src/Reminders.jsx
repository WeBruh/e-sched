import { useEffect } from "react";
import useNow from "./useNow";
import { notify, once } from "./notifications";
import { flash } from "./flash";
import { playMiss } from "./sound";
import { isoDate, toDate } from "./stats";
import { fmt12 } from "./time";
import { useI18n } from "./i18n";

const MIN = 60000;
const DAY = 24 * 3600000;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CHECK_IN_NOTICE_MS = 10 * MIN;

// Class and task reminders alert once. Overdue tasks flash red once while the app is open.
export default function Reminders({ tasks, classes = [], subjects = [], attendance = {}, grace = 10, enabled, flashOn = true }) {
  const { t, locale } = useI18n();
  const now = useNow();
  useEffect(() => {
    if (!enabled) return;
    const n = now.getTime();
    const date = isoDate(now);
    const day = DAY_NAMES[now.getDay()];
    const visible = document.visibilityState === "visible";
    const missed = [];
    tasks.forEach((k) => {
      if (k.done) return;
      const at = toDate(k.date, k.time).getTime();
      const eve = toDate(k.date, "20:00").getTime() - DAY;
      const time = fmt12(k.time);
      if (k.evening && n >= eve && n - eve < 2 * 3600000 && n < at && once(`task_${k.id}_eve`))
        notify(t("Tomorrow: {title}", { title: k.title }), t("Due {time}", { time }), `task_${k.id}_eve`);
      if (n >= at && n - at < 30 * MIN && once(`task_${k.id}`))
        notify(k.title, t("Due {time}", { time }), `task_${k.id}`);
      if (visible && n - at >= 30 * MIN && n - at < DAY && once(`task_${k.id}_missed`)) missed.push(k);
    });
    if (missed.length) {
      playMiss();
      if (flashOn) flash("red", missed.length === 1 ? t("Missed: {title}", { title: missed[0].title }) : t("Missed {n} tasks", { n: missed.length }));
    }

    classes.forEach((c) => {
      if (c.day !== day) return;
      const subject = subjects.find((item) => item.id === c.subjectId);
      if (!subject) return;

      const key = `${c.id}_${date}`;
      const record = attendance[key] || {};
      const start = toDate(date, c.start).getTime();
      const end = toDate(date, c.end).getTime();
      const graceAt = start + grace * MIN;

      if (!record.checkIn && record.status !== "Excused" && n >= start - CHECK_IN_NOTICE_MS && n < graceAt && once(`${key}_pre`)) {
        const late = new Date(graceAt).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
        const minutes = Math.max(1, Math.round((start - n) / MIN));
        const title = start > n
          ? t("{name} starts in {m} min", { name: subject.name, m: minutes })
          : t("{name} has started", { name: subject.name });
        const body = subject.room
          ? t("{start} • Room {room}. Check in before {late} or you'll be marked late.", { start: fmt12(c.start), room: subject.room, late })
          : t("{start}. Check in before {late} or you'll be marked late.", { start: fmt12(c.start), late });
        notify(title, body, `${key}_pre`);
      }

      if (record.checkIn && !record.checkOut && n >= end && n < end + 30 * MIN && once(`${key}_check_out`)) {
        notify(t("Time to check out"), t("Remember to check out of {name}.", { name: subject.name }), `${key}_check_out`);
      }
    });
  });
  return null;
}
