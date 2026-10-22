import { useState } from "react";
import { downloadBackup, firstUse, lastBackup } from "./backupFile";

const DAY = 86400000;

export default function BackupNudge({ hasData }) {
  const [snooze, setSnooze] = useState(() => Number(localStorage.getItem("esched_nudge_snooze")) || 0);
  const [done, setDone] = useState(false);
  const last = lastBackup();
  const now = Date.now();
  const due = hasData && !done && now > snooze && now - firstUse() > 2 * DAY && (!last || now - last > 7 * DAY);
  if (!due) return null;

  return (
    <div className="card nudge">
      <b>Back up your data</b>
      <small>
        {last ? "It's been over a week since your last backup." : "You haven't saved a backup yet."} Keep a copy in case you change phones or clear browser data.
      </small>
      <div className="actions">
        <button className="primary" onClick={() => { downloadBackup(); setDone(true); }}>Save backup</button>
        <button onClick={() => { const t = Date.now() + 3 * DAY; localStorage.setItem("esched_nudge_snooze", String(t)); setSnooze(t); }}>Later</button>
      </div>
    </div>
  );
}
