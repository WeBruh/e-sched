const S = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
const xs = [4, 9.5, 15];

export default function YearIcon(p) {
  return (
    <svg {...S} {...p}>
      {xs.flatMap((x) => xs.map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1.4" />))}
    </svg>
  );
}
