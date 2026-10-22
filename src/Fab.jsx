import { useState } from "react";
import { I } from "./Icons";

const ITEMS = [
  { id: "Insights", Icon: I.Insights },
  { id: "Profile", Icon: I.Profile },
  { id: "Settings", Icon: I.Settings },
];

export default function Fab({ onOpen }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <div className="fab-scrim" onClick={() => setOpen(false)} />}
      <div className={`fab-wrap ${open ? "open" : ""}`}>
        {ITEMS.map(({ id, Icon }, i) => (
          <button key={id} className="fab-mini" style={{ "--i": i }} tabIndex={open ? 0 : -1}
            onClick={() => { setOpen(false); onOpen(id); }}>
            <span className="fab-label">{id}</span>
            <span className="fab-ic"><Icon width="22" height="22" /></span>
          </button>
        ))}
        <button className="fab-main" aria-label="Menu" onClick={() => setOpen(!open)}>
          <I.Plus width="26" height="26" />
        </button>
      </div>
    </>
  );
}