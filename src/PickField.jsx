import { useState } from "react";
import Modal from "./Modal";
import Radio from "./Radio";
import { I } from "./Icons";

export default function PickField({ label, title, icon = "info", value, options, onChange, placeholder = "Choose" }) {
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => String(o.value) === String(value));
  return (
    <>
      <button type="button" className="pick-btn" onClick={() => setOpen(true)}>
        <span className="tb-label">{label}</span>
        <span className="pb-val">{cur ? cur.label : <i>{placeholder}</i>}<I.Chevron width="16" height="16" /></span>
      </button>
      {open && (
        <Modal tone="info" icon={icon} title={title || label} cancelLabel={null} onCancel={() => setOpen(false)}>
          <div className="radios">
            {options.map((o) => (
              <Radio key={o.value} name="pick" checked={String(o.value) === String(value)} label={o.label}
                onChange={() => { onChange(o.value); setOpen(false); }} />
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
