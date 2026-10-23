import { useEffect, useState } from "react";

// Local data is always the source of truth. When a Google account is signed in,
// each saved list is mirrored to Firestore and changes from other devices arrive live.

export const KEYS = ["subjects", "classes", "attendance", "tasks", "profile", "settings"];
const TS = "esched_ts";
const LINKED = "esched_linked_uid";
const env = import.meta.env;
export const syncEnabled = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_AUTH_DOMAIN && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);

let fb = null, au = null, fs = null;
let user = null;
let inited = false;
let unsubs = [];
const lastSeen = {};
const timers = {};

const device = (() => {
  try {
    let d = localStorage.getItem("esched_device");
    if (!d) { d = Math.random().toString(36).slice(2); localStorage.setItem("esched_device", d); }
    return d;
  } catch { return "x"; }
})();

// ---------- tiny store so React can show status ----------
let state = { enabled: syncEnabled, ready: false, user: null, status: syncEnabled ? "signed-out" : "off", last: null, conflict: null };
const subs = new Set();
function set(p) { state = { ...state, ...p }; subs.forEach((f) => f(state)); }
export function useSync() {
  const [s, setS] = useState(state);
  useEffect(() => { subs.add(setS); setS(state); return () => subs.delete(setS); }, []);
  return s;
}

// ---------- helpers ----------
const readTs = () => { try { return JSON.parse(localStorage.getItem(TS)) || {}; } catch { return {}; } };
const setTs = (k, v) => { try { const t = readTs(); t[k] = v; localStorage.setItem(TS, JSON.stringify(t)); } catch { /* ignore */ } };
const readLocal = (k) => { try { const v = localStorage.getItem(k); return v === null ? undefined : JSON.parse(v); } catch { return undefined; } };
const ref = (k) => fs.doc(fb.db, "users", user.uid, "data", k);

function meaningful(k, v) {
  if (Array.isArray(v)) return v.length > 0;
  if (!v || typeof v !== "object") return false;
  if (k === "attendance") return Object.keys(v).length > 0;
  if (k === "profile") return Boolean((v.name || "").trim() || (v.studentId || "").trim());
  return false; // settings alone never counts
}

export function registerInitial(key, value) { lastSeen[key] = JSON.stringify(value); }

export function noteLocalChange(key, value) {
  const json = JSON.stringify(value);
  if (lastSeen[key] === json) return;
  lastSeen[key] = json;
  setTs(key, Date.now());
  if (user) schedulePush(key);
}

function schedulePush(key) {
  clearTimeout(timers[key]);
  set({ status: navigator.onLine ? "syncing" : "offline" });
  timers[key] = setTimeout(() => push(key), 800);
}

async function push(key) {
  if (!user) return;
  if (!navigator.onLine) { set({ status: "offline" }); return; }
  try {
    const value = readLocal(key);
    if (value === undefined) return;
    await fs.setDoc(ref(key), { value: JSON.stringify(value), updatedAt: readTs()[key] || Date.now(), device });
    set({ status: "synced", last: Date.now() });
  } catch (e) {
    console.error("sync push failed", e);
    set({ status: "error" });
  }
}

function applyRemote(key, json, ts) {
  let value;
  try { value = JSON.parse(json); } catch { return; }
  lastSeen[key] = JSON.stringify(value);
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  setTs(key, ts);
  window.dispatchEvent(new CustomEvent("esched-remote", { detail: { key, value } }));
}

function mergeValues(k, local, cloud) {
  if (Array.isArray(local) || Array.isArray(cloud)) {
    const l = local || [], c = cloud || [];
    const ids = new Set(l.map((x) => x.id));
    return [...l, ...c.filter((x) => !ids.has(x.id))];
  }
  if (k === "profile") {
    const out = { ...(cloud || {}) };
    Object.entries(local || {}).forEach(([a, b]) => { if (b !== "" && b !== undefined && b !== null) out[a] = b; });
    return out;
  }
  return { ...(cloud || {}), ...(local || {}) };
}

function ask() {
  return new Promise((resolve) => set({ conflict: { resolve: (c) => { set({ conflict: null }); resolve(c); } } }));
}

