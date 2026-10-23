import { useState } from "react";
import { downloadBackup, firstUse, lastBackup } from "./backupFile";
import { useSync } from "./sync";
import { useT } from "./i18n";

const DAY = 86400000;

export default function BackupNudge({ hasData }) {
  const t = useT();
  const s = useSync();
  const [snooze, setSnooze] = useState(() => Number(localStorage.getItem("esched_nudge_snooze")) || 0);
  const [done, setDone] = useState(false);
  const last = lastBackup();
  const now = Date.now();
  // signed-in users are already backed up in their account
  const due = hasData && !s.user && !done && now > snooze && now - firstUse() > 2 * DAY && (!last || now - last > 7 * DAY);
  if (!due) return null;

  return (
    <div className="card nudge">
      <b>{t("Back up your data")}</b>
      <small>
        {last ? t("It's been over a week since your last backup.") : t("You haven't saved a backup yet.")} {t("Keep a copy in case you change phones or clear browser data.")}
      </small>
      <div className="actions">
        <button className="primary" onClick={() => { downloadBackup(); setDone(true); }}>{t("Save backup")}</button>
        <button onClick={() => { const n = Date.now() + 3 * DAY; localStorage.setItem("esched_nudge_snooze", String(n)); setSnooze(n); }}>{t("Later")}</button>
      </div>
    </div>
  );
}
