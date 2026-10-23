// Daily boosts with a little humour. Every line is [title, text].
// {n} = streak length, {p} = attendance percent.

const MSG = {
  en: {
    absent: [
      ["Rough one? It happens.", "Even superheroes skip leg day. Catch up on the notes and swing back in tomorrow."],
      ["Missed class?", "Your bed won this round. Rematch tomorrow, and bring snacks."],
      ["It's okay.", "One absence is a plot twist, not the whole story."],
      ["Plot twist.", "You missed one. The comeback arc starts at your next class."],
      ["Breathe.", "Attendance is a marathon, not a sprint. Tomorrow you jog back in."],
    ],
    late: [
      ["Fashionably late.", "Better late than absent. You showed up, and that's the hard part."],
      ["You made it.", "You and your alarm are still negotiating. Tomorrow, try five minutes earlier."],
      ["Late but legendary.", "Main characters always arrive after the intro."],
      ["Still counts.", "Your teacher saw you walk in and thought: respect."],
      ["Plot armor.", "You dodged the absence. Next time, dodge the traffic too."],
    ],
    present: [
      ["On time. Wow.", "Your alarm clock wants to shake your hand."],
      ["Early bird mode.", "You're the reason the morning looks good."],
      ["Check. Mate.", "Attendance secured. Snack earned."],
      ["Legend status.", "Showing up is 80% of the game, and you just played it."],
      ["Smooth.", "Teachers love this one trick: arriving on time."],
      ["Nailed it.", "Your future self just sent a thank-you note."],
    ],
    streak: [
      ["{n} in a row", "Don't break the chain. Your streak is hotter than your phone charger."],
      ["{n} classes straight", "At this rate the classroom will name a chair after you."],
      ["Unstoppable", "{n} in a row. Even your alarm is impressed."],
      ["Streak mode: ON", "{n} classes and counting. Keep the combo going."],
      ["On fire", "{n} in a row. The fire extinguishers are on standby."],
    ],
    high: [
      ["{p}% attendance", "You're built different. Keep it going."],
      ["{p}%, nice.", "That's the kind of number your parents screenshot."],
      ["Top of the class vibes", "{p}% means you actually read the schedule. Rare."],
      ["Certified reliable", "{p}% attendance. Your future boss approves."],
      ["Almost perfect", "{p}%. Perfection is overrated, but you're close."],
    ],
    low: [
      ["You're at {p}%", "Every class you attend moves the number up. Start with the next one."],
      ["Comeback season", "{p}% today, higher tomorrow. The only way from here is up."],
      ["Small steps", "One class at a time. Even snails finish the race."],
      ["Level up", "{p}% is your starting point. Your high score is coming."],
      ["No pressure", "Just show up for the next class. The math will fix itself."],
    ],
    monday: [
      ["Monday mode", "Monday is just Friday in disguise. Be brave."],
      ["Happy Monday?", "Yes, it's a thing. Yes, you can do it."],
    ],
    friday: [
      ["It's Friday!", "One more day and the weekend is yours. Don't blink."],
      ["Friday energy", "Almost there. Your future self is already packing snacks."],
    ],
    morning: [
      ["Good morning", "Today's forecast: 100% chance of you being awesome."],
      ["Rise and shine", "Coffee is optional, showing up is required. Kidding, you've got this."],
      ["New day, new chance", "Your bed is cozy, but the classroom has Wi-Fi."],
      ["Morning!", "Tiny steps today, big grades later."],
      ["Let's go", "Be the reason your teacher smiles today."],
      ["Hello, champion", "Your only job right now: get to class. We believe in you."],
    ],
    later: [
      ["Keep going", "You survived half the day. The other half is easy mode."],
      ["Halftime", "Drink water, stretch, and finish strong."],
      ["Almost there", "Your couch is waiting, but one more win first."],
      ["Evening check", "Whatever happened today, you showed up for yourself."],
      ["Rest up", "Tomorrow gets a fresh start and a fresh you."],
      ["Good job today", "Brain: tired. Heart: proud. Go eat something nice."],
    ],
  },
  tl: {
    absent: [
      ["Mangyayari talaga 'yan.", "Kahit ang mga superhero minsan nagpapahinga. Habulin ang notes at bumalik bukas."],
      ["Lumiban ka ba?", "Panalo ang kama mo ngayon. Rematch bukas, magdala ka ng meryenda."],
      ["Okay lang 'yan.", "Ang isang absent ay plot twist lang, hindi ang buong kuwento."],
      ["Plot twist.", "Lumiban ka ng isa. Magsisimula ang comeback sa susunod mong klase."],
      ["Huminga ka muna.", "Ang pagpasok ay marathon, hindi sprint. Bukas, dahan-dahan kang babalik."],
    ],
    late: [
      ["Late pero fashionable.", "Mas mabuti nang late kaysa absent. Dumating ka, 'yun ang pinakamahirap."],
      ["Nakarating ka rin!", "Nag-uusap pa kayo ng alarm mo. Bukas, subukan mong mas maaga ng limang minuto."],
      ["Late pero alamat.", "Ang bida, laging dumarating pagkatapos ng intro."],
      ["Bilang pa rin 'yan.", "Nakita ka ng teacher mo na pumasok at naisip niya: respeto."],
      ["May plot armor ka.", "Nakaiwas ka sa absent. Sa susunod, iwasan mo rin ang traffic."],
    ],
    present: [
      ["Wow, on time!", "Gusto ka nang kamayan ng alarm clock mo."],
      ["Maagang ibon!", "Ikaw ang dahilan kung bakit maganda ang umaga."],
      ["Check. Mate.", "Attendance secured. Meryenda, nakuha mo na."],
      ["Alamat ka.", "Ang pagpasok ay 80% ng laban, at nanalo ka ngayon."],
      ["Smooth.", "Paboritong trick ng mga teacher: dumating nang maaga."],
      ["Nakuha mo!", "May thank-you note na galing sa future self mo."],
    ],
    streak: [
      ["{n} na sunod-sunod", "Huwag putulin ang chain. Mas mainit pa ang streak mo kaysa sa charger mo."],
      ["{n} klase nang sunod-sunod", "Sa takbo mong 'yan, papangalanan na ang isang upuan sa'yo."],
      ["Hindi mapigilan", "{n} sunod-sunod. Pati alarm mo bilib."],
      ["Streak mode: ON", "{n} klase at tuloy-tuloy. Ituloy ang combo."],
      ["Nag-aapoy!", "{n} sunod-sunod. Naka-standby na ang fire extinguisher."],
    ],
    high: [
      ["{p}% na attendance", "Iba ka talaga. Ituloy mo lang."],
      ["{p}%, ang galing.", "'Yan ang numerong i-s-screenshot ng mga magulang mo."],
      ["Pang-top of the class", "Ibig sabihin ng {p}%, binasa mo talaga ang schedule. Bihira 'yan."],
      ["Maaasahan ka", "{p}% na attendance. Aprub 'yan sa future boss mo."],
      ["Halos perpekto", "{p}%. Overrated ang perpekto, pero malapit ka na."],
    ],
    low: [
      ["Nasa {p}% ka", "Bawat klaseng papasukan mo, tataas ang numero. Simulan sa susunod."],
      ["Comeback season", "{p}% ngayon, mas mataas bukas. Pataas na lang mula rito."],
      ["Dahan-dahan lang", "Isang klase sa isang pagkakataon. Kahit suso, nakakarating sa finish line."],
      ["Level up", "Panimulang puntos mo ang {p}%. Paparating na ang high score mo."],
      ["Walang pressure", "Pumasok ka lang sa susunod na klase. Aayos din ang numero."],
    ],
    monday: [
      ["Lunes mode", "Biyernes lang ang Lunes na naka-disguise. Maging matapang."],
      ["Happy Lunes?", "Oo, puwede 'yan. Oo, kaya mo."],
    ],
    friday: [
      ["Biyernes na!", "Isang araw na lang, sa'yo na ang weekend. Huwag kumurap."],
      ["Energy ng Biyernes", "Malapit na. Nag-iimpake na ng meryenda ang future self mo."],
    ],
    morning: [
      ["Magandang umaga", "Forecast ngayon: 100% na magiging astig ka."],
      ["Gising na!", "Opsyonal ang kape, kailangan ang pagpasok. Biro lang, kaya mo 'yan."],
      ["Bagong araw, bagong pagkakataon", "Maginhawa ang kama mo, pero may Wi-Fi ang classroom."],
      ["Umaga!", "Maliliit na hakbang ngayon, malalaking grado mamaya."],
      ["Tara na", "Maging dahilan ng ngiti ng teacher mo ngayon."],
      ["Hello, champion", "Isa lang ang trabaho mo ngayon: pumasok. Naniniwala kami sa'yo."],
    ],
    later: [
      ["Tuloy lang", "Nalampasan mo na ang kalahati ng araw. Easy mode na ang susunod."],
      ["Halftime", "Uminom ng tubig, mag-unat, at tapusin nang malakas."],
      ["Malapit na", "Naghihintay ang sofa mo, pero isa pang panalo muna."],
      ["Pang-gabing check", "Anuman ang nangyari ngayon, pumasok ka para sa sarili mo."],
      ["Magpahinga ka", "Bukas, bagong simula at bagong ikaw."],
      ["Magaling ngayon", "Utak: pagod. Puso: proud. Kumain ka ng masarap."],
    ],
  },
};

