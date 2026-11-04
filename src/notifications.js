// Alerts appear in-app and, when allowed, in the phone's notification tray.
export async function askPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export async function notify(title, body, tag) {
  const kind = tag.startsWith("task") ? "Task reminder" : tag === "test" ? "Test" : "Class alert";
  window.dispatchEvent(new CustomEvent("esched-alert", { detail: { title, body, kind } }));

  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const opts = {
    body, tag, icon: "/icon-192.png", badge: "/icon-192.png",
    vibrate: [200, 100, 200, 100, 400], renotify: false, requireInteraction: false, silent: false,
  };
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
  if (reg) reg.showNotification(title, opts);
  else new Notification(title, opts);
}

export function once(id) {
  const seen = JSON.parse(localStorage.getItem("fired") || "[]");
  if (seen.includes(id)) return false;
  localStorage.setItem("fired", JSON.stringify([...seen.slice(-300), id]));
  return true;
}
