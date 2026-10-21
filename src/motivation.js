const pick = (arr, now) => arr[(now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate()) % arr.length];

export function motivation({ all, rows, todayRecs, now }) {
  const sorted = rows
    .filter((r) => r.status !== "Excused")
    .sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));
  let streak = 0;
  for (const r of sorted) {
    if (r.status === "Absent") break;
    streak++;
  }
  const has = (s) => todayRecs.some((r) => r.status === s);

  if (has("Absent"))
    return {
      title: "Rough one? It happens.",
      text: pick(
        ["Missing a class doesn't define you. Catch up on the notes and show up next time.",
         "Everyone has off days. Tomorrow is a clean slate."], now),
    };
  if (has("Late"))
    return { title: "You showed up.", text: "That's the hard part. Tomorrow, beat the clock." };
  if (has("Present"))
    return {
      title: "On time, verified.",
      text: streak >= 3 ? `Stack a few more days like this. You're at ${streak} classes in a row.` : "Stack a few more days like this.",
    };
  if (streak >= 5)
    return { title: `${streak} classes in a row`, text: "Don't break the chain. Today is another chance to add one." };
  if (all.percent !== null && all.percent >= 90)
    return { title: `${all.percent}% attendance`, text: "You're building a habit that pays off. Keep going." };
  if (all.percent !== null && all.percent < 80)
    return { title: `You're at ${all.percent}%`, text: "One class at a time brings it back up. You've got this." };

  return now.getHours() < 12
    ? { title: "Good morning", text: pick(["A new day, a new chance to show up.", "Small steps today add up by the end of the term."], now) }
    : { title: "Keep going", text: pick(["Whatever happened today, you're still moving forward.", "Rest up. Tomorrow you get another shot."], now) };
}