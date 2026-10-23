import { useState, useEffect } from "react";
import { noteLocalChange, registerInitial } from "./sync";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
// new default fields appear after an update; saved values always win
const merge = (init, v) => (isObj(init) && isObj(v) ? { ...init, ...v } : v);

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    let v = initial;
    let raw = null;
    try { raw = localStorage.getItem(key); } catch { /* blocked */ }
    if (raw !== null) {
      try {
        v = merge(initial, JSON.parse(raw));
      } catch {
        // unreadable data: keep a copy instead of overwriting it
        try { localStorage.setItem(`${key}__corrupt_${Date.now()}`, raw); } catch { /* ignore */ }
      }
    }
    registerInitial(key, v);
    return v;
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
    noteLocalChange(key, value);
  }, [key, value]);

  // changes that arrive from another device
  useEffect(() => {
    const on = (e) => {
      if (e.detail.key !== key) return;
      const v = merge(initial, e.detail.value);
      registerInitial(key, v);
      setValue(v);
    };
    window.addEventListener("esched-remote", on);
    return () => window.removeEventListener("esched-remote", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
