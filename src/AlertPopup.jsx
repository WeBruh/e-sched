import { useEffect, useState } from "react";
import { playChime } from "./sound";
import { keepAwake } from "./wake";
import { I } from "./Icons";
import { useI18n } from "./i18n";

const safeVibrate = (pattern) => {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(pattern); } catch { /* some browsers block vibration until the user taps */ }
};

// A small banner at the top. It rings once, lights the screen, then goes away by itself.
export default function AlertPopup() {
  const { t, locale } = useI18n();
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const on = (e) => setQueue((q) => [...q, { id: Date.now() + Math.random(), at: new Date(), ...e.detail }].slice(-3));
    window.addEventListener("esched-alert", on);
    return () => window.removeEventListener("esched-alert", on);
  }, []);

  const a = queue[0];
  const id = a && a.id;

  useEffect(() => {
    if (!id) return;
    playChime();
    safeVibrate([200, 100, 200]);
    keepAwake(30000);
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), 9000);
    return () => clearTimeout(timer);
  }, [id]);

  if (!a) return null;
  return (
    <div className="toast" role="status" key={a.id}>
      <span className="toast-ic"><I.Bell width="22" height="22" /></span>
      <div className="toast-t">
        <b>{a.title}</b>
        <span>{a.body}</span>
        <small>{t(a.kind)} • {a.at.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</small>
      </div>
      <button aria-label={t("Close")} onClick={() => setQueue((q) => q.slice(1))}>×</button>
    </div>
  );
}
