export default function Empty({ art = "calendar", title, text, actionLabel, onAction, compact }) {
  return (
    <div className={`empty ${compact ? "compact" : ""}`}>
      <div className="empty-art">
        <svg viewBox="0 0 64 64" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {art === "calendar" && <><rect x="10" y="14" width="44" height="40" rx="8" /><path d="M10 26h44M22 8v10M42 8v10M24 40l6 6 11-12" /></>}
          {art === "list" && <><rect x="14" y="10" width="36" height="46" rx="8" /><path d="M24 24h16M24 34h16M24 44h9" /></>}
          {art === "check" && <><circle cx="32" cy="32" r="22" /><path d="M22 33l7 7 14-15" /></>}
        </svg>
      </div>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {actionLabel && <button className="empty-btn" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}