const pad = (n) => String(n).padStart(2, "0");

export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function toDate(dateStr, time) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi, 0);
}

export function fmtCountdown(ms) {
  const s = Math.floor(Math.max(ms, 0) / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export function weekStart(d) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}

export function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function summarize(rows) {
  const n = (s) => rows.filter((r) => r.status === s).length;
  const present = n("Present"), late = n("Late"), absent = n("Absent"), excused = n("Excused");
  const counted = present + late + absent;
  return { present, late, absent, excused, percent: counted ? Math.round(((present + late) / counted) * 100) : null };
}

export function buildRows(attendance, classes, subjects) {
  return Object.entries(attendance)
    .map(([key, r]) => {
      const cls = classes.find((c) => c.id === r.classId);
      const subject = cls && subjects.find((s) => s.id === cls.subjectId);
      return cls && subject ? { ...r, key, cls, subject } : null;
    })
    .filter((r) => r && r.status && r.status !== "Pending");
}

const mins = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const minutesBetween = (a, b) => mins(b) - mins(a);
export const fmtHM = (m) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;