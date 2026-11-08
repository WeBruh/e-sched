import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./Streak.css";
import { Flame, Check } from "./StreakIcons";
import { isoDate } from "./stats";
import { useI18n } from "./i18n";

const KEY = "esched_streak_seen";
const AFTER_MS = 4500;

export default function StreakCelebration({ streak }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const { current, todayHit } = streak;

  useEffect(() => {
    if (!todayHit || current < 1) return undefined;
    let seen = "";
    try {
      seen = localStorage.getItem(KEY) || "";
    } catch {
      seen = "";
    }
    if (seen === isoDate(new Date())) return undefined;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, isoDate(new Date()));
      } catch {
        // Storage can be unavailable in private browsing.
      }
      setOpen(true);
    }, AFTER_MS);
    return () => clearTimeout(timer);
  }, [current, todayHit]);

  if (!open) return null;
  const weekdays = Array.from({ length: 6 }, (_, index) =>
    new Date(2024, 0, index + 1).toLocaleDateString(locale, { weekday: "narrow" })
  );

  return createPortal(
    <div className="st-cel" role="dialog" aria-modal="true">
      <Flame className="st-celflame" />
      <div className="st-celnum">{current}</div>
      <div className="st-cellabel">{t("New streak")}</div>
      <div className="st-celsub">{t("All your classes today are done.")}</div>
      <div className="st-celbottom">
        <div className="st-panel">
          <div className="st-dow">{weekdays.map((day, index) => <span key={index}>{day}</span>)}</div>
          <div className="st-dots">
            {streak.week.map((status, index) => (
              <span key={index} className={`st-c ${status === "hit" ? "on" : ""}`}>
                {status === "hit" && <Check width="14" height="14" />}
              </span>
            ))}
          </div>
        </div>
        <button className="st-btn" type="button" onClick={() => setOpen(false)}>{t("Continue")}</button>
      </div>
    </div>,
    document.body
  );
}
