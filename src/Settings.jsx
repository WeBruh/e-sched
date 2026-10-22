import { useState } from "react";
import { askPermission, notify } from "./notifications";
import { unlockAudio } from "./sound";
import { downloadICS } from "./calendar";
import Radio from "./Radio";
import Modal from "./Modal";
import DataCard from "./DataCard";
import NumberField from "./NumberField";

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
  const [ask, setAsk] = useState(false);
  const [perm, setPerm] = useState("Notification" in window ? Notification.permission : "unsupported");
  const set = (patch) => setSettings({ ...settings, ...patch });
  const on = settings.reminders !== false;
  const mode = settings.alertMode || "manual";
  const minutes = settings.alertMinutes || 2;
  const located = settings.lat !== null;
  const permText = { granted: "allowed", denied: "blocked in phone settings", unsupported: "not supported here", default: "not allowed yet" }[perm];

  async function allow() { unlockAudio(); setPerm(await askPermission()); }
  async function locate() {
    setAsk(false); setBusy(true); setMsg("");
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
        <button onClick={() => set({ reminders: !on })}>{on ? "Alerts are on (tap to turn off)" : "Alerts are off (tap to turn on)"}</button>
        <div className="note">Phone notifications: {permText}</div>
        {perm === "default" && <button onClick={allow}>Allow phone notifications</button>}
        <div className="note" style={{ marginTop: 12 }}>When an alert rings, stop…</div>
        <div className="radios">
          <Radio name="mode" checked={mode === "manual"} label="Until I dismiss it" onChange={() => set({ alertMode: "manual" })} />
          <Radio name="mode" checked={mode === "timed"} label="After a set time" onChange={() => set({ alertMode: "timed" })} />
        </div>
        {mode === "timed" && (
          <div className="radios sub">
            {[1, 2, 5, 10].map((n) => (
              <Radio key={n} name="mins" checked={minutes === n} label={`${n} minute${n > 1 ? "s" : ""}`} onChange={() => set({ alertMinutes: n })} />
            ))}
          </div>
        )}
        <button onClick={() => { unlockAudio(); notify("Test alert", "Sound and vibration are working.", "test"); }}>Test sound, vibration and pop-up</button>
      </div>

      <div className="card chart">
        <strong>Check-in</strong>
        <div className="note">{located ? "School location is set." : "School location not set."}</div>
        <button disabled={busy} onClick={() => (located ? setAsk(true) : locate())}>Set school location to where I am now</button>
        <label>Allowed distance (m)
          <NumberField value={settings.radius} min={50} onCommit={(n) => set({ radius: n })} />
        </label>
        <label>Late after (minutes from start)
          <NumberField value={settings.grace} min={0} onCommit={(n) => set({ grace: n })} />
        </label>
      </div>

      <div className="card chart">
        <strong>Calendar</strong>
        <button onClick={() => downloadICS(classes, subjects)}>Add classes to phone calendar</button>
      </div>

      <DataCard />

      {ask && (
        <Modal tone="info" icon="info" title="Replace school location?" text="Check-in will use where you are right now."
          confirmLabel="Replace" onConfirm={locate} onCancel={() => setAsk(false)} />
      )}
    </div>
  );
}