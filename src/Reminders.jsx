import { useEffect } from "react";
import useNow from "./useNow";
import { notify, once } from "./notifications";
import { toDate } from "./stats";

const DAY = 24 * 3600000;

export default function Reminders({ tasks, enabled }) {
  const now = useNow();
  useEffect(() => {
    if (!enabled) return;
    const t = now.getTime();
    tasks.forEach((k) => {
      if (k.done) return;
      const at = toDate(k.date, k.time).getTime();
      const eve = toDate(k.date, "20:00").getTime() - DAY;
      if (k.evening && t >= eve && t - eve < 2 * 3600000 && t < at && once(`task_${k.id}_eve`))
        notify(`Tomorrow: ${k.title}`, `Due ${k.time}`, `task_${k.id}_eve`);
      if (t >= at && t - at < DAY && once(`task_${k.id}`))
        notify(k.title, t - at > 5 * 60000 ? `Missed at ${k.time}` : `Due ${k.time}`, `task_${k.id}`);
    });
  });
  return null;
}