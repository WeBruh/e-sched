import { useEffect, useState } from "react";
import Modal from "./Modal";
import { downloadBackup, lastBackup, restoreFromText } from "./backupFile";
import { isPersisted, requestPersistence } from "./persist";
import { DATA_VERSION } from "./migrate";
import { useT } from "./i18n";

export default function DataCard() {
  const t = useT();
  const [prot, setProt] = useState(null);
  const [last, setLast] = useState(lastBackup());
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(null);

  useEffect(() => { isPersisted().then(setProt); }, []);

  const ago = (ts) => {
    if (!ts) return t("never");
    const d = Math.floor((Date.now() - ts) / 86400000);
    return d <= 0 ? t("today") : d === 1 ? t("yesterday") : t("{n} days ago", { n: d });
  };

  async function protect() {
    const ok = await requestPersistence();
    setProt(ok);
    if (!ok) setMsg(t("Your browser didn't grant it yet. Install the app to your home screen and try again."));
  }
  function save() {
    downloadBackup();
    setLast(lastBackup());
    setMsg(t("Backup saved to your Downloads folder."));
  }
  function pick(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPending(String(r.result));
    r.readAsText(f);
  }
  function restore() {
    try {
      restoreFromText(pending);
      window.location.reload();
    } catch (e) {
      setPending(null);
      setMsg(t(e.message));
    }
  }

  return (
    <div className="card chart">
      <strong>{t("Your data")}</strong>
      {msg && <div className="msg">{msg}</div>}
      <div className="note">
        {prot === null ? t("Checking…") : prot ? `● ${t("Protected from automatic cleanup")}` : `○ ${t("Not guaranteed yet")}`}
      </div>
      {prot === false && <button onClick={protect}>{t("Protect my data")}</button>}
      <div className="note">{t("Last backup: {when}", { when: ago(last) })}</div>
      <div className="note">{t("Data version {v}. Updates keep your data.", { v: DATA_VERSION })}</div>
      <button className="primary" onClick={save}>{t("Save backup file")}</button>
      <label className="file-btn">
        {t("Restore from backup file")}
        <input type="file" accept="application/json,.json" onChange={pick} hidden />
      </label>

      {pending && (
        <Modal tone="info" icon="info" title={t("Restore this backup?")}
          text={t("This replaces the data on this phone with the data in the file.")}
          confirmLabel={t("Restore")} onConfirm={restore} onCancel={() => setPending(null)} />
      )}
    </div>
  );
}
