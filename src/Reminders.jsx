import { useEffect } from "react";
import useNow from "./useNow";
import { notify, once } from "./notifications";
import { toDate } from "./stats";
import { fmt12 } from "./time";
import { useT } from "./i18n";

const DAY = 24 * 3600000;

export default function Reminders({ tasks, enabled }) {
  const t = useT();
  const now = useNow();
  useEffect(() => {
    if (!enabled) return;
    const n = now.getTime();
    tasks.forEach((k) => {
      if (k.done) return;
      const at = toDate(k.date, k.time).getTime();
      const eve = toDate(k.date, "20:00").getTime() - DAY;
      const time = fmt12(k.time);
      if (k.evening && n >= eve && n - eve < 2 * 3600000 && n < at && once(`task_${k.id}_eve`))
        notify(t("Tomorrow: {title}", { title: k.title }), t("Due {time}", { time }), `task_${k.id}_eve`);
      if (n >= at && n - at < DAY && once(`task_${k.id}`))
        notify(k.title, n - at > 5 * 60000 ? t("Missed at {time}", { time }) : t("Due {time}", { time }), `task_${k.id}`);
    });
  });
  return null;
}
