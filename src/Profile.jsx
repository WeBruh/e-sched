import { useState } from "react";
import Modal from "./Modal";
import Settings from "./Settings";
import { LANGS, useT } from "./i18n";
import { I } from "./Icons";
import { cleanProfile, emptyProfile } from "./profileData";
import SchoolYearFields from "./SchoolYearFields";
import { defaultYear, validYear } from "./schoolYear";

export { emptyProfile };

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"]);

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!PHOTO_TYPES.has(file.type)) {
      reject(new Error("Choose a JPG, PNG, GIF, WebP, or BMP image."));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      reject(new Error("Choose an image smaller than 10 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image. Try another file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That image could not be opened."));
      image.onload = () => {
        const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Your browser couldn't process the image."));
          return;
        }
        try {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch {
          reject(new Error("Your browser couldn't process the image."));
        }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function Fields({ f, setF }) {
  const t = useT();
  const [photoError, setPhotoError] = useState("");
  const bind = (k) => ({ value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  async function choosePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    try {
      const photo = await resizePhoto(file);
      setF((current) => ({ ...current, photo }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Your browser couldn't process the image.");
    }
  }
  return (
    <>
      <div className="profile-photo">
        {f.photo
          ? <img className="profile-photo-image" src={f.photo} alt={t("Profile picture")} />
          : <div className="profile-photo-placeholder"><I.Profile width="36" height="36" /></div>}
        <div className="profile-photo-actions">
          <strong>{t("Profile picture")}</strong>
          <small>{t("Stored on this device. Images are resized to save space.")}</small>
          <label className="profile-photo-upload">
            {t(f.photo ? "Change photo" : "Upload photo")}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp" onChange={choosePhoto} />
          </label>
          {f.photo && <button type="button" onClick={() => { setF({ ...f, photo: "" }); setPhotoError(""); }}>{t("Remove photo")}</button>}
          {photoError && <small className="photo-error" role="alert">{t(photoError)}</small>}
        </div>
      </div>
      <div className="fields">
        <label className="field"><span>{t("Full name")} <em>*</em></span><input placeholder={t("Your full name")} {...bind("name")} /></label>
        <label className="field"><span>{t("Student ID")} <em>*</em></span><input placeholder={t("e.g. 2024-00123")} {...bind("studentId")} /></label>
      </div>
    </>
  );
}

export function Welcome({ onSave, lang, onLang }) {
  const t = useT();
  const [f, setF] = useState(emptyProfile);
  const [year, setYear] = useState(() => defaultYear());
  return (
    <Modal locked tone="info" icon="user" title={t("Welcome! Set up your profile")}
      text={t("Your name and student ID are required. They're saved on this device.")}
      cancelLabel={null} confirmLabel={t("Save and continue")}
      confirmDisabled={!(f.name.trim() && f.studentId.trim()) || !!validYear(year.start, year.end)}
      onConfirm={() => onSave(cleanProfile(f), { yearStart: year.start, yearEnd: year.end })}>
      <div className="field-h">{t("Choose your language")}</div>
      <div className="lang-pick">
        {LANGS.map((l) => (
          <button type="button" key={l.id} className={lang === l.id ? "on" : ""} onClick={() => onLang(l.id)}>{l.label}</button>
        ))}
      </div>
      <Fields f={f} setF={setF} />
      <div className="field-h">{t("School year")}</div>
      <div className="fields"><SchoolYearFields start={year.start} end={year.end} onChange={setYear} /></div>
    </Modal>
  );
}

export default function Profile({ profile, setProfile, settings, setSettings, classes, subjects }) {
  const t = useT();
  const [f, setF] = useState({ ...emptyProfile, ...profile });
  const [saved, setSaved] = useState(false);
  const ok = f.name.trim() && f.studentId.trim();
  return (
    <div className="profile-page">
      <div className="card">
        <strong>{t("Your profile")}</strong>
        <Fields f={f} setF={setF} />
        <button className="primary" style={{ marginTop: 14 }} disabled={!ok} onClick={() => { setProfile(cleanProfile(f)); setSaved(true); }}>{t("Save profile")}</button>
      </div>
      <Settings settings={settings} setSettings={setSettings} classes={classes} subjects={subjects} />

      {saved && (
        <Modal tone="success" icon="check" title={t("Profile saved")} text={t("Your details are saved.")}
          confirmLabel={t("Done")} cancelLabel={null} onConfirm={() => setSaved(false)} onCancel={() => setSaved(false)} />
      )}
    </div>
  );
}
