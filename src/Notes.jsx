import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Notes.css";
import Empty from "./Empty";
import Modal from "./Modal";
import TimeField, { Time12 } from "./TimeField";
import useLocalStorage from "./useLocalStorage";
import { reasonText } from "./ReasonModal";
import { buildRows, isoDate, toDate } from "./stats";
import { useI18n } from "./i18n";
import useNow from "./useNow";

const COLORS = ["peach", "blue", "lav", "mint", "yellow"];
const PAL = {
  peach: ["#fde3d3", "#4a2a1a", "#e8683a"],
  blue: ["#dfe6ff", "#1f2a5a", "#3b5bdb"],
  lav: ["#ecdcff", "#3d1f5a", "#7048e8"],
  mint: ["#d9f5e4", "#124a2c", "#19a974"],
  yellow: ["#fff3b0", "#4a4010", "#e8202f"],
  rose: ["#ffd9dc", "#5a1f26", "#e8202f"],
};
const STATUS_COLOR = { Late: "yellow", Absent: "rose", Excused: "blue" };
const TILT = [-3, 2, -2, 3, -1.5, 2.5];
const UNDO_MS = 6000;
const newId = () => Date.now() + Math.random();

const look = (c, i) => {
  const [bg, fg, pin] = PAL[c] || PAL.peach;
  return { "--bg": bg, "--fg": fg, "--pin": pin, "--r": `${TILT[i % TILT.length]}deg` };
};
const key = (e, fn) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); } };

