const S = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export default function NotesIcon(p) {
  return (
    <svg {...S} {...p}>
      <path d="M5 4h14v10l-6 6H5z" />
      <path d="M13 20v-5a1 1 0 0 1 1-1h5" />
      <path d="M8.5 9h7M8.5 12.5h4" />
    </svg>
  );
}
