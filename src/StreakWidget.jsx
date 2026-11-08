import "./Streak.css";
import { Flame, Check } from "./StreakIcons";
import { useI18n } from "./i18n";

export default function StreakWidget({ streak, onOpen }) {
  const { t, locale } = useI18n();
  if (!streak.hasClasses) return null;

  const { done, total } = streak.weekProgress;
  const percentage = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const weekdays = Array.from({ length: 6 }, (_, index) =>
    new Date(2024, 0, index + 1).toLocaleDateString(locale, { weekday: "short" })
  );

  return (
    <div
      className="st-widget"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="st-tile">
        <Flame className="st-flame" />
        <div className="st-days">
          {streak.current === 1 ? t("{n} day", { n: 1 }) : t("{n} days", { n: streak.current })}
        </div>
        <small>{t("Attendance streak")}</small>
      </div>
      <div className="st-right">
        <div>
          <span className="st-num">{done}</span>
          <span className="st-of"> / {total}</span>
          <small>{t("classes clocked in this week")}</small>
        </div>
        <div className="st-track"><div className="st-fill" style={{ width: `${percentage}%` }} /></div>
        <div className="st-week">
          {weekdays.map((day, index) => (
            <div className="st-d" key={day}>
              <span className={`st-c ${streak.week[index] === "hit" ? "on" : ""}`}>
                {streak.week[index] === "hit" && <Check width="14" height="14" />}
              </span>
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
