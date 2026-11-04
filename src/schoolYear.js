// Suggested school year dates: June 1 to March 31.
export function defaultYear(now = new Date()) {
  const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return { start: `${year}-06-01`, end: `${year + 1}-03-31` };
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null;
  return timestamp;
}

export function validYear(start, end) {
  const startTime = parseDate(start);
  const endTime = parseDate(end);
  if (startTime === null || endTime === null) return "Pick both dates.";
  if (endTime <= startTime) return "The end date must be after the start date.";
  if ((endTime - startTime) / 86400000 > 430) return "A school year can't be longer than 14 months.";
  return "";
}
