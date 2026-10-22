import { useState } from "react";
import Modal from "./Modal";
import { emptyProfile, cleanProfile } from "./profileData";

const clean = cleanProfile;

function Fields({ f, setF }) {
  const bind = (k) => ({ value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const social = (k, label) => (
    <label className="field">
      <span>{label}{(f[k] || "").trim() && <i className="ok">connected</i>}</span>
      <input placeholder="@username or link" {...bind(k)} />
    </label>
  );
  return (
    <div className="fields">
      <label className="field"><span>Full name <em>*</em></span><input placeholder="Your full name" {...bind("name")} /></label>
      <label className="field"><span>Student ID <em>*</em></span><input placeholder="e.g. 2024-00123" {...bind("studentId")} /></label>
      <label className="field"><span>Age</span><input type="number" min="1" max="99" inputMode="numeric" placeholder="Optional" {...bind("age")} /></label>
      <label className="field"><span>Email</span><input type="email" placeholder="Optional" {...bind("email")} /></label>
      <div className="field-h">Connect accounts (optional)</div>
      {social("facebook", "Facebook")}
      {social("instagram", "Instagram")}
      {social("tiktok", "TikTok")}
    </div>
  );
}

export function Welcome({ onSave }) {
  const [f, setF] = useState(emptyProfile);
  return (
    <Modal locked tone="info" icon="user" title="Welcome! Set up your profile"
      text="Your name and student ID are required. Everything stays on this phone."
      cancelLabel={null} confirmLabel="Save and continue"
      confirmDisabled={!(f.name.trim() && f.studentId.trim())} onConfirm={() => onSave(clean(f))}>
      <Fields f={f} setF={setF} />
    </Modal>
  );
}

export default function Profile({ profile, setProfile, onBack }) {
  const [f, setF] = useState({ ...emptyProfile, ...profile });
  const [saved, setSaved] = useState(false);
  const ok = f.name.trim() && f.studentId.trim();
  return (
    <div>
      <button className="wide" onClick={onBack}>‹ Back</button>
      <div className="card">
        <Fields f={f} setF={setF} />
        <button className="primary" style={{ marginTop: 14 }} disabled={!ok} onClick={() => { setProfile(clean(f)); setSaved(true); }}>Save profile</button>
      </div>
      {saved && (
        <Modal tone="success" icon="check" title="Profile saved" text="Your details are stored on this phone."
          confirmLabel="Done" cancelLabel={null} onConfirm={() => setSaved(false)} onCancel={() => setSaved(false)} />
      )}
    </div>
  );
}