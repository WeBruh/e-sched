import { useState } from "react";
import Modal from "./Modal";
import { useSync, signInGoogle } from "./sync";
import Settings from "./Settings";
import { LANGS, useT } from "./i18n";

export const emptyProfile = { name: "", studentId: "", age: "", email: "", facebook: "", instagram: "", tiktok: "" };
const clean = (f) => ({ ...f, name: f.name.trim(), studentId: f.studentId.trim() });

function Fields({ f, setF }) {
  const t = useT();
  const bind = (k) => ({ value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const social = (k, label) => (
    <label className="field">
      <span>{label}{(f[k] || "").trim() && <i className="ok">{t("connected")}</i>}</span>
      <input placeholder={t("@username or link")} {...bind(k)} />
    </label>
  );
  return (
    <div className="fields">
      <label className="field"><span>{t("Full name")} <em>*</em></span><input placeholder={t("Your full name")} {...bind("name")} /></label>
      <label className="field"><span>{t("Student ID")} <em>*</em></span><input placeholder={t("e.g. 2024-00123")} {...bind("studentId")} /></label>
      <label className="field"><span>{t("Age")}</span><input type="number" min="1" max="99" inputMode="numeric" placeholder={t("Optional")} {...bind("age")} /></label>
      <label className="field"><span>{t("Email")}</span><input type="email" placeholder={t("Optional")} {...bind("email")} /></label>
      <div className="field-h">{t("Connect accounts (optional)")}</div>
      {social("facebook", "Facebook")}
      {social("instagram", "Instagram")}
      {social("tiktok", "TikTok")}
    </div>
  );
}

export function Welcome({ onSave, lang, onLang }) {
  const t = useT();
  const s = useSync();
  const [f, setF] = useState(emptyProfile);
  return (
    <Modal locked tone="info" icon="user" title={t("Welcome! Set up your profile")}
      text={t("Your name and student ID are required. They're saved on this device, and in your account if you sign in.")}
      cancelLabel={null} confirmLabel={t("Save and continue")}
      confirmDisabled={!(f.name.trim() && f.studentId.trim())} onConfirm={() => onSave(clean(f))}>
      <div className="field-h">{t("Choose your language")}</div>
      <div className="lang-pick">
        {LANGS.map((l) => (
          <button type="button" key={l.id} className={lang === l.id ? "on" : ""} onClick={() => onLang(l.id)}>{l.label}</button>
        ))}
      </div>
      {s.enabled && (
        <button type="button" className="google-btn" disabled={!s.ready} onClick={() => signInGoogle().catch(console.error)}>
          {t("Already have an account? Sign in with Google")}
        </button>
      )}
      <Fields f={f} setF={setF} />
    </Modal>
  );
}

export default function Profile({ profile, setProfile, settings, setSettings, classes, subjects }) {
  const t = useT();
  const [f, setF] = useState({ ...emptyProfile, ...profile });
  const [saved, setSaved] = useState(false);
  const ok = f.name.trim() && f.studentId.trim();
  return (
    <div>
      <div className="card">
        <strong>{t("Your profile")}</strong>
        <Fields f={f} setF={setF} />
        <button className="primary" style={{ marginTop: 14 }} disabled={!ok} onClick={() => { setProfile(clean(f)); setSaved(true); }}>{t("Save profile")}</button>
      </div>
      <Settings settings={settings} setSettings={setSettings} classes={classes} subjects={subjects} />

      {saved && (
        <Modal tone="success" icon="check" title={t("Profile saved")} text={t("Your details are saved.")}
          confirmLabel={t("Done")} cancelLabel={null} onConfirm={() => setSaved(false)} onCancel={() => setSaved(false)} />
      )}
    </div>
  );
}
