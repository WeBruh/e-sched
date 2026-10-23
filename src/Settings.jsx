import { useState } from "react";
import { askPermission, notify } from "./notifications";
import { SOUNDS, playSound, unlockAudio } from "./sound";
import { downloadICS } from "./calendar";
import { getPosition } from "./geo";
import Radio from "./Radio";
import Modal from "./Modal";
import NumberField from "./NumberField";
import AccountCard from "./AccountCard";
import DataCard from "./DataCard";
import { LANGS, useI18n } from "./i18n";

export default function Settings({ settings, setSettings, isDirty, onSave, classes, subjects, onBack }) {
  const { t, lang } = useI18n();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  const [perm, setPerm] = useState("Notification" in window ? Notification.permission : "unsupported");

  const set = (patch) => setSettings((current) => ({ ...current, ...patch }));

  const on = settings.reminders !== false;
  const mode = settings.alertMode || "manual";
  const minutes = settings.alertMinutes || 2;
  const sound = settings.sound || "glass";
  const size = settings.textSize || "l";
  const located = settings.lat !== null;
  const permText = {
    granted: t("allowed"), denied: t("blocked in phone settings"), unsupported: t("not supported here"), default: t("not allowed yet"),
  }[perm];

  async function allow() { unlockAudio(); setPerm(await askPermission()); }
  async function locate() {
    setAsk(false); setBusy(true); setMsg("");
    try {
      const { coords } = await getPosition(t);
      set({ lat: coords.latitude, lng: coords.longitude });
      setMsg(t("School location saved (±{m} m).", { m: Math.round(coords.accuracy) }));
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <button className="wide" onClick={onBack}>‹ {t("Back")}</button>
      {msg && <div className="msg">{msg}</div>}

      <AccountCard />

      <div className="card chart">
        <strong>{t("Language")}</strong>
        <div className="radios">
          {LANGS.map((l) => <Radio key={l.id} name="lang" checked={(settings.lang || lang) === l.id} label={l.label} onChange={() => set({ lang: l.id })} />)}
        </div>
        <strong style={{ display: "block", marginTop: 14 }}>{t("Text size")}</strong>
        <div className="radios">
          {[ ["m", "Normal"], ["l", "Large"], ["xl", "Extra large"] ].map(([id, label]) => (
            <Radio key={id} name="size" checked={size === id} label={t(label)} onChange={() => set({ textSize: id })} />
          ))}
        </div>
      </div>

      <div className="card">
        <strong>{t("Alerts")}</strong>
        <button onClick={() => set({ reminders: !on })}>{on ? t("Alerts are on (tap to turn off)") : t("Alerts are off (tap to turn on)")}</button>
        <div className="note">{t("Phone notifications: {status}", { status: permText })}</div>
        {perm === "default" && <button onClick={allow}>{t("Allow phone notifications")}</button>}

        <div className="note" style={{ marginTop: 12 }}>{t("Alert sound")}</div>
        <div className="radios">
          {SOUNDS.map((s) => (
            <Radio key={s.id} name="snd" checked={sound === s.id} label={s.label}
              onChange={() => { set({ sound: s.id }); unlockAudio(); playSound(s.id); }} />
          ))}
        </div>

        <div className="note" style={{ marginTop: 12 }}>{t("When an alert rings, stop…")}</div>
        <div className="radios">
          <Radio name="mode" checked={mode === "manual"} label={t("Until I dismiss it")} onChange={() => set({ alertMode: "manual" })} />
          <Radio name="mode" checked={mode === "timed"} label={t("After a set time")} onChange={() => set({ alertMode: "timed" })} />
        </div>
        {mode === "timed" && (
          <div className="radios sub">
            {[1, 2, 5, 10].map((n) => (
              <Radio key={n} name="mins" checked={minutes === n} label={n === 1 ? t("{n} minute", { n }) : t("{n} minutes", { n })} onChange={() => set({ alertMinutes: n })} />
            ))}
          </div>
        )}
        <button onClick={() => { unlockAudio(); notify(t("Test alert"), t("Sound and vibration are working."), "test"); }}>{t("Test sound, vibration and pop-up")}</button>
      </div>

      <div className="card chart">
        <strong>{t("Check-in")}</strong>
        <div className="note">{located ? t("School location is set.") : t("School location not set.")}</div>
        <button disabled={busy} onClick={() => (located ? setAsk(true) : locate())}>{t("Set school location to where I am now")}</button>
        <label>{t("Allowed distance (m)")}
          <NumberField value={settings.radius} min={50} onCommit={(n) => set({ radius: n })} />
        </label>
        <label>{t("Late after (minutes from start)")}
          <NumberField value={settings.grace} min={0} onCommit={(n) => set({ grace: n })} />
        </label>
      </div>

      <div className="card chart">
        <strong>{t("Calendar")}</strong>
        <button onClick={() => downloadICS(classes, subjects, t)}>{t("Add classes to phone calendar")}</button>
      </div>

      <DataCard />

      <div className="card" style={{ marginTop: 14, padding: 14 }}>
        <button className="primary" disabled={!isDirty} onClick={onSave}>{t("Save changes")}</button>
      </div>

      {ask && (
        <Modal tone="info" icon="info" title={t("Replace school location?")} text={t("Check-in will use where you are right now.")}
          confirmLabel={t("Replace")} onConfirm={locate} onCancel={() => setAsk(false)} />
      )}
    </div>
  );
}
