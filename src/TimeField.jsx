import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { to12, to24 } from "./time";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const pad = (n) => String(n).padStart(2, "0");

export function ApBadge({ ap, big }) {
  return <span className={`ap ${ap.toLowerCase()} ${big ? "big" : ""}`}>{ap}</span>;
}

// 8:00 with a coloured AM / PM badge
export function Time12({ t }) {
  const { hour, minute, ap } = to12(t);
  return <span className="t12">{hour}:{pad(minute)}<ApBadge ap={ap} /></span>;
}

function Col({ label, items, value, onPick, fmt }) {
  const ref = useRef(null);
  useEffect(() => {
    const box = ref.current;
    const el = box && box.querySelector(".on");
    if (box && el) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2;
  }, []);
  return (
    <div className="tp-col">
      <small>{label}</small>
      <div className="tp-list" ref={ref}>
        {items.map((v) => (
          <button type="button" key={v} className={v === value ? "on" : ""} onClick={() => onPick(v)}>{fmt(v)}</button>
        ))}
      </div>
    </div>
  );
}

export default function TimeField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(8);
  const [m, setM] = useState(0);
  const [ap, setAp] = useState("AM");
  const cur = to12(value);

  function show() {
    const c = to12(value);
    setH(c.hour); setM(c.minute); setAp(c.ap); setOpen(true);
  }

  return (
    <>
      <button type="button" className="time-btn" onClick={show}>
        <span className="tb-label">{label}</span>
        <span className="tb-val">{cur.hour}:{pad(cur.minute)}<ApBadge ap={cur.ap} /></span>
      </button>
      {open && (
        <Modal tone="info" icon="clock" title="Set time" confirmLabel="Set" cancelLabel="Cancel"
          onConfirm={() => { onChange(to24(h, m, ap)); setOpen(false); }} onCancel={() => setOpen(false)}>
          <div className="tp-preview">{h}:{pad(m)}<ApBadge ap={ap} big /></div>
          <div className="tp-cols">
            <Col label="Hour" items={HOURS} value={h} onPick={setH} fmt={String} />
            <Col label="Minute" items={MINUTES} value={m} onPick={setM} fmt={pad} />
          </div>
          <div className="tp-ap">
            <button type="button" className={`am ${ap === "AM" ? "on" : ""}`} onClick={() => setAp("AM")}>AM</button>
            <button type="button" className={`pm ${ap === "PM" ? "on" : ""}`} onClick={() => setAp("PM")}>PM</button>
          </div>
        </Modal>
      )}
    </>
  );
}
