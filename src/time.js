const pad = (n) => String(n).padStart(2, "0");

// "13:05" -> { hour: 1, minute: 5, ap: "PM" }
export function to12(t) {
  const [h, m] = (t || "08:00").split(":").map(Number);
  return { hour: h % 12 || 12, minute: m, ap: h >= 12 ? "PM" : "AM" };
}

// (1, 5, "PM") -> "13:05"
export function to24(hour, minute, ap) {
  let h = hour % 12;
  if (ap === "PM") h += 12;
  return `${pad(h)}:${pad(minute)}`;
}

export function fmt12(t) {
  const { hour, minute, ap } = to12(t);
  return `${hour}:${pad(minute)} ${ap}`;
}
