import { useEffect } from "react";
import useNow from "./useNow";
import { notify, once } from "./notifications";
import { flash } from "./flash";
import { playMiss } from "./sound";
import { toDate } from "./stats";
import { fmt12 } from "./time";
import { useT } from "./i18n";

const MIN = 60000;
const DAY = 24 * 3600000;

// Each reminder alerts once at its time. If it is still not done 30 minutes later
// and the app is open, the screen flashes red once.
export default function Reminders({ tasks, enabled, flashOn = true }) {
  const t = useT();
  const now = useNow();
  useEffect(() => {
    if (!enabled) return;
    const n = now.getTime();
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
  });
  return null;
}
