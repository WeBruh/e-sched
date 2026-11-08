import "./Streak.css";
import { Flame, Check } from "./StreakIcons";
import { toDate } from "./stats";
import { useI18n } from "./i18n";

export default function StreakScreen({ streak, onBack }) {
  const { t, locale } = useI18n();
  const weekdays = Array.from({ length: 6 }, (_, index) =>
    new Date(2024, 0, index + 1).toLocaleDateString(locale, { weekday: "narrow" })
  );
  const shortDate = (iso) => toDate(iso, "00:00").toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <div className="st-page">
      <button className="wide" onClick={onBack}>‹ {t("Back")}</button>
      <Flame className="st-bigflame" />
      <div className="st-bignum">{streak.current}</div>
      <div className="st-biglabel">{t("Days Streak")}</div>
      <div className="st-panel">
        <div className="st-dow">{weekdays.map((day, index) => <span key={index}>{day}</span>)}</div>
        <div className="st-dots">
          {streak.week.map((status, index) => (
            <span key={index} className={`st-c ${status === "hit" ? "on" : ""}`}>
              {status === "hit" && <Check width="14" height="14" />}
            </span>
          ))}
        </div>
        <div className="st-msg">
          <Flame width="16" height="18" />
          <span>
            {streak.current > 0
              ? t("Your attendance streak is growing, and so is your discipline. Every class you clock in on is a step closer to your goals.")
              : t("No streak yet. Clock in on all your classes today to start one.")}
          </span>
        </div>
        <div className="st-best">
          {t("Longest streak")}: <b>{t("{n} days", { n: streak.longest })}</b>
          {streak.longestRange && (
            <span> • {shortDate(streak.longestRange.start)} – {shortDate(streak.longestRange.end)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
