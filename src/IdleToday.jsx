import { useEffect, useState } from "react";
import useNow from "./useNow";
import { isoDate, toDate } from "./stats";
import { fmt12 } from "./time";
import { useI18n } from "./i18n";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function IdleToday({ classes, subjects, tasks }) {
  const { t } = useI18n();
  const now = useNow();
  const date = isoDate(now);
  const slides = (() => {
    const day = DAY_NAMES[now.getDay()];
    const todayClasses = classes
      .filter((item) => item.day === day)
      .map((item) => ({
        ...item,
        subject: subjects.find((subject) => subject.id === item.subjectId),
        startAt: toDate(date, item.start),
        endAt: toDate(date, item.end),
      }))
      .filter((item) => item.subject)
      .sort((a, b) => a.startAt - b.startAt);
    const currentClass = todayClasses.find((item) => now >= item.startAt && now < item.endAt)
      || todayClasses.find((item) => item.startAt > now);
    const pendingTasks = tasks
      .filter((item) => item.date === date && !item.done)
      .sort((a, b) => a.time.localeCompare(b.time));
    const agenda = [
      ...todayClasses.map((item) => ({
        id: `class-${item.id}`,
        time: item.start,
        title: item.subject.name,
        detail: `${fmt12(item.start)} – ${fmt12(item.end)}`,
      })),
      ...tasks.filter((item) => item.date === date).map((item) => ({
        id: `task-${item.id}`,
        time: item.time,
        title: item.title,
        detail: fmt12(item.time),
      })),
    ].sort((a, b) => a.time.localeCompare(b.time));

    return [
      ...(currentClass ? [{
        id: `subject-${currentClass.id}`,
        label: t("Current subject"),
        title: currentClass.subject.name,
        detail: `${fmt12(currentClass.start)} – ${fmt12(currentClass.end)}`,
      }] : []),
      ...pendingTasks.map((item) => ({
        id: `todo-${item.id}`,
        label: t("Today's task"),
        title: item.title,
        detail: fmt12(item.time),
      })),
      ...agenda.map((item) => ({
        id: `agenda-${item.id}`,
        label: t("Today's Agenda"),
        title: item.title,
        detail: item.detail,
      })),
    ];
  })();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 2000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[index % slides.length];

  return (
    <div className="idle-ticker" aria-live="polite" aria-atomic="true">
      <div className="idle-ticker-card" key={slide.id}>
        <span className="idle-ticker-label">{slide.label}</span>
        <strong>{slide.title}</strong>
        <span className="idle-ticker-detail">{slide.detail}</span>
      </div>
    </div>
  );
}