const fill = (s, p) => s.replace(/\{(\w+)\}/g, (_, k) => (p[k] === undefined ? `{${k}}` : p[k]));

// bump changes the line when the student taps "Another one"
export function motivation({ all, rows, todayRecs, now, lang = "en", bump = 0 }) {
  const M = MSG[lang] || MSG.en;
  const day = Math.floor(now.getTime() / 86400000);
  const pick = (cat, params = {}) => {
    const list = M[cat];
    const [title, text] = list[(day * 3 + bump + cat.length) % list.length];
    return { title: fill(title, params), text: fill(text, params) };
  };

  const sorted = rows
    .filter((r) => r.status !== "Excused")
    .sort((a, b) => (b.date + b.cls.start).localeCompare(a.date + a.cls.start));
  let streak = 0;
  for (const r of sorted) {
    if (r.status === "Absent") break;
    streak++;
  }
  const has = (s) => todayRecs.some((r) => r.status === s);
  const p = all.percent;

  if (has("Absent")) return pick("absent");
  if (has("Late")) return pick("late");
  if (has("Present")) return pick("present");
  if (streak >= 5) return pick("streak", { n: streak });
  if (p !== null && p < 80) return pick("low", { p });
  if (p !== null && p >= 90) return pick("high", { p });
  if (now.getDay() === 1) return pick("monday");
  if (now.getDay() === 5) return pick("friday");
  return now.getHours() < 12 ? pick("morning") : pick("later");
}
