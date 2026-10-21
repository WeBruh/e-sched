import { playChime } from "./sound";

const PATTERN = [300, 120, 300, 120, 600];

export async function askPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export function alertUser() {
  if (document.visibilityState === "visible") playChime();
  navigator.vibrate?.(PATTERN);
}

export async function notify(title, body, tag) {
  alertUser();
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const opts = {
    body, tag, icon: "/icon-192.png", badge: "/icon-192.png",
    vibrate: PATTERN, renotify: true, requireInteraction: true, silent: false,
  };
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
  if (reg) reg.showNotification(title, opts);
  else new Notification(title, opts);
}

export function once(id) {
  const seen = JSON.parse(localStorage.getItem("fired") || "[]");
  if (seen.includes(id)) return false;
  localStorage.setItem("fired", JSON.stringify([...seen.slice(-200), id]));
  return true;
}