async function firstLink() {
  const remote = {};
  for (const k of KEYS) {
    const s = await fs.getDoc(ref(k));
    if (s.exists()) { try { remote[k] = { value: JSON.parse(s.data().value), ts: s.data().updatedAt || Date.now() }; } catch { /* skip */ } }
  }
  const hasRemote = KEYS.some((k) => remote[k] && meaningful(k, remote[k].value));
  const hasLocal = KEYS.some((k) => meaningful(k, readLocal(k)));
  let choice = "device";
  if (hasRemote && hasLocal) choice = await ask();
  else if (hasRemote) choice = "cloud";

  for (const k of KEYS) {
    const local = readLocal(k);
    if (choice === "cloud") {
      if (remote[k]) applyRemote(k, JSON.stringify(remote[k].value), remote[k].ts);
    } else if (choice === "merge") {
      const merged = mergeValues(k, local, remote[k] && remote[k].value);
      applyRemote(k, JSON.stringify(merged), Date.now());
      await push(k);
    } else if (local !== undefined) {
      setTs(k, Date.now());
      await push(k);
    }
  }
  try { localStorage.setItem(LINKED, user.uid); } catch { /* ignore */ }
}

async function reconcile() {
  for (const k of KEYS) {
    const s = await fs.getDoc(ref(k));
    const lt = readTs()[k] || 0;
    if (!s.exists()) { if (readLocal(k) !== undefined) await push(k); continue; }
    const rt = s.data().updatedAt || 0;
    if (rt > lt) applyRemote(k, s.data().value, rt);
    else if (lt > rt) await push(k);
  }
}

function listen() {
  unsubs.forEach((u) => u());
  unsubs = KEYS.map((key) =>
    fs.onSnapshot(ref(key), (snap) => {
      if (snap.metadata.hasPendingWrites || !snap.exists()) return;
      const d = snap.data();
      if ((d.updatedAt || 0) > (readTs()[key] || 0)) applyRemote(key, d.value, d.updatedAt);
    }, (e) => console.error("sync listen failed", e))
  );
}

async function startSync(u) {
  user = u;
  set({ user: { uid: u.uid, name: u.displayName || "", email: u.email || "", photo: u.photoURL || "" }, status: "syncing" });
  try {
    if (localStorage.getItem(LINKED) !== u.uid) await firstLink();
    else await reconcile();
    listen();
    set({ status: "synced", last: Date.now() });
  } catch (e) {
    console.error("sync start failed", e);
    set({ status: navigator.onLine ? "error" : "offline" });
  }
}

function stopSync() {
  unsubs.forEach((u) => u());
  unsubs = [];
  Object.values(timers).forEach(clearTimeout);
  user = null;
  set({ user: null, status: syncEnabled ? "signed-out" : "off", conflict: null });
}

async function resync() {
  if (!user) return;
  set({ status: "syncing" });
  try { await reconcile(); set({ status: "synced", last: Date.now() }); }
  catch (e) { console.error(e); set({ status: navigator.onLine ? "error" : "offline" }); }
}

// ---------- public ----------
export async function initSync() {
  if (!syncEnabled || inited) return;
  inited = true;
  try {
    [fb, au, fs] = await Promise.all([import("./firebase"), import("firebase/auth"), import("firebase/firestore")]);
  } catch (e) {
    console.error("could not load sync", e);
    inited = false;
    return;
  }
  set({ ready: true });
  au.onAuthStateChanged(fb.auth, (u) => (u ? startSync(u) : stopSync()));
  window.addEventListener("online", () => { if (user) resync(); });
  window.addEventListener("offline", () => { if (user) set({ status: "offline" }); });
}

export async function signInGoogle() {
  if (!au) throw new Error("not-ready");
  try {
    await au.signInWithPopup(fb.auth, fb.googleProvider);
  } catch (e) {
    const fallback = ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/web-storage-unsupported"];
    if (fallback.includes(e.code)) return au.signInWithRedirect(fb.auth, fb.googleProvider);
    if (["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(e.code)) return;
    throw e;
  }
}

export const signOutUser = () => (au ? au.signOut(fb.auth) : Promise.resolve());
export const syncNow = () => resync();
