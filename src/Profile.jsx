import { useState } from "react";
import Modal from "./Modal";
import { useSync, signInGoogle } from "./sync";
import { LANGS, useT } from "./i18n";

export const emptyProfile = {
  name: "", studentId: "", age: "", email: "", phone: "", birthday: "",
  course: "", yearLevel: "", section: "", bio: "",
  facebook: "", instagram: "", tiktok: "", photo: "",
};
const clean = (f) => ({ ...f, name: f.name.trim(), studentId: f.studentId.trim() });

async function makeProfilePhoto(file) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Choose an image smaller than 12 MB.");
  if (typeof createImageBitmap !== "function") throw new Error("This browser can't process the selected image.");

  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 512 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser can't process the selected image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("The selected image could not be processed.")),
      "image/jpeg",
      0.82
    ));
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The selected image could not be read."));
      reader.onerror = () => reject(new Error("The selected image could not be read."));
      reader.readAsDataURL(blob);
    });
  } finally {
    image.close();
  }
}

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
      <label className="field"><span>{t("Phone number")}</span><input type="tel" placeholder={t("Optional")} {...bind("phone")} /></label>
      <label className="field"><span>{t("Birthday")}</span><input type="date" {...bind("birthday")} /></label>
      <label className="field"><span>{t("Course or program")}</span><input placeholder={t("Optional")} {...bind("course")} /></label>
      <label className="field"><span>{t("Year level")}</span><input placeholder={t("Optional")} {...bind("yearLevel")} /></label>
      <label className="field"><span>{t("Section")}</span><input placeholder={t("Optional")} {...bind("section")} /></label>
      <label className="field"><span>{t("About me")}</span><textarea rows="3" maxLength="300" placeholder={t("Optional")} {...bind("bio")} /></label>
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

export default function Profile({ profile, setProfile, onBack }) {
  const t = useT();
  const [f, setF] = useState({ ...emptyProfile, ...profile });
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const ok = f.name.trim() && f.studentId.trim();
  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError("");
    try {
      const photo = await makeProfilePhoto(file);
      setF((current) => ({ ...current, photo }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : t("Could not use that image."));
    } finally {
      setPhotoBusy(false);
    }
  }
  return (
    <div>
      <button className="wide" onClick={onBack}>‹ {t("Back")}</button>
      <div className="card">
        <div className="profile-photo">
          {f.photo
            ? <img className="profile-photo-image" src={f.photo} alt={t("Profile photo preview")} />
            : <span className="avatar profile-photo-placeholder">{(f.name || "?").trim().charAt(0).toUpperCase()}</span>}
          <div className="profile-photo-actions">
            <strong>{t("Profile photo")}</strong>
            <label className="profile-photo-upload">
              {photoBusy ? t("Preparing photo…") : t("Upload photo")}
              <input type="file" accept="image/*" onChange={uploadPhoto} disabled={photoBusy} />
            </label>
            {f.photo && <button type="button" onClick={() => setF((current) => ({ ...current, photo: "" }))}>{t("Remove photo")}</button>}
            <small>{t("Stored with your profile on this device.")}</small>
          </div>
        </div>
        {photoError && <div className="msg" role="alert">{t(photoError)}</div>}
        <Fields f={f} setF={setF} />
        <button className="primary" style={{ marginTop: 14 }} disabled={!ok} onClick={() => { setProfile(clean(f)); setSaved(true); }}>{t("Save profile")}</button>
      </div>
      {saved && (
        <Modal tone="success" icon="check" title={t("Profile saved")} text={t("Your details are saved.")}
          confirmLabel={t("Done")} cancelLabel={null} onConfirm={() => setSaved(false)} onCancel={() => setSaved(false)} />
      )}
    </div>
  );
}
