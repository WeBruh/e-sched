const C = { navy: "#1b1f4b", red: "#e23b4e", teal: "#3fb8c9", sky: "#8fa8e8", grid: "#e6e4f5" };

export function Line({ data }) {
  const W = 300, H = 160, L = 30, R = 10, T = 10, B = 25;
  const x = (i) => L + (data.length > 1 ? (i * (W - L - R)) / (data.length - 1) : 0);
  const y = (v) => T + (H - T - B) * (1 - v / 100);
  const pts = data.map((d, i) => (d.value === null ? null : [x(i), y(d.value)])).filter(Boolean);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg">
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={C.grid} />
          <text x={L - 6} y={y(v) + 4} fontSize="10" textAnchor="end" fill={C.navy}>{v}</text>
        </g>
      ))}
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.navy} strokeWidth="2.5" />
      {pts.map((p, i) => <rect key={i} x={p[0] - 4} y={p[1] - 4} width="8" height="8" fill={C.red} />)}
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill={C.navy}>{d.label}</text>
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
            <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
          );
          offset += len;
          return el;
        })}
        <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill={C.navy}>{center}</text>
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
  const W = 300, H = 160, B = 25, T = 15;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = data.length ? (W - 20) / data.length : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg">
      {data.map((d, i) => {
        const h = ((H - B - T) * d.value) / max;
        const x = 10 + i * bw;
        return (
          <g key={i}>
            <rect x={x + 4} y={H - B - h} width={Math.max(bw - 8, 1)} height={h} rx="4" fill={C.sky} />
            <text x={x + bw / 2} y={H - B - h - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill={C.navy}>{d.value}</text>
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill={C.navy}>{d.label.slice(0, 7)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Gauge({ value }) {
  const len = Math.PI * 40;
  const v = value ?? 0;
  return (
    <svg viewBox="0 0 100 60" className="svg">
      <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={C.grid} strokeWidth="12" />
      <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={v >= 80 ? C.teal : C.red}
        strokeWidth="12" strokeDasharray={`${(len * v) / 100} ${len}`} />
      <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="bold" fill={C.navy}>
        {value === null ? "–" : `${value}%`}
      </text>
    </svg>
  );
}