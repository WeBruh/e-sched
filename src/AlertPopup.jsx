import { useEffect, useState } from "react";
import { playChime } from "./sound";
import Modal from "./Modal";
import { useI18n } from "./i18n";

const PATTERN = [300, 120, 300, 120, 600];

const safeVibrate = (pattern) => {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(pattern); } catch { /* some browsers block vibration until the user taps */ }
};

export default function AlertPopup({ settings }) {
  const { t, locale } = useI18n();
  const [queue, setQueue] = useState([]);
  const [stopped, setStopped] = useState(false);
  const mode = settings.alertMode || "manual";
  const minutes = settings.alertMinutes || 2;

  useEffect(() => {
    const on = (e) => setQueue((q) => [...q, { id: Date.now() + Math.random(), at: new Date(), ...e.detail }]);
    window.addEventListener("esched-alert", on);
    return () => window.removeEventListener("esched-alert", on);
  }, []);

  useEffect(() => {
    if (!queue.length) { safeVibrate(0); return; }
    setStopped(false);
    const ring = () => {
      if (document.visibilityState !== "visible") return;
      playChime();
      safeVibrate(PATTERN);
    };
    ring();
    const loop = setInterval(ring, 3500);
    const stop = mode === "timed"
      ? setTimeout(() => { clearInterval(loop); safeVibrate(0); setStopped(true); }, minutes * 60000)
      : null;
    return () => { clearInterval(loop); clearTimeout(stop); safeVibrate(0); };
  }, [queue.length, mode, minutes]);

  if (!queue.length) return null;
  const a = queue[0];
  const dismiss = () => setQueue((q) => q.slice(1));

  return (
    <Modal top tone="alert" icon="bell" ringing={!stopped} title={a.title} text={a.body}
      confirmLabel={t("Got it")} cancelLabel={null} onConfirm={dismiss} onCancel={dismiss}>
      <div className="modal-meta">
        {t(a.kind)} • {a.at.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} •{" "}
        {stopped ? t("Alarm stopped") : mode === "manual" ? t("Rings until you tap") : t("Rings for {n} min", { n: minutes })}
      </div>
      {queue.length > 1 && <p className="note">{t("+{n} more", { n: queue.length - 1 })}</p>}
    </Modal>
  );
}
