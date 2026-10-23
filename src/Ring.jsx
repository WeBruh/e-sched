import CountUp from "./CountUp";
import { useT } from "./i18n";

const COLORS = ["#19d3c5", "#e8202f", "#ffd23f", "#4cc9f0"];

export default function Ring({ present, absent, late, excused, percent }) {
  const t = useT();
  const r = 40, c = 2 * Math.PI * r;
  const vals = [present, absent, late, excused];
  const total = vals.reduce((a, b) => a + b, 0);
  let off = 0;
  return (
    <div className="ring">
      <svg viewBox="0 0 100 100" className="svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
        {total > 0 && vals.map((v, i) => {
          if (!v) return null;
          const len = (v / total) * c;
          const seg = Math.max(len - 1.5, 0.1);
          const el = (
            <circle key={i} className="slice" style={{ "--l": seg, "--r": c - seg }} cx="50" cy="50" r={r} fill="none"
              stroke={COLORS[i]} strokeWidth="9" strokeDasharray={`${seg} ${c - seg}`} strokeDashoffset={-off} transform="rotate(-90 50 50)" />
          );
          off += len;
          return el;
        })}
      </svg>
      <div className="ring-c">
        <b>{percent === null ? "–" : <CountUp value={percent} suffix="%" />}</b>
        <small>{t("Attendance Rate")}</small>
      </div>
    </div>
  );
}
