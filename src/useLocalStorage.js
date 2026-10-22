import { useState, useEffect } from "react";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    let raw = null;
    try { raw = localStorage.getItem(key); } catch { return initial; }
    if (raw === null) return initial;
    try {
      const saved = JSON.parse(raw);
      // new default fields appear after an update, saved values always win
      return isObj(initial) && isObj(saved) ? { ...initial, ...saved } : saved;
    } catch {
      // unreadable data: keep a copy instead of overwriting it
      try { localStorage.setItem(`${key}__corrupt_${Date.now()}`, raw); } catch { /* ignore */ }
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
  }, [key, value]);

  return [value, setValue];
}