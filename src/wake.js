// Keeps the screen on for a short time while an alert is showing (works while the app is open).
let lock = null;
let timer = null;

export async function keepAwake(ms = 30000) {
  try {
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    if (!lock) {
      lock = await navigator.wakeLock.request("screen");
      lock.addEventListener("release", () => { lock = null; });
    }
    clearTimeout(timer);
    timer = setTimeout(() => { if (lock) lock.release().catch(() => {}); }, ms);
  } catch { /* not allowed right now */ }
}
