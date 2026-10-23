import { useState } from "react";
import { useSync, signInGoogle, signOutUser, syncNow } from "./sync";
import { useI18n } from "./i18n";

const STATUS = {
  synced: "Synced",
  syncing: "Syncing…",
  offline: "Offline. It will sync when you're back online.",
  error: "Sync problem. Tap Sync now to try again.",
};

export default function AccountCard() {
  const { t, locale } = useI18n();
  const s = useSync();
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("");
    try { await signInGoogle(); }
    catch (e) { console.error(e); setMsg(t("Sign-in failed. Check your connection and try again.")); }
  }

  if (!s.enabled)
    return (
      <div className="card chart">
        <strong>{t("Account & sync")}</strong>
        <div className="note">{t("Cloud sync isn't set up yet. Add your Firebase keys to turn it on.")}</div>
      </div>
    );

  return (
    <div className="card chart">
      <strong>{t("Account & sync")}</strong>
      {msg && <div className="msg">{msg}</div>}
      {!s.user ? (
        <>
          <div className="note">{t("Sign in to keep your schedule on every device you use.")}</div>
          <button className="google-btn" disabled={!s.ready} onClick={login}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("Sign in with Google")}
          </button>
        </>
      ) : (
        <>
          <div className="acct">
            {s.user.photo ? <img className="avatar" src={s.user.photo} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{(s.user.name || "?")[0]}</span>}
            <div><b>{s.user.name || t("Signed in")}</b><small>{s.user.email}</small></div>
          </div>
          <div className="note">{t(STATUS[s.status] || "Synced")}</div>
          {s.last && <div className="note">{t("Last sync: {time}", { time: new Date(s.last).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) })}</div>}
          <button onClick={syncNow}>{t("Sync now")}</button>
          <button onClick={signOutUser}>{t("Sign out")}</button>
        </>
      )}
    </div>
  );
}
