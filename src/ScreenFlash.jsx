import { useEffect, useState } from "react";

// one wave = two repeating humps, so sliding it by half its width loops seamlessly
const WAVE = "M0 30 Q 150 0 300 30 T 600 30 T 900 30 T 1200 30 V80 H0 Z";

export default function ScreenFlash({ enabled }) {
  const [f, setF] = useState(null);

  useEffect(() => {
    let timer;
    const on = (e) => {
      if (!enabled) return;
      clearTimeout(timer);
      setF({ ...e.detail, id: Date.now() });
      timer = setTimeout(() => setF(null), 2900);
    };
    window.addEventListener("esched-flash", on);
    return () => { window.removeEventListener("esched-flash", on); clearTimeout(timer); };
  }, [enabled]);

  if (!f) return null;
  return (
    <div className={`flash ${f.tone}`} key={f.id} role="status">
      <div className="water">
        <svg className="wave w2" viewBox="0 0 1200 80" preserveAspectRatio="none"><path d={WAVE} /></svg>
        <svg className="wave w1" viewBox="0 0 1200 80" preserveAspectRatio="none"><path d={WAVE} /></svg>
      </div>
      <div className="flash-text">{f.text}</div>
    </div>
  );
}
