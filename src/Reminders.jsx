import { useEffect } from "react";
import useNow from "./useNow";
import { notify, once } from "./notifications";
import { toDate } from "./stats";

export default function Reminders({ tasks, enabled }) {
  const now = useNow();
  useEffect(() => {
    if (!enabled) return;
    const t = now.getTime();
    const within = (at) => t >= at && t < at + 2 * 60000;
    tasks.forEach((k) => {
      if (k.done) return;
      const at = toDate(k.date, k.time).getTime();
      if (within(at) && once(`task_${k.id}`)) notify(k.title, `Due ${k.time}`, `task_${k.id}`);
      if (k.evening) {
        const eve = toDate(k.date, "20:00").getTime() - 24 * 3600000;
        if (within(eve) && once(`task_${k.id}_eve`)) notify(`Tomorrow: ${k.title}`, `Due ${k.time}`, `task_${k.id}_eve`);
      }
    });
  });
  return null;
}