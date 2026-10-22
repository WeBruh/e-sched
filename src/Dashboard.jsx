import { useEffect, useState } from "react";
import useNow from "./useNow";
import CountUp from "./CountUp";
import Empty from "./Empty";
import Ring from "./Ring";
import { Time12 } from "./TimeField";
import { I } from "./Icons";
import ReasonModal, { reasonHandlers } from "./ReasonModal";
import { isoDate, toDate, fmtCountdown, distanceMeters, summarize, buildRows, weekStart } from "./stats";
import { notify, once } from "./notifications";
import { motivation } from "./motivation";
import banner from "./assets/miles-gwen.jpg";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = ["#19d3c5", "#e8202f", "#ffd23f", "#4cc9f0"];
const MIN = 60000;
const OPEN_BEFORE = 15 * MIN;
const OUT_AFTER = 30 * MIN;
const TARGET = 80;

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Location isn't supported on this device."));
    navigator.geolocation.getCurrentPosition(
      resolve,
      () => reject(new Error("Couldn't get your location. Allow location access and try again.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const dayLabel = (iso) => toDate(iso, "00:00").toLocaleDateString([], { month: "short", day: "numeric" });
const safeVibrate = (pattern) => {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(pattern); } catch { /* some browsers block vibration until the user taps */ }
};

export default function Dashboard({ subjects, classes, attendance, setAttendance, settings, tasks, setTasks, openRecords, go, profile }) {
  const now = useNow();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [selIdx, setSelIdx] = useState((new Date().getDay() + 6) % 7);
  const date = isoDate(now);
  const dayName = DAY_NAMES[now.getDay()];
  const grace = settings.grace * MIN;
  const located = settings.lat !== null;
  const alertsOn = settings.reminders !== false;
  const keyOf = (c) => `${c.id}_${date}`;
  const recOf = (c) => attendance[keyOf(c)] || {};
  const h = reasonHandlers(setAttendance);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const validClass = (c) => subjects.some((s) => s.id === c.subjectId);
  const todays = classes
    .filter((c) => c.day === dayName && validClass(c))
    .map((c) => ({ ...c, subject: subjects.find((s) => s.id === c.subjectId), startAt: toDate(date, c.start), endAt: toDate(date, c.end) }))
    .sort((a, b) => a.startAt - b.startAt);

  const isOpen = (r) => !r || !r.status || r.status === "Pending";

  useEffect(() => {
    const missing = todays.filter((c) => now >= c.endAt && isOpen(attendance[keyOf(c)]));
    if (!missing.length) return;
    setAttendance((prev) => {
      const next = { ...prev };
      missing.forEach((c) => {
        const k = keyOf(c);
        if (isOpen(next[k])) next[k] = { ...next[k], classId: c.id, date, status: "Absent", auto: true };
      });
      return next;
    });
  });

  useEffect(() => {
    if (!alertsOn) return;
    const t = now.getTime();
    const within = (at) => t >= at && t < at + 2 * MIN;
    todays.forEach((c) => {
      const r = recOf(c), s = c.startAt.getTime(), e = c.endAt.getTime(), k = keyOf(c);
      const room = c.subject.room ? ` • Room ${c.subject.room}` : "";
      if (!r.checkIn && r.status !== "Excused" && within(s - 10 * MIN) && once(`${k}_pre`))
        notify(`${c.subject.name} starts in 10 min`, `${c.start}${room}. Check-in is open.`, `${k}_pre`);
      if (!r.checkIn && r.status !== "Excused" && within(s + grace - 5 * MIN) && once(`${k}_late`))
        notify("Check in now", `You'll be marked late for ${c.subject.name} in 5 minutes.`, `${k}_late`);
      if (r.checkIn && !r.checkOut && within(e - 5 * MIN) && once(`${k}_out`))
        notify("Almost done", `Remember to check out of ${c.subject.name}.`, `${k}_out`);
    });
  });

  function save(c, changes) {
    setAttendance((prev) => {
      const old = prev[keyOf(c)] || {};
      return { ...prev, [keyOf(c)]: { classId: c.id, date, ...old, status: old.status || "Pending", ...changes } };
    });
  }

  async function verify() {
    if (!located) throw new Error("Set your school location first (More → Settings).");
    const { coords } = await getPosition();
    if (coords.accuracy > settings.radius) throw new Error(`GPS too imprecise (±${Math.round(coords.accuracy)} m). Go near a window and retry.`);
    const dist = distanceMeters(coords.latitude, coords.longitude, settings.lat, settings.lng);
    if (dist > settings.radius) throw new Error(`Not at school: about ${Math.round(dist)} m away (limit ${settings.radius} m).`);
    return Math.round(dist);
  }

  async function checkIn(c) {
    setBusy(true); setMsg("");
    try {
      const distance = await verify();
      const at = new Date().getTime();
      if (at < c.startAt.getTime() - OPEN_BEFORE || at >= c.endAt.getTime()) throw new Error("Check-in is closed for this class.");
      const status = at <= c.startAt.getTime() + grace ? "Present" : "Late";
      save(c, { status, checkIn: new Date(at).toISOString(), verified: true, distance, auto: false });
      safeVibrate(80);
      setMsg(`Checked in: ${status}`);
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  async function checkOut(c) {
    setBusy(true); setMsg("");
    try {
      await verify();
      const at = new Date().getTime();
      const early = at < c.endAt.getTime() - 5 * MIN;
      save(c, { checkOut: new Date(at).toISOString(), leftEarly: early });
      safeVibrate(80);
      setMsg(early ? "Checked out (left early)" : "Checked out");
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  const excuse = (c) => save(c, { status: "Excused", auto: false, skipped: false });

  function actions(c) {
    const r = recOf(c), t = now.getTime();
    const canIn = !r.checkIn && r.status !== "Excused" && t >= c.startAt.getTime() - OPEN_BEFORE && t < c.endAt.getTime();
    const canOut = r.checkIn && !r.checkOut && t < c.endAt.getTime() + OUT_AFTER;
    const canExcuse = !r.checkIn && r.status !== "Excused" && t >= c.startAt.getTime() - OPEN_BEFORE;
    return (
      <div className="actions">
        {canIn && <button className="primary" disabled={busy} onClick={() => checkIn(c)}>{busy ? "Verifying location…" : "Check in"}</button>}
        {canOut && <button className="primary" disabled={busy} onClick={() => checkOut(c)}>{busy ? "Verifying location…" : "Check out"}</button>}
        {canExcuse && <button disabled={busy} onClick={() => excuse(c)}>Excused</button>}
      </div>
    );
  }

  const focus = todays.find((c) => now < c.endAt);
  const next = todays.find((c) => c !== focus && c.startAt > now);
  const fr = focus ? recOf(focus) : {};
  const lateAt = focus ? new Date(focus.startAt.getTime() + grace) : null;
  const pendingOut = todays.find((c) => c !== focus && recOf(c).checkIn && !recOf(c).checkOut && now.getTime() < c.endAt.getTime() + OUT_AFTER);

  function alertBar() {
    if (!focus || fr.status === "Excused") return null;
    const t = now.getTime();
    const room = focus.subject.room ? `Room ${focus.subject.room}` : "";
    if (fr.checkIn) return <div className="alert ok"><div><div>Checked in ✓ verified</div><div className="big">{fmtCountdown(focus.endAt - now)}</div></div><div className="side">until class ends</div></div>;
    if (t < focus.startAt.getTime() - OPEN_BEFORE) return <div className="alert info"><div><div>Check-in opens in</div><div className="big">{fmtCountdown(focus.startAt.getTime() - OPEN_BEFORE - t)}</div></div><div className="side">{focus.subject.name}<br />{room}</div></div>;
    if (t < lateAt.getTime()) return <div className="alert warn"><div><div>Check in before you're marked late</div><div className="big">{fmtCountdown(lateAt - now)}</div></div><div className="side">{focus.subject.name}<br />{room}</div></div>;
    return <div className="alert late"><div><div>You're late. Check in now</div><div className="big">{fmtCountdown(now - lateAt)}</div></div><div className="side">{focus.subject.name}<br />{room}</div></div>;
  }

  // ----- numbers -----
  const rows = buildRows(attendance, classes, subjects);
  const all = summarize(rows);
  const per = subjects.map((s) => ({ label: s.name, ...summarize(rows.filter((r) => r.subject.id === s.id)) }));
  const lowest = per.filter((p) => p.percent !== null).sort((a, b) => a.percent - b.percent)[0];
  const boost = motivation({ all, rows, todayRecs: todays.map(recOf), now });

  const hr = now.getHours();
  const hello = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const first = ((profile && profile.name) || "").trim().split(" ")[0] || "there";
  const sub = all.percent === null ? "Check in to your first class to get started."
    : all.percent >= TARGET ? "Keep going! You're doing great this week." : "You've got this. One class at a time.";
  const longDate = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const shortDate = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  // ----- weekly schedule -----
  const ws = weekStart(now);
  const todayIdx = (now.getDay() + 6) % 7;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + i);
    return { name: DAY_NAMES[d.getDay()], label: d.toLocaleDateString([], { weekday: "short" }), date: d.toLocaleDateString([], { month: "short", day: "numeric" }) };
  });
  const selClasses = classes
    .filter((c) => validClass(c) && c.day === weekDays[selIdx].name)
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((c) => ({ ...c, subject: subjects.find((s) => s.id === c.subjectId) }));

  // ----- agenda + tasks -----
  const todayTasks = tasks.filter((k) => k.date === date);
  const agenda = [
    ...todays.map((c) => ({ id: `c${c.id}`, at: c.startAt.getTime(), c })),
    ...todayTasks.map((k) => ({ id: `t${k.id}`, at: toDate(date, k.time).getTime(), k })),
  ].sort((a, b) => a.at - b.at);
  const flip = (k) => setTasks(tasks.map((x) => (x.id === k.id ? { ...x, done: !x.done } : x)));

  const tomorrow = isoDate(new Date(now.getTime() + 86400000));
  const horizon = isoDate(new Date(now.getTime() + 14 * 86400000));
  const open = tasks.filter((k) => !k.done);
  const upcoming = [
    ...open.filter((k) => k.date < date).sort((a, b) => a.date.localeCompare(b.date)),
    ...open.filter((k) => k.date > date && k.date <= horizon).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
  ].slice(0, 5);
  const urgency = (k) => (k.date < date ? "over" : k.date <= tomorrow ? "soon" : "");

  const needs = rows
    .filter((r) => ["Late", "Absent", "Excused"].includes(r.status) && !r.note && !r.skipped && now - toDate(r.date, "00:00") < 14 * 86400000)
    .sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start))[0];

  const legend = [
    { label: "Present", value: all.present, color: COLORS[0] },
    { label: "Absent", value: all.absent, color: COLORS[1], open: "Absent" },
    { label: "Late", value: all.late, color: COLORS[2], open: "Late" },
    { label: "Excused", value: all.excused, color: COLORS[3], open: "Excused" },
  ];

  return (
    <div className="dash">
      <section className="hero" style={{ "--hero": `url(${banner})` }}>
        <div>
          <div className="hello">{hello},</div>
          <h1 className="hi">{first} <span aria-hidden="true">🔥</span></h1>
          <div className="sub">{sub}</div>
          <div className="date">
            <I.Schedule width="16" height="16" />
            <span className="d-long">{longDate}</span>
            <span className="d-short">{shortDate}</span>
          </div>
        </div>
        <blockquote className="quote">“{boost.text}”<cite>{boost.title}</cite></blockquote>
      </section>

      {subjects.length === 0 && (
        <div className="empty-top">
          <Empty art="list" title="No subjects yet" text="Add your first subject to see your day here."
            actionLabel="Add a subject" onAction={() => go("Subjects")} />
        </div>
      )}

      <section className="checkin">
        {!online && <div className="offline">Offline • everything is saved on this phone</div>}
        {alertBar()}
        {msg && <div className="msg">{msg}</div>}
        {subjects.length > 0 && (
          <div className="card focus-card">
            {focus ? (
              <>
                <div className="row">
                  <div>
                    <small>{now >= focus.startAt ? "Current subject" : "Up next"}</small>
                    <div className="subj">{focus.subject.name}</div>
                    <small>{focus.start} – {focus.end}{focus.subject.room && ` • Room ${focus.subject.room}`}</small>
                  </div>
                  <div className="right"><small>Ends in</small><div className="num">{fmtCountdown(focus.endAt - now)}</div></div>
                </div>
                {fr.checkIn && (
                  <div className="note">
                    {fr.status}{fr.verified && " • ✓ verified"} • In {fmtTime(fr.checkIn)}{fr.checkOut && ` • Out ${fmtTime(fr.checkOut)}`}{fr.leftEarly && " • left early"}
                  </div>
                )}
                {actions(focus)}
                {next && <div className="nextrow"><span>Next: {next.subject.name}, {next.start}</span><b>in {fmtCountdown(next.startAt - now)}</b></div>}
              </>
            ) : <p>No more classes today.</p>}
          </div>
        )}
        {pendingOut && <div className="card"><strong>Check out of {pendingOut.subject.name}</strong>{actions(pendingOut)}</div>}
        {lowest && lowest.percent < TARGET && (
          <div className="warn-chip"><b>{lowest.label} is at {lowest.percent}%</b><small>Below the {TARGET}% target. Another absence will hurt.</small></div>
        )}
      </section>

      <section className="card ring-card">
        <Ring present={all.present} absent={all.absent} late={all.late} excused={all.excused} percent={all.percent} />
        <div className="legend2">
          {legend.map((l) => l.open ? (
            <button key={l.label} className="lg" onClick={() => openRecords(l.open)}>
              <i style={{ background: l.color }} /><span>{l.label}</span><b><CountUp value={l.value} /></b>
            </button>
          ) : (
            <div key={l.label} className="lg">
              <i style={{ background: l.color }} /><span>{l.label}</span><b><CountUp value={l.value} /></b>
            </div>
          ))}
        </div>
        <button className="view-all" onClick={() => go("History")}>View all <I.Arrow width="14" height="14" /></button>
      </section>

      <section className="card agenda-card">
        <div className="ch"><span className="ci red"><I.Schedule width="18" height="18" /></span>Today's Agenda</div>
        {agenda.length === 0 && <div className="muted">Nothing planned today. Enjoy it.</div>}
        <div className="tl">
          {agenda.map((a) => {
            if (a.c) {
              const live = now >= a.c.startAt && now < a.c.endAt;
              const done = now >= a.c.endAt;
              const st = recOf(a.c).status;
              return (
                <div className={`tl-item ${live ? "now" : done ? "done" : ""}`} key={a.id}>
                  <div>
                    <div className="tl-time"><Time12 t={a.c.start} /></div>
                    <div className="tl-title">{a.c.subject.name}</div>
                    <div className="tl-sub">{a.c.subject.room ? `Room ${a.c.subject.room}` : "Class"}</div>
                  </div>
                  {live ? <span className="now-pill">Now</span> : done && st ? <span className={`ag-tag ${st.toLowerCase()}`}>{st}</span> : null}
                </div>
              );
            }
            return (
              <label className={`tl-item task ${a.k.done ? "done" : ""}`} key={a.id}>
                <div>
                  <div className="tl-time"><Time12 t={a.k.time} /></div>
                  <div className="tl-title">{a.k.title}</div>
                  <div className="tl-sub">Reminder</div>
                </div>
                <input type="checkbox" checked={a.k.done} onChange={() => flip(a.k)} />
              </label>
            );
          })}
        </div>
      </section>

      <section className="card tasks-card">
        <div className="ch">
          <span className="ci teal"><I.Tasks width="18" height="18" /></span>Upcoming Tasks
          <button className="view-all" onClick={() => go("Tasks")}>View all <I.Arrow width="14" height="14" /></button>
        </div>
        {upcoming.length === 0 && (
          <Empty compact art="check" title="No upcoming tasks" text="Add one in the Calendar." actionLabel="Add a reminder" onAction={() => go("Calendar")} />
        )}
        {upcoming.map((k) => (
          <label className="ut" key={k.id}>
            <input type="checkbox" className={urgency(k)} checked={false} onChange={() => flip(k)} />
            <span>
              <b>{k.title}</b>
              <small className={k.date < date ? "over" : ""}>{k.date < date ? "Overdue" : "Due"} {dayLabel(k.date)} • <Time12 t={k.time} /></small>
            </span>
          </label>
        ))}
      </section>

      <section className="card week-card">
        <div className="ch">
          <span className="ci red"><I.Calendar width="18" height="18" /></span>Weekly Schedule
          <button className="view-all" onClick={() => go("Schedule")}>View full schedule <I.Arrow width="14" height="14" /></button>
        </div>
        <div className="wk-tabs">
          {weekDays.map((w, i) => (
            <button key={w.name} className={`${i === selIdx ? "on" : ""} ${i === todayIdx ? "today" : ""}`} onClick={() => setSelIdx(i)}>
              <b>{w.label}</b><small>{w.date}</small>
            </button>
          ))}
        </div>
        {selClasses.length === 0 ? <div className="muted">No classes on {weekDays[selIdx].name}.</div> : (
          <div className="wk-grid">
            {selClasses.map((c, i) => (
              <div className={`cls c${i % 4}`} key={c.id}>
                <small><Time12 t={c.start} /> – <Time12 t={c.end} /></small>
                <b>{c.subject.name}</b>
                <small>{c.subject.room ? `Room ${c.subject.room}` : "Class"}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="stats-col">
        <section className="card">
          <div className="ch"><span className="ci amber"><I.Insights width="18" height="18" /></span>Quick Stats</div>
          <div className="qs">
            <div><b>{classes.filter(validClass).length}</b><small>Total classes</small></div>
            <div><b>{todays.length}</b><small>Today</small></div>
            <div><b>{open.length}</b><small>Open tasks</small></div>
            <div><b>{subjects.length}</b><small>Subjects</small></div>
          </div>
        </section>
        <section className="card stay">
          <img src="/favicon.svg" alt="" />
          <div><b>{boost.title}</b><small>{boost.text}</small></div>
        </section>
      </div>

      {needs && <ReasonModal key={needs.key} rec={needs} onSave={(v) => h.save(needs, v)} onSkip={() => h.skip(needs)} />}
    </div>
  );
}
