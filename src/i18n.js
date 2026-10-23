import { createContext, useContext } from "react";
import TL from "./tl";

export const LANGS = [
  { id: "en", label: "English" },
  { id: "tl", label: "Tagalog" },
];

const fill = (s, p) => (p ? s.replace(/\{(\w+)\}/g, (_, k) => (p[k] === undefined ? `{${k}}` : String(p[k]))) : s);

// English text is the key. Tagalog comes from tl.js. Anything missing falls back to English.
export function makeI18n(lang) {
  const dict = lang === "tl" ? TL : null;
  return {
    lang,
    locale: lang === "tl" ? "fil-PH" : "en-US",
    t: (s, p) => fill((dict && dict[s]) || s, p),
  };
}

export function detectLang() {
  try {
    const saved = localStorage.getItem("esched_lang");
    if (saved === "en" || saved === "tl") return saved;
    const n = (navigator.language || "en").toLowerCase();
    return n.startsWith("fil") || n.startsWith("tl") ? "tl" : "en";
  } catch {
    return "en";
  }
}

export const I18nContext = createContext(makeI18n("en"));
export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;