export default function Notes({ tasks, setTasks, attendance, classes, subjects }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState("notes");
  const [hidden, setHidden] = useLocalStorage("esched_reason_hidden", []);
  const [falling, setFalling] = useState(null);
  const [back, setBack] = useState(null);
  const [stick, setStick] = useState(null);
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState(null);
  const [drag, setDrag] = useState(null);
  const [due, setDue] = useState(null);
  const wallRef = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const now = useNow(60000);
  const label = (iso) => toDate(iso, "00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
  const open = tasks.filter((k) => !k.done).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const reasons = buildRows(attendance, classes, subjects)
    .filter((r) => STATUS_COLOR[r.status] && (r.reason || r.note) && !hidden.includes(r.key))
    .sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));

  const patch = (id, fn) => setTasks((prev) => prev.map((k) => (k.id === id ? fn(k) : k)));
  const toggle = (id, iid) => patch(id, (k) => ({ ...k, items: (k.items || []).map((x) => (x.id === iid ? { ...x, done: !x.done } : x)) }));
  const addItem = (id, text) => patch(id, (k) => ({ ...k, items: [...(k.items || []), { id: newId(), text, done: false }] }));
  const delItem = (id, iid) => patch(id, (k) => ({ ...k, items: (k.items || []).filter((x) => x.id !== iid) }));

  const pull = (kind, id) => { if (!falling) setFalling(`${kind}:${id}`); };
  function finish(kind, id, title) {
    setFalling(null);
    if (kind === "task") patch(id, (k) => ({ ...k, done: true }));
    else setHidden((prev) => (prev.includes(id) ? prev : [...prev, id]));
    clearTimeout(timer.current);
    setToast({ kind, id, title, n: newId() });
    timer.current = setTimeout(() => setToast(null), UNDO_MS);
  }
  function undo() {
    if (!toast) return;
    clearTimeout(timer.current);
    if (toast.kind === "task") patch(toast.id, (k) => ({ ...k, done: false }));
    else setHidden((prev) => prev.filter((x) => x !== toast.id));
    setBack(`${toast.kind}:${toast.id}`);
    setTab(toast.kind === "task" ? "notes" : "reasons");
    setToast(null);
  }
  const fell = (e, kind, id, title) => { if (e.animationName === "nt-fall") finish(kind, id, title); };

  function addNote() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const n = { id: newId(), title: t("New note"), date: isoDate(d), time: "08:00", evening: false, done: false, items: [], color: COLORS[tasks.length % COLORS.length] };
    setTasks((prev) => [...prev, n]);
    setTab("notes"); setStick(n.id); setFocus(n.id);
  }
  const inWall = (x, y) => {
    const r = wallRef.current && wallRef.current.getBoundingClientRect();
    return !!r && x > r.left && x < r.right && y > r.top && y < r.bottom;
  };
  function startDrag(e) {
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    let moved = false;
    const move = (ev) => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) moved = true;
      setDrag({ x: ev.clientX, y: ev.clientY, over: inWall(ev.clientX, ev.clientY) });
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      setDrag(null);
    };
    const up = (ev) => { end(); if (!moved || inWall(ev.clientX, ev.clientY)) addNote(); };
    const cancel = () => end();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    setDrag({ x: sx, y: sy, over: false });
  }

  function saveDue() {
    patch(due.id, (k) => ({ ...k, date: due.date, time: due.time }));
    setDue(null);
  }

  const cls = (k, id) => `nt-note ${falling === k ? "fall" : ""} ${back === k ? "back" : ""} ${stick === id && k.startsWith("task") ? "stick" : ""}`;

  const taskNote = (k, i) => {
    const kk = `task:${k.id}`;
    const items = k.items || [];
    const done = items.filter((x) => x.done).length;
    const over = toDate(k.date, k.time) < now;
    return (
      <div key={k.id} className={cls(kk, k.id)} style={look(k.color || COLORS[k.id % COLORS.length], i)} onAnimationEnd={(e) => fell(e, "task", k.id, k.title)}>
        <div className={`nt-pin ${items.length && done === items.length ? "glow" : ""}`} role="button" tabIndex={0} aria-label={t("Remove the pin")}
          onClick={() => pull("task", k.id)} onKeyDown={(e) => key(e, () => pull("task", k.id))} />
        <div className="nt-num">{String(i + 1).padStart(2, "0")}</div>
        <input key={`${k.id}-${k.title}`} className="nt-title" defaultValue={k.title} autoFocus={focus === k.id}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => {
            if (focus === k.id) setFocus(null);
            const v = e.target.value.trim();
            if (!v) { e.target.value = k.title; return; }
            if (v !== k.title) patch(k.id, (x) => ({ ...x, title: v }));
          }}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }} />
        <div className={`nt-due ${over ? "over" : ""}`} role="button" tabIndex={0}
          onClick={() => setDue({ id: k.id, date: k.date, time: k.time })} onKeyDown={(e) => key(e, () => setDue({ id: k.id, date: k.date, time: k.time }))}>
          {over && `${t("Overdue")} • `}{label(k.date)} • <Time12 t={k.time} />
        </div>
        <div>
          {items.map((x) => (
            <div key={x.id} className={`nt-it ${x.done ? "done" : ""}`} role="checkbox" aria-checked={x.done} tabIndex={0}
              onClick={() => toggle(k.id, x.id)} onKeyDown={(e) => key(e, () => toggle(k.id, x.id))}>
              <span className="nt-bx" /><span className="nt-tx">{x.text}</span>
              <span className="nt-rm" role="button" aria-label={t("Remove item")} onClick={(e) => { e.stopPropagation(); delItem(k.id, x.id); }}>×</span>
            </div>
          ))}
        </div>
        {items.length > 0 && <div className="nt-pg">{t("{done} of {total} done", { done, total: items.length })}</div>}
        <input className="nt-add" placeholder={t("+ add an item, press Enter")}
          onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { addItem(k.id, e.currentTarget.value.trim()); e.currentTarget.value = ""; } }} />
      </div>
    );
  };

  const reasonNote = (r, i) => {
    const kk = `reason:${r.key}`;
    const title = `${t(r.status)}: ${r.subject.name}`;
    return (
      <div key={r.key} className={cls(kk, 0)} style={look(STATUS_COLOR[r.status], i)} onAnimationEnd={(e) => fell(e, "reason", r.key, title)}>
        <div className="nt-pin" role="button" tabIndex={0} aria-label={t("Remove the pin")} onClick={() => pull("reason", r.key)} onKeyDown={(e) => key(e, () => pull("reason", r.key))} />
        <div className="nt-num">{String(i + 1).padStart(2, "0")}</div>
        <div className="nt-title static">{title}</div>
        <div className="nt-due static">{label(r.date)} • <Time12 t={r.cls.start} /></div>
        <div className="nt-body">{reasonText(r, t)}</div>
      </div>
    );
  };

  return (
    <div className="nt">
      <div className="nt-top">
        <div className="nt-tabs">
          <div className={`nt-tab ${tab === "notes" ? "on" : ""}`} role="button" tabIndex={0} onClick={() => setTab("notes")} onKeyDown={(e) => key(e, () => setTab("notes"))}>{t("Notes")} <b>{open.length}</b></div>
          <div className={`nt-tab ${tab === "reasons" ? "on" : ""}`} role="button" tabIndex={0} onClick={() => setTab("reasons")} onKeyDown={(e) => key(e, () => setTab("reasons"))}>{t("Reasons")} <b>{reasons.length}</b></div>
        </div>
        <div className="nt-mini" role="button" tabIndex={0} aria-label={t("Add a note")} onPointerDown={startDrag} onKeyDown={(e) => key(e, addNote)}>{t("+ New note")}</div>
      </div>
      <div className="note">{tab === "notes"
        ? t("Drag the small note onto the wall, or tap it, to add a note. Pull a pin when you are done.")
        : t("Every reason you give for being late, absent or excused shows up here. Pull a pin to put it away.")}</div>

      <div ref={wallRef} className={`nt-wall ${drag && drag.over ? "over" : ""}`}>
        {tab === "notes" && open.map(taskNote)}
        {tab === "reasons" && reasons.map(reasonNote)}
        {tab === "notes" && open.length === 0 && (
          <div className="nt-empty"><Empty art="list" title={t("The wall is clear")} text={t("Drag the small note here to add one.")} /></div>
        )}
        {tab === "reasons" && reasons.length === 0 && (
          <div className="nt-empty"><Empty art="check" title={t("No reasons recorded yet.")} text={t("Every reason you give for being late, absent or excused shows up here.")} /></div>
        )}
      </div>

      {drag && createPortal(<div className="nt-ghost" style={{ left: drag.x - 38, top: drag.y - 32 }}>{t("+ New note")}</div>, document.body)}

      {toast && createPortal(
        <div className="nt-toast" role="status" key={toast.n}>
          <div className="nt-trow">
            <span>{toast.kind === "task" ? t("Done: {title}", { title: toast.title }) : t("Put away: {title}", { title: toast.title })}</span>
            <span className="nt-undo" role="button" tabIndex={0} onClick={undo} onKeyDown={(e) => key(e, undo)}>{t("Undo")}</span>
          </div>
          <div className="nt-bar" style={{ animationDuration: `${UNDO_MS}ms` }} />
        </div>,
        document.body
      )}

      {due && (
        <Modal tone="info" icon="calendar" title={t("Due date and time")} confirmLabel={t("Save")} confirmDisabled={!due.date}
          onConfirm={saveDue} onCancel={() => setDue(null)}>
          <label className="field"><span>{t("Date")}</span>
            <input type="date" style={{ colorScheme: "dark" }} value={due.date} onChange={(e) => setDue({ ...due, date: e.target.value })} />
          </label>
          <TimeField label={t("Time")} value={due.time} onChange={(v) => setDue({ ...due, time: v })} />
        </Modal>
      )}
    </div>
  );
}
