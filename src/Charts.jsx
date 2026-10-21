const C = { red: "#e8202f", teal: "#19d3c5", sky: "#ff2e93", blue: "#4cc9f0", grid: "rgba(255,255,255,0.14)" };

export function Line({ data }) {
  const W = 230, H = 130, L = 12, R = 20, T = 10, B = 24;
  const vals = data.map((d) => d.value).filter((v) => v !== null);
  const lo = vals.length ? Math.max(0, Math.min(...vals) - 8) : 0;
  const hi = vals.length ? Math.min(100, Math.max(...vals) + 8) : 100;
  const span = Math.max(hi - lo, 20);
  const x = (i) => L + (data.length > 1 ? (i * (W - L - R)) / (data.length - 1) : 0);
  const y = (v) => T + (H - T - B) * (1 - (v - lo) / span);
  const pts = data.map((d, i) => (d.value === null ? null : `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)).filter(Boolean);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg">
      {pts.length > 1 && (
        <polyline className="draw glow" pathLength="1" points={pts.join(" ")} fill="none"
          stroke={C.blue} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {data.map((d, i) => i % 2 === 1 && (
        <text key={i} x={x(i)} y={H - 6} fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.55">{d.label}</text>
      ))}
    </svg>
  );
}

export function Donut({ slices, center }) {
  const r = 38, circ = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 100 100" className="svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke={C.grid} strokeWidth="16" />
        {total > 0 && slices.map((s) => {
          const len = (s.value / total) * circ;
          const el = (
            <circle key={s.label} className="slice" style={{ "--l": len, "--r": circ - len }}
              cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
          );
          offset += len;
          return el;
        })}
        <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="500" fill="currentColor">{center}</text>
      </svg>
      <ul className="legend">
        {slices.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} />{s.value} {s.label}</li>
        ))}
      </ul>
    </div>
  );
}

export function Bars({ data }) {
  const W = 230, H = 130, B = 22, T = 16;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = data.length ? (W - 16) / data.length : 0;
  const w = Math.min(40, bw - 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg">
      {data.map((d, i) => {
        const h = ((H - B - T) * d.value) / max;
        const cx = 8 + i * bw + bw / 2;
        return (
          <g key={i}>
            <rect className="bar" x={cx - w / 2} y={H - B - h} width={w} height={h} rx="4" fill={C.sky} />
            <text x={cx} y={H - B - h - 4} textAnchor="middle" fontSize="11" fontWeight="500" fill="currentColor">{d.value}</text>
            <text x={cx} y={H - 5} textAnchor="middle" fontSize="11" fill="currentColor">{d.label.slice(0, 7)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Gauge({ value }) {
  const len = Math.PI * 40;
  const v = value ?? 0;
  const fill = (len * v) / 100;
  return (
    <svg viewBox="0 0 100 60" className="svg">
      <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={C.grid} strokeWidth="12" />
      <path className="garc" style={{ "--l": fill, "--c": len }} d="M10 50 A40 40 0 0 1 90 50" fill="none"
        stroke={v >= 80 ? C.teal : C.red} strokeWidth="12" strokeDasharray={`${fill} ${len}`} />
      <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="500" fill="currentColor">
        {value === null ? "–" : `${value}%`}
      </text>
    </svg>
  );
}