const CODE = { Monday: "MO", Tuesday: "TU", Wednesday: "WE", Thursday: "TH", Friday: "FR", Saturday: "SA", Sunday: "SU" };
const IDX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const pad = (n) => String(n).padStart(2, "0");

export function downloadICS(classes, subjects) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//E-Sched//EN"];
  classes.forEach((c) => {
    const s = subjects.find((x) => x.id === c.subjectId);
    if (!s) return;
    const first = new Date();
    first.setDate(first.getDate() + ((IDX[c.day] - first.getDay() + 7) % 7));
    const d = `${first.getFullYear()}${pad(first.getMonth() + 1)}${pad(first.getDate())}`;
    const t = (x) => x.replace(":", "") + "00";
    lines.push(
      "BEGIN:VEVENT", `UID:${c.id}@e-sched`, `DTSTAMP:${stamp}`,
      `DTSTART:${d}T${t(c.start)}`, `DTEND:${d}T${t(c.end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${CODE[c.day]}`,
      `SUMMARY:${s.name}`, `LOCATION:${s.room ? "Room " + s.room : ""}`,
      "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY",
      `DESCRIPTION:${s.name} starts in 10 minutes`, "END:VALARM", "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "e-sched-classes.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTasksICS(tasks) {
  const esc = (s) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, " ");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//E-Sched//EN"];
  tasks.filter((k) => !k.done).forEach((k) => {
    const mins = Number(k.time.slice(0, 2)) * 60 + Number(k.time.slice(3, 5));
    lines.push(
      "BEGIN:VEVENT", `UID:task${k.id}@e-sched`, `DTSTAMP:${stamp}`,
      `DTSTART:${k.date.replace(/-/g, "")}T${k.time.replace(":", "")}00`, "DURATION:PT30M",
      `SUMMARY:${esc(k.title)}`,
      "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", `DESCRIPTION:${esc(k.title)}`, "END:VALARM"
    );
    if (k.evening)
      lines.push("BEGIN:VALARM", `TRIGGER:-PT${240 + mins}M`, "ACTION:DISPLAY", `DESCRIPTION:Tomorrow: ${esc(k.title)}`, "END:VALARM");
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "e-sched-reminders.ics";
  a.click();
  URL.revokeObjectURL(url);
}