import { useState } from "react";
import { isoDate, toDate } from "./stats";
import { Time12 } from "./TimeField";
import { ConfirmDelete } from "./Modal";
import Empty from "./Empty";
import { useI18n } from "./i18n";

export default function TaskList({ tasks, setTasks, go }) {
  const { t, locale } = useI18n();
  const [del, setDel] = useState(null);
  const today = isoDate(new Date());
  const label = (iso) => toDate(iso, "00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
  const toggle = (id) => setTasks(tasks.map((k) => (k.id === id ? { ...k, done: !k.done } : k)));
  const byTime = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
  const open = tasks.filter((k) => !k.done).sort(byTime);
  const groups = [
    ["Overdue", open.filter((k) => k.date < today)],
    ["Today", open.filter((k) => k.date === today)],
    ["Upcoming", open.filter((k) => k.date > today)],
    ["Done", tasks.filter((k) => k.done).sort(byTime).reverse().slice(0, 10)],
  ];

  const row = (k) => (
    <label key={k.id} className={`task ${k.done ? "done" : ""}`}>
      <input type="checkbox" checked={k.done} onChange={() => toggle(k.id)} />
      <span>{k.title} <small>{label(k.date)} • <Time12 t={k.time} /></small></span>
      <button type="button" className="mini" onClick={(e) => { e.preventDefault(); setDel(k); }}>{t("Delete")}</button>
    </label>
  );

  return (
    <div>
      <button className="wide" onClick={() => go("Calendar")}>{t("+ Add a reminder")}</button>
      {tasks.length === 0 && (
        <Empty art="list" title={t("No tasks yet")} text={t("Add a reminder from the Calendar.")} actionLabel={t("Open Calendar")} onAction={() => go("Calendar")} />
      )}
      {groups.map(([name, list]) => list.length > 0 && (
        <div className="card" key={name}>
          <strong>{t(name)} <span className="count">{list.length}</span></strong>
          {list.map(row)}
        </div>
      ))}
      {del && (
        <ConfirmDelete title={t("Delete this reminder?")} text={del.title}
          onConfirm={() => { setTasks(tasks.filter((k) => k.id !== del.id)); setDel(null); }} onCancel={() => setDel(null)} />
      )}
    </div>
  );
}
