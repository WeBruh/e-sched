const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Flame = (props) => (
  <svg viewBox="0 0 64 72" aria-hidden="true" {...props}>
    <path d="M32 4c4 10 18 16 18 34a18 18 0 0 1-36 0c0-10 5-14 8-20 2 5 5 7 7 7-2-8-1-14 3-21z" fill="#e8202f" />
    <path d="M32 40c3 4 8 6 8 12a8 8 0 0 1-16 0c0-4 4-6 8-12z" fill="#fff" />
  </svg>
);

export const Check = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...STROKE} {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowUp = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...STROKE} {...props}>
    <path d="M12 19V6M6 11l6-6 6 6" />
  </svg>
);

export const ArrowDown = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...STROKE} {...props}>
    <path d="M12 5v13M6 13l6 6 6-6" />
  </svg>
);

export const Refresh = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...STROKE} {...props}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v5h-5" />
  </svg>
);

export const Sparkle = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...STROKE} {...props}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </svg>
);
