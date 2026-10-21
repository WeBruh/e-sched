import { useEffect, useState } from "react";
import { playChime } from "./sound";

const PATTERN = [300, 120, 300, 120, 600];

export default function AlertPopup({ settings }) {
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
    if (!queue.length) { navigator.vibrate?.(0); return; }
    setStopped(false);
    const ring = () => {
      if (document.visibilityState !== "visible") return;
      playChime();
      navigator.vibrate?.(PATTERN);
    };
    ring();
    const loop = setInterval(ring, 3500);
    const stop = mode === "timed"
      ? setTimeout(() => { clearInterval(loop); navigator.vibrate?.(0); setStopped(true); }, minutes * 60000)
      : null;
    return () => { clearInterval(loop); clearTimeout(stop); navigator.vibrate?.(0); };
  }, [queue.length, mode, minutes]);

  if (!queue.length) return null;
  const a = queue[0];

  return (
    <div className="alert-pop" role="alertdialog" aria-modal="true">
      <div className="alert-box">
        <div className={`pulse ${stopped ? "off" : ""}`} />
        <small>{a.kind} • {a.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
        <h3>{a.title}</h3>
        <p>{a.body}</p>
        <small>{stopped ? "Alarm stopped" : mode === "manual" ? "Rings until you tap" : `Rings for ${minutes} min`}</small>
        {queue.length > 1 && <p className="note">+{queue.length - 1} more</p>}
        <div className="actions">
          <button className="primary" onClick={() => setQueue((q) => q.slice(1))}>Got it</button>
        </div>
      </div>
    </div>
  );
}