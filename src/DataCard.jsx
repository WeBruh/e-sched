import { useEffect, useState } from "react";
import Modal from "./Modal";
import { downloadBackup, lastBackup, restoreFromText } from "./backupFile";
import { isPersisted, requestPersistence } from "./persist";
import { DATA_VERSION } from "./migrate";

function ago(ts) {
  if (!ts) return "never";
  const d = Math.floor((Date.now() - ts) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

export default function DataCard() {
  const [prot, setProt] = useState(null);
  const [last, setLast] = useState(lastBackup());
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(null);

  useEffect(() => { isPersisted().then(setProt); }, []);

  async function protect() {
    const ok = await requestPersistence();
    setProt(ok);
    if (!ok) setMsg("Your browser didn't grant it yet. Install the app to your home screen and try again.");
  }
  function save() {
    downloadBackup();
    setLast(lastBackup());
    setMsg("Backup saved to your Downloads folder.");
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
      setMsg(e.message);
    }
  }

  return (
    <div className="card chart">
      <strong>Your data</strong>
      {msg && <div className="msg">{msg}</div>}
      <div className="note">
        {prot === null ? "Checking…" : prot ? "● Protected from automatic cleanup" : "○ Not guaranteed yet"}
      </div>
      {prot === false && <button onClick={protect}>Protect my data</button>}
      <div className="note">Last backup: {ago(last)}</div>
      <div className="note">Data version {DATA_VERSION}. Updates keep your data.</div>
      <button className="primary" onClick={save}>Save backup file</button>
      <label className="file-btn">
        Restore from backup file
        <input type="file" accept="application/json,.json" onChange={pick} hidden />
      </label>

      {pending && (
        <Modal tone="info" icon="info" title="Restore this backup?"
          text="This replaces the data on this phone with the data in the file."
          confirmLabel="Restore" onConfirm={restore} onCancel={() => setPending(null)} />
      )}
    </div>
  );
}
