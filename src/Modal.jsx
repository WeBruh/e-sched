import { createPortal } from "react-dom";
import { useT } from "./i18n";

const ICONS = {
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />,
  check: <path d="M5 12l5 5 9-10" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  bell: <path d="M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4zM10 20h4" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
};

export default function Modal({ tone = "info", icon = "info", title, text, children, confirmLabel, cancelLabel, confirmDisabled, onConfirm, onCancel, locked, ringing, top }) {
  const t = useT();
  const cancel = cancelLabel === undefined ? t("Cancel") : cancelLabel; // null hides the button
  return createPortal(
    <div className={`modal-back ${top ? "top" : ""}`} onClick={locked ? undefined : onCancel}>
      <div className={`modal ${tone}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {!locked && onCancel && <button className="modal-x" aria-label={t("Close")} onClick={onCancel}>×</button>}
        <div className={`modal-ic ${ringing ? "ringing" : ""}`}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[icon]}</svg>
        </div>
        <h3>{title}</h3>
        {text && <p className="modal-text">{text}</p>}
        {children}
        <div className="modal-actions">
          {cancel && onCancel && <button className="m-cancel" onClick={onCancel}>{cancel}</button>}
          {confirmLabel && <button className="m-confirm" disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</button>}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDelete({ title, text, onConfirm, onCancel }) {
  const t = useT();
  return <Modal tone="danger" icon="trash" title={title} text={text} confirmLabel={t("Delete")} onConfirm={onConfirm} onCancel={onCancel} />;
}
