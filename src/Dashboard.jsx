import { useEffect, useState } from "react";
import useNow from "./useNow";
import { Line, Donut, Bars, Gauge } from "./Charts";
import { isoDate, toDate, fmtCountdown, distanceMeters, summarize, weekStart } from "./stats";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS = DAY_NAMES.slice(1).concat([]).slice(0, 6);
const MIN = 60000;
const OPEN_BEFORE = 15 * MIN; // check-in opens 15 min before class
const OUT_AFTER = 30 * MIN;   // check-out allowed until 30 min after class

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

  // Classes that ended with no check-in become Absent automatically
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

  function save(c, changes) {
    setAttendance((prev) => {
      const old = prev[keyOf(c)] || {};
      return {
        ...prev,
        [keyOf(c)]: { classId: c.id, date, ...old, status: old.status || "Pending", ...changes },
      };
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
        {canExcuse && <button disabled={busy} onClick={() => excuse(c)}>Mark excused</button>}
      </div>
    );
  }

  function statusLine(c) {
    const r = recOf(c);
    const st = r.status || "Pending";
    return (
      <div>
        <span className={`pill ${st.toLowerCase()} tag`}>{st}</span>
        {r.verified && <span className="verified"> ✓ verified</span>}
        {r.checkIn && (
          <div className="note">
            In {fmtTime(r.checkIn)}{r.checkOut && ` • Out ${fmtTime(r.checkOut)}`}{r.leftEarly && " • left early"}
          </div>
        )}
        {r.note && <div className="note">Note: {r.note}</div>}
      </div>
    );
  }

  // ----- current / next -----
  const focus = todays.find((c) => now < c.endAt);
  const next = todays.find((c) => c !== focus && c.startAt > now);
  const fr = focus ? recOf(focus) : {};
  const lateAt = focus ? new Date(focus.startAt.getTime() + grace) : null;

  // ----- chart data -----
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

  return (
    <div>
      <div className="card focus-card">
        {focus ? (
          <>
            <small>{now >= focus.startAt ? "Current subject" : "Up next"}</small>
            <h3>{focus.subject.name}</h3>
            <div>{focus.start} – {focus.end} {focus.subject.room && `• Room ${focus.subject.room}`}</div>

            <div className="timers">
              {now < focus.startAt && <div><small>Starts in</small><b>{fmtCountdown(focus.startAt - now)}</b></div>}
              <div><small>Ends in</small><b>{fmtCountdown(focus.endAt - now)}</b></div>
              {!fr.checkIn && fr.status !== "Excused" && (
                now < lateAt
                  ? <div className="warn"><small>Late in</small><b>{fmtCountdown(lateAt - now)}</b></div>
                  : <div className="late"><small>Status</small><b>Late</b></div>
              )}
              {next && <div><small>Next: {next.subject.name}</small><b>{fmtCountdown(next.startAt - now)}</b></div>}
            </div>

            {statusLine(focus)}
            {actions(focus)}
          </>
        ) : (
          <p>No more classes today.</p>
        )}
        {msg && <div className="msg">{msg}</div>}
      </div>

      {todays.filter((c) => c !== focus).length > 0 && <h3>Today, {dayName}</h3>}
      {todays.filter((c) => c !== focus).map((c) => (
        <div className="card" key={c.id}>
          <strong>{c.subject.name}</strong>
          <div>{c.start} – {c.end}</div>
          {statusLine(c)}
          {actions(c)}
        </div>
      ))}

      <div className="grid">
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
        <div className="chart-title">Attendance by weekday</div>
        <div className="weekdays">
          {byDay.map((d) => (
            <div key={d.label}><small>{d.label}</small><b>{d.value === null ? "–" : `${d.value}%`}</b></div>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>Check-in settings</strong>
        <div className="note">{located ? "School location is set." : "School location not set."}</div>
        <button disabled={busy} onClick={setSchool}>Set school location to where I am now</button>
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