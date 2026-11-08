import { useEffect, useRef, useState } from "react";
import { I } from "./Icons";

const TRIGGER = 80;
const ZONE = 140; // pull-to-refresh only starts when the finger lands within this many px of the top of the screen
// things you drag or type in: they must never start a refresh
const NO_REFRESH = ".nt-mini, .nt-ghost, .nt-note, .yr-scroll, input, textarea, select, [data-no-refresh]";

async function refresh() {
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
    if (reg) await reg.update();
  } catch { /* ignore */ }
  await new Promise((r) => setTimeout(r, 700));
  window.location.reload();
}

// Pull down at the top of any screen to refresh the app
export default function PullRefresh() {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef(null);
  const pulled = useRef(0);

  useEffect(() => {
    const down = (e) => {
      const t0 = e.touches[0];
      const blocked = busy || e.touches.length !== 1 || window.scrollY > 0 || t0.clientY > ZONE
        || (e.target.closest && e.target.closest(NO_REFRESH))
        || document.querySelector(".modal-back, .nav-scrim, .sheet-back");
      startY.current = blocked ? null : e.touches[0].clientY;
    };
    const move = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY <= 0) { pulled.current = Math.min(dy * 0.5, 120); setPull(pulled.current); }
      else { pulled.current = 0; setPull(0); }
    };
    const up = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pulled.current >= TRIGGER) { setBusy(true); setPull(TRIGGER); refresh(); }
      else { pulled.current = 0; setPull(0); }
    };
    document.addEventListener("touchstart", down, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", up);
    document.addEventListener("touchcancel", up);
    return () => {
      document.removeEventListener("touchstart", down);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);
      document.removeEventListener("touchcancel", up);
    };
  }, [busy]);

  if (pull <= 0 && !busy) return null;
  return (
    <div className={`ptr ${busy ? "busy" : ""}`} style={{ transform: `translate(-50%, ${pull - 20}px)`, opacity: Math.min(pull / 40, 1) }}>
      <span style={busy ? undefined : { transform: `rotate(${pull * 4}deg)` }}><I.Refresh width="26" height="26" /></span>
    </div>
  );
}
