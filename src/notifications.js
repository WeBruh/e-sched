let cfg = { mode: "manual", minutes: 2 };
export const configureAlerts = (c) => { cfg = c; };

export async function askPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export async function notify(title, body, tag) {
  const kind = tag.startsWith("task") ? "Task reminder" : tag === "test" ? "Test" : "Class alert";
  window.dispatchEvent(new CustomEvent("esched-alert", { detail: { title, body, kind } }));

  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const manual = cfg.mode === "manual";
  const opts = {
    body, tag, icon: "/icon-192.png", badge: "/icon-192.png",
    vibrate: [300, 120, 300, 120, 600], renotify: true, requireInteraction: manual, silent: false,
  };
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
  if (reg) {
    await reg.showNotification(title, opts);
    if (!manual)
      setTimeout(async () => (await reg.getNotifications({ tag })).forEach((n) => n.close()), cfg.minutes * 60000);
  } else new Notification(title, opts);
}

export function once(id) {
  const seen = JSON.parse(localStorage.getItem("fired") || "[]");
  if (seen.includes(id)) return false;
  localStorage.setItem("fired", JSON.stringify([...seen.slice(-200), id]));
  return true;
}