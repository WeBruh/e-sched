import { useState } from "react";
import { askPermission, notify } from "./notifications";
import { unlockAudio } from "./sound";
import { downloadICS } from "./calendar";
import { distanceMeters } from "./stats";

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

export default function Settings({ settings, setSettings, classes, subjects, onBack }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch) => setSettings({ ...settings, ...patch });
  const mode = settings.alertMode || "manual";
  const minutes = settings.alertMinutes || 2;
  const located = settings.lat !== null;

  async function toggleNotify() {
    if (settings.notify) return set({ notify: false });
    unlockAudio();
    const p = await askPermission();
    if (p === "granted") set({ notify: true });
    else setMsg(p === "unsupported" ? "This browser doesn't support notifications." : "Notifications are blocked. Allow them in your phone settings.");
  }

  async function setSchool() {
    if (located && !confirm("Replace the saved school location?")) return;
    setBusy(true); setMsg("");
    try {
      const { coords } = await getPosition();
      set({ lat: coords.latitude, lng: coords.longitude });
      setMsg(`School location saved (±${Math.round(coords.accuracy)} m).`);
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <button className="wide" onClick={onBack}>‹ Back</button>
      {msg && <div className="msg">{msg}</div>}

      <div className="card">
        <strong>Alerts</strong>
        <button onClick={toggleNotify}>{settings.notify ? "Reminders: On (tap to turn off)" : "Turn on reminders"}</button>
        <div className="note">When a reminder rings, stop…</div>
        <div className="seg">
          <button className={mode === "manual" ? "on" : ""} onClick={() => set({ alertMode: "manual" })}>Until I dismiss</button>
          <button className={mode === "timed" ? "on" : ""} onClick={() => set({ alertMode: "timed" })}>After a set time</button>
        </div>
        {mode === "timed" && (
          <div className="seg">
            {[1, 2, 5, 10].map((n) => (
              <button key={n} className={minutes === n ? "on" : ""} onClick={() => set({ alertMinutes: n })}>{n} min</button>
            ))}
          </div>
        )}
        <button onClick={() => { unlockAudio(); notify("Math 101 starts in 10 min", "08:00 • Room 204. Check-in is open.", "test"); }}>
          Test sound, vibration and pop-up
        </button>
      </div>

      <div className="card chart">
        <strong>Check-in</strong>
        <div className="note">{located ? "School location is set." : "School location not set."}</div>
        <button disabled={busy} onClick={setSchool}>Set school location to where I am now</button>
        <label>
          Allowed distance (m)
          <input type="number" min="50" value={settings.radius}
            onChange={(e) => set({ radius: Number(e.target.value) || 0 })} />
        </label>
        <label>
          Late after (minutes from start)
          <input type="number" min="0" value={settings.grace}
            onChange={(e) => set({ grace: Number(e.target.value) || 0 })} />
        </label>
      </div>

      <div className="card chart">
        <strong>Calendar</strong>
        <button onClick={() => downloadICS(classes, subjects)}>Add classes to phone calendar</button>
      </div>
    </div>
  );
}