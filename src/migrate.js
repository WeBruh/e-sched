// Keeps old saved data working when the app is updated.
// RULE: an update may reshape old data, but must never delete it.

export const DATA_VERSION = 2;
export const VERSION_KEY = "esched_data_version";
const DATA_KEYS = ["subjects", "classes", "attendance", "tasks", "profile", "settings"];

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// One step per data version. In a future update, add "3: () => { ... }" below.
const steps = {
  2: () => {
    const subjects = read("subjects", null);
    if (Array.isArray(subjects))
      write("subjects", subjects.map((s) => ({ instructor: "", room: "", units: "", ...s })));
    const tasks = read("tasks", null);
    if (Array.isArray(tasks))
      write("tasks", tasks.map((k) => ({ evening: false, done: false, ...k })));
    const settings = read("settings", null);
    if (settings && typeof settings === "object" && !Array.isArray(settings))
      write("settings", { reminders: true, alertMode: "manual", alertMinutes: 2, ...settings });
  },
};

export function runMigrations() {
  try {
    const from = Number(localStorage.getItem(VERSION_KEY)) || 1;
    if (from >= DATA_VERSION) return;

    // safety copy of everything before changing anything
    const snap = {};
    DATA_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) snap[k] = v;
    });
    if (Object.keys(snap).length) localStorage.setItem(`esched_backup_v${from}`, JSON.stringify(snap));

    for (let v = from + 1; v <= DATA_VERSION; v++) steps[v]?.();
    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  } catch (e) {
    console.error("E-Sched data upgrade failed. Old data was left in place.", e);
  }
}
