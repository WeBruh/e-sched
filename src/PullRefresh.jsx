import { useEffect, useRef, useState } from "react";
import { I } from "./Icons";
import { syncNow } from "./sync";

const TRIGGER = 80;

async function refresh() {
  try { await syncNow(); } catch { /* not signed in */ }
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
    if (reg) await reg.update();
  } catch { /* ignore */ }
  await new Promise((r) => setTimeout(r, 700));
  window.location.reload();
}

// Pull down at the top of any screen to sync and reload
export default function PullRefresh() {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef(null);
  const pulled = useRef(0);

  useEffect(() => {
    const down = (e) => {
      const blocked = busy || e.touches.length !== 1 || window.scrollY > 0 || document.querySelector(".modal-back, .nav-scrim, .sheet-back");
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
