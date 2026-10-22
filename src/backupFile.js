import { DATA_VERSION, VERSION_KEY } from "./migrate";

const KEYS = ["subjects", "classes", "attendance", "tasks", "profile", "settings"];
const LAST = "esched_last_backup";
const FIRST = "esched_first_use";

export function firstUse() {
  try {
    let v = Number(localStorage.getItem(FIRST));
    if (!v) { v = Date.now(); localStorage.setItem(FIRST, String(v)); }
    return v;
  } catch {
    return Date.now();
  }
}

export function lastBackup() {
  try { return Number(localStorage.getItem(LAST)) || null; } catch { return null; }
}

export function readAll() {
  const data = {};
  KEYS.forEach((k) => {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = JSON.parse(v);
    } catch { /* skip unreadable key */ }
  });
  return data;
}

export function downloadBackup() {
  const file = { app: "e-sched", version: DATA_VERSION, exportedAt: new Date().toISOString(), data: readAll() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `e-sched-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  try { localStorage.setItem(LAST, String(Date.now())); } catch { /* ignore */ }
}

// Accepts the new backup format and the older flat one. Caller should reload the page afterwards.
export function restoreFromText(text) {
  let file;
  try { file = JSON.parse(text); } catch { throw new Error("That file isn't a valid E-Sched backup."); }
  const data = file && file.data ? file.data : file;
  const ok = data && Array.isArray(data.subjects) && Array.isArray(data.classes) && data.attendance && typeof data.attendance === "object";
  if (!ok) throw new Error("That file isn't a valid E-Sched backup.");
  KEYS.forEach((k) => {
    if (data[k] !== undefined) localStorage.setItem(k, JSON.stringify(data[k]));
  });
  // old backups get upgraded by the normal migration on the next start
  localStorage.setItem(VERSION_KEY, String(Number(file.version) || 1));
}
