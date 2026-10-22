export default function reasonHandlers(setAttendance) {
  return {
    save: (rec, { reason, detail, excused }) =>
      setAttendance((prev) => {
        const old = prev[rec.key] || {};
        return {
          ...prev,
          [rec.key]: {
            ...old, reason, detail, skipped: false,
            note: [reason, detail].filter(Boolean).join(" — "),
            status: old.status === "Absent" && excused ? "Excused" : old.status,
          },
        };
      }),
    skip: (rec) => setAttendance((prev) => ({ ...prev, [rec.key]: { ...prev[rec.key], skipped: true } })),
  };
}
