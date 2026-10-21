import { useEffect, useState } from "react";
import useNow from "./useNow";
import { Line, Donut, Bars, Gauge } from "./Charts";
import { isoDate, toDate, fmtCountdown, distanceMeters, summarize, weekStart } from "./stats";
import { askPermission, notify, once } from "./notifications";
import { downloadICS } from "./calendar";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

export default function Dashboard({ subjects, classes, attendance, setAttendance, settings, setSettings }) {
  const now = useNow();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const date = isoDate(now);
  const dayName = DAY_NAMES[now.getDay()];
  const grace = settings.grace * MIN;
  const located = settings.lat !== null;
  const keyOf = (c) => `${c.id}_${date}`;
  const recOf = (c) => attendance[keyOf(c)] || {};

  const todays = classes
    .filter((c) => c.day === dayName && subjects.some((s) => s.id === c.subjectId))
    .map((c) => ({
      ...c,
      subject: subjects.find((s) => s.id === c.subjectId),
      startAt: toDate(date, c.start),
      endAt: toDate(date, c.end),
    }))
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
    if (!settings.notify) return;
    const t = now.getTime();
    const within = (at) => t >= at && t < at + 2 * MIN;
    todays.forEach((c) => {
      const r = recOf(c);
      const s = c.startAt.getTime(), e = c.endAt.getTime();
      const room = c.subject.room ? ` • Room ${c.subject.room}` : "";
      const k = keyOf(c);
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
    if (!located) throw new Error("Set your school location first (bottom of this page).");
    const { coords } = await getPosition();
    if (coords.accuracy > settings.radius)
      throw new Error(`GPS too imprecise (±${Math.round(coords.accuracy)} m). Go near a window and retry.`);
    const dist = distanceMeters(coords.latitude, coords.longitude, settings.lat, settings.lng);
    if (dist > settings.radius)
      throw new Error(`Not at school: about ${Math.round(dist)} m away (limit ${settings.radius} m).`);
    return Math.round(dist);
  }

  async function checkIn(c) {
    setBusy(true); setMsg("");
    try {
      const distance = await verify();
      const at = new Date().getTime();
      if (at < c.startAt.getTime() - OPEN_BEFORE || at >= c.endAt.getTime())
        throw new Error("Check-in is closed for this class.");
      const status = at <= c.startAt.getTime() + grace ? "Present" : "Late";
      save(c, { status, checkIn: new Date(at).toISOString(), verified: true, distance, auto: false });
      navigator.vibrate?.(80);
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
      navigator.vibrate?.(80);
      setMsg(early ? "Checked out (left early)" : "Checked out");
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  function excuse(c) {
    const note = prompt("Reason for excused absence?");
    if (note === null) return;
    save(c, { status: "Excused", note, auto: false });
  }

  async function setSchool() {
    if (located && !confirm("Replace the saved school location?")) return;
    setBusy(true); setMsg("");
    try {
      const { coords } = await getPosition();
      setSettings({ ...settings, lat: coords.latitude, lng: coords.longitude });
      setMsg(`School location saved (±${Math.round(coords.accuracy)} m).`);
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  async function toggleNotify() {
    if (settings.notify) return setSettings({ ...settings, notify: false });
    const p = await askPermission();
    if (p === "granted") {
      setSettings({ ...settings, notify: true });
      notify("Reminders are on", "You'll get alerts before class and before you're marked late.", "test");
    } else {
      setMsg(p === "unsupported" ? "This browser doesn't support notifications." : "Notifications are blocked. Allow them in your phone or browser settings.");
    }
  }

  function actions(c) {
    const r = recOf(c);
    const t = now.getTime();
    const canIn = !r.checkIn && r.status !== "Excused" && t >= c.startAt.getTime() - OPEN_BEFORE && t < c.endAt.getTime();
    const canOut = r.checkIn && !r.checkOut && t < c.endAt.getTime() + OUT_AFTER;
    const canExcuse = !r.checkIn && r.status !== "Excused" && t >= c.startAt.getTime() - OPEN_BEFORE;
    return (
      <div className="actions">
        {canIn && <button className="primary" disabled={busy} onClick={() => checkIn(c)}>Check in</button>}
        {canOut && <button className="primary" disabled={busy} onClick={() => checkOut(c)}>Check out</button>}
        {canExcuse && <button disabled={busy} onClick={() => excuse(c)}>Excused</button>}
      </div>
    );
  }

  function statusLine(c) {
    const r = recOf(c);
    return (
      <div className="note">
        {r.status || "Pending"}
        {r.verified && " • ✓ verified"}
        {r.checkIn && ` • In ${fmtTime(r.checkIn)}`}
        {r.checkOut && ` • Out ${fmtTime(r.checkOut)}`}
        {r.leftEarly && " • left early"}
        {r.note && ` • ${r.note}`}
      </div>
    );
  }

  const focus = todays.find((c) => now < c.endAt);
  const next = todays.find((c) => c !== focus && c.startAt > now);
  const fr = focus ? recOf(focus) : {};
  const lateAt = focus ? new Date(focus.startAt.getTime() + grace) : null;
  const pendingOut = todays.find(
    (c) => c !== focus && recOf(c).checkIn && !recOf(c).checkOut && now.getTime() < c.endAt.getTime() + OUT_AFTER
  );
  const upcoming = todays.filter((c) => c.startAt > now);

  function alertBar() {
    if (!focus || fr.status === "Excused") return null;
    const t = now.getTime();
    const room = focus.subject.room ? `Room ${focus.subject.room}` : "";
    if (fr.checkIn)
      return (
        <div className="alert ok">
          <div><div>Checked in ✓ verified</div><div className="big">{fmtCountdown(focus.endAt - now)}</div></div>
          <div className="side">until class ends</div>
        </div>
      );
    if (t < focus.startAt.getTime() - OPEN_BEFORE)
      return (
        <div className="alert info">
          <div><div>Check-in opens in</div><div className="big">{fmtCountdown(focus.startAt.getTime() - OPEN_BEFORE - t)}</div></div>
          <div className="side">{focus.subject.name}<br />{room}</div>
        </div>
      );
    if (t < lateAt.getTime())
      return (
        <div className="alert warn">
          <div><div>Check in before you're marked late</div><div className="big">{fmtCountdown(lateAt - now)}</div></div>
          <div className="side">{focus.subject.name}<br />{room}</div>
        </div>
      );
    return (
      <div className="alert late">
        <div><div>You're late. Check in now</div><div className="big">{fmtCountdown(now - lateAt)}</div></div>
        <div className="side">{focus.subject.name}<br />{room}</div>
      </div>
    );
  }

  const rows = Object.values(attendance)
    .map((r) => {
      const cls = classes.find((c) => c.id === r.classId);
      const subject = cls && subjects.find((s) => s.id === cls.subjectId);
      return cls && subject ? { ...r, cls, subject } : null;
    })
    .filter((r) => r && r.status && r.status !== "Pending");

  const all = summarize(rows);
  const weeks = [5, 4, 3, 2, 1, 0].map((k) => {
    const start = weekStart(new Date(now.getTime() - k * 7 * 86400000));
    const end = new Date(start.getTime() + 7 * 86400000);
    const inWeek = rows.filter((r) => { const d = toDate(r.date, "00:00"); return d >= start && d < end; });
    return { label: `${start.getMonth() + 1}/${start.getDate()}`, value: summarize(inWeek).percent };
  });
  const perSubject = subjects.map((s) => ({
    id: s.id, label: s.name, ...summarize(rows.filter((r) => r.subject.id === s.id)),
  }));
  const byDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => ({
    label: d.slice(0, 3), value: summarize(rows.filter((r) => r.cls.day === d)).percent,
  }));
  const lowest = perSubject.filter((p) => p.percent !== null).sort((a, b) => a.percent - b.percent)[0];

  return (
    <div>
      {!online && <div className="offline">Offline • everything is saved on this phone</div>}

      {alertBar()}
      {msg && <div className="msg">{msg}</div>}

      <div className="card focus-card">
        {focus ? (
          <>
            <div className="row">
              <div>
                <small>{now >= focus.startAt ? "Current subject" : "Up next"}</small>
                <div className="subj">{focus.subject.name}</div>
                <small>{focus.start} – {focus.end}{focus.subject.room && ` • Room ${focus.subject.room}`}</small>
              </div>
              <div className="right">
                <small>Ends in</small>
                <div className="num">{fmtCountdown(focus.endAt - now)}</div>
              </div>
            </div>
            {fr.checkIn && statusLine(focus)}
            {actions(focus)}
            {next && (
              <div className="nextrow">
                <span>Next: {next.subject.name}, {next.start}</span>
                <b>in {fmtCountdown(next.startAt - now)}</b>
              </div>
            )}
          </>
        ) : (
          <p>No more classes today.</p>
        )}
      </div>

      {pendingOut && (
        <div className="card">
          <strong>Check out of {pendingOut.subject.name}</strong>
          {actions(pendingOut)}
        </div>
      )}

      <div className="kpis">
        <div className="kp pct"><b>{all.percent === null ? "–" : `${all.percent}%`}</b><small>Attendance</small></div>
        <div className="kp abs"><b>{all.absent}</b><small>Absent</small></div>
        <div className="kp lat"><b>{all.late}</b><small>Late</small></div>
        <div className="kp exc"><b>{all.excused}</b><small>Excused</small></div>
      </div>

      {lowest && lowest.percent < TARGET && (
        <div className="warn-chip">
          <b>{lowest.label} is at {lowest.percent}%</b>
          <small>Below the {TARGET}% target. Another absence will hurt.</small>
        </div>
      )}

      {todays.length > 0 && (
        <div className="strip">
          {todays.map((c) => {
            const done = now >= c.endAt;
            const live = now >= c.startAt && !done;
            const label = done ? "Done" : live ? "Now" : c === upcoming[0] ? "Next" : "Later";
            return (
              <div key={c.id} className={`chip ${live ? "on" : ""}`}>
                <small>{label}</small>
                <b>{c.subject.name}</b>
                <small>{c.start}{done && ` • ${recOf(c).status || "Pending"}`}</small>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-head"><span>Insights</span><small>Swipe →</small></div>
      <div className="sw">
        <div className="card chart">
          <div className="chart-title">Weekly attendance %</div>
          <Line data={weeks} />
        </div>
        <div className="card chart">
          <div className="chart-title">Status breakdown</div>
          <Donut
            center={all.percent === null ? "–" : `${all.percent}%`}
            slices={[
              { label: "Present", value: all.present, color: "#3fb8c9" },
              { label: "Late", value: all.late, color: "#8fa8e8" },
              { label: "Absent", value: all.absent, color: "#e23b4e" },
              { label: "Excused", value: all.excused, color: "#f5b3c8" },
            ]}
          />
        </div>
        <div className="card chart">
          <div className="chart-title">Absences by subject</div>
          <Bars data={perSubject.map((p) => ({ label: p.label, value: p.absent }))} />
        </div>
        <div className="card chart">
          <div className="chart-title">Attendance per subject</div>
          <div className="gauges">
            {perSubject.map((p) => (
              <div key={p.id} className={focus && focus.subject.id === p.id ? "g focus" : "g"}>
                <Gauge value={p.percent} />
                <div>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card chart">
          <div className="chart-title">By weekday</div>
          <div className="weekdays">
            {byDay.map((d) => (
              <div key={d.label}><small>{d.label}</small><b>{d.value === null ? "–" : `${d.value}%`}</b></div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <strong>Settings</strong>
        <div className="note">{located ? "School location is set." : "School location not set."}</div>
        <button disabled={busy} onClick={setSchool}>Set school location to where I am now</button>
        <button onClick={toggleNotify}>{settings.notify ? "Turn reminders off" : "Turn on reminders"}</button>
        <button onClick={() => downloadICS(classes, subjects)}>Add classes to phone calendar</button>
        <label>
          Allowed distance (m)
          <input type="number" min="50" value={settings.radius}
            onChange={(e) => setSettings({ ...settings, radius: Number(e.target.value) || 0 })} />
        </label>
        <label>
          Late after (minutes from start)
          <input type="number" min="0" value={settings.grace}
            onChange={(e) => setSettings({ ...settings, grace: Number(e.target.value) || 0 })} />
        </label>
      </div>
    </div>
  );
}