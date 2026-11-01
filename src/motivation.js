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


// Playful teasing (about habits only). Shown first when Roast mode is on.
const ROAST = {
  en: {
    absent: [
      ["Attendance: 0. Netflix: 1.", "You skipped class. The class didn't skip you. It's still there, judging your empty chair."],
      ["Bold move.", "Your bed has a better attendance record than you today."],
      ["Ghost mode: ON", "Your seat is so used to you being gone, it filed a missing-person report."],
      ["Wow, a vanishing act.", "Houdini would be proud. Your teacher, not so much."],
      ["Nap champion.", "You won the sleep. Now go win back the notes."],
    ],
    late: [
      ["Oh, so now you show up?", "Your alarm clock has filed a formal complaint."],
      ["Late again?", "The clock isn't broken. You're just running on island time."],
      ["Speedrun failed.", "You were so close to being on time. 'Close' is the key word."],
      ["Traffic or snooze?", "Be honest. The snooze button is not a personality trait."],
      ["Grand entrance.", "Everyone looked up when you walked in. Not in a good way."],
    ],
    present: [
      ["Who are you?", "On time? What did you do with the real you?"],
      ["Look at you.", "Showing up on time like it's normal. Show-off."],
      ["Plot twist.", "The snooze button just lost. Fatality."],
      ["Suspiciously punctual.", "Your teacher is checking if you're feeling okay."],
      ["Wow, you exist.", "Attendance awarded. Don't let it go to your head."],
    ],
    streak: [
      ["{n} in a row", "Okay, who replaced you with a responsible person?"],
      ["{n} straight", "Your streak lasts longer than your phone battery. Keep going."],
      ["{n} classes", "Show-off. Leave some attendance for the rest of us."],
      ["Unbelievable", "{n} in a row. Are you secretly a robot?"],
      ["Teacher's pet alert", "{n} in a row. The group chat is going to hear about this."],
    ],
    high: [
      ["{p}%?!", "Okay, nerd. Teach us your ways."],
      ["{p}% attendance", "Your future boss already likes you, and you haven't even applied."],
      ["Suspicious", "{p}%? Did you bribe the schedule?"],
      ["{p}%, rude.", "Making the rest of us look bad. Keep it up."],
      ["Overachiever.", "{p}% and you're still not done? Calm down."],
    ],
    low: [
      ["{p}% attendance", "That's not a score, it's a weather forecast: cloudy with a chance of absences."],
      ["{p}%...", "Your attendance and your phone battery both need charging."],
      ["Hello? Anyone home?", "At {p}%, your seat is considering renting itself out."],
      ["Math time", "{p}% means the class forgot your name. Introduce yourself tomorrow."],
      ["Attendance diet", "{p}% is a crash diet. Time for a healthier habit."],
    ],
    monday: [
      ["Monday again", "Your bed misses you. The class doesn't. Go anyway."],
      ["Monday vibes", "Yes, you're tired. No, the class won't take a nap for you."],
    ],
    friday: [
      ["It's Friday", "Your brain checked out at 7 AM. Drag the body to class anyway."],
      ["Friday mode", "Mentally you're on the weekend. Physically you need a classroom chair."],
    ],
    morning: [
      ["Good morning, sleepyhead", "The snooze button is not a career path. Up you get."],
      ["Rise and grind", "Your bed is just a rectangle of lies. Get out of it."],
      ["Wakey wakey", "Class is in session, and so is your destiny. Mostly class."],
      ["Look alive", "Your future is calling. Don't let it go to voicemail."],
      ["Morning, legend", "Yes, you can go back to sleep. No, you shouldn't."],
    ],
    later: [
      ["Still alive?", "Congrats on surviving the day. Your couch is proud of you."],
      ["Procrastination check", "That task won't do itself. Believe me, I asked."],
      ["Halftime roast", "You've scrolled enough. Your phone will survive 10 minutes without you."],
      ["Evening, genius", "Your homework won't do itself, but you could."],
      ["Reminder", "Staring at the ceiling is not a study technique."],
    ],
  },
  tl: {
    absent: [
      ["Attendance: 0. Netflix: 1.", "Lumiban ka sa klase. Hindi ka nilumiban ng klase. Nandoon pa rin, hinuhusgahan ang walang laman mong upuan."],
      ["Matapang na galaw.", "Mas maganda pa ang attendance ng kama mo kaysa sa'yo ngayon."],
      ["Ghost mode: ON", "Sanay na ang upuan mong wala ka, nag-file na ng missing person report."],
      ["Wow, nawala ka.", "Proud sa'yo si Houdini. Ang teacher mo? Hindi masyado."],
      ["Kampeon sa tulog.", "Nanalo ka sa tulog. Ngayon, habulin mo naman ang notes."],
    ],
    late: [
      ["Ah, ngayon ka lang?", "Nag-file na ng reklamo ang alarm clock mo."],
      ["Late na naman?", "Hindi sira ang orasan, Filipino time lang talaga ang takbo mo."],
      ["Hindi umubra ang speedrun.", "Muntik ka nang on time. Ang susi ay ang salitang 'muntik'."],
      ["Traffic o snooze?", "Magsabi ka ng totoo, hindi personality ang snooze button."],
      ["Grand entrance.", "Lahat tumingin pagpasok mo. Hindi sa magandang paraan."],
    ],
    present: [
      ["Sino ka?", "On time? Anong ginawa mo sa tunay na ikaw?"],
      ["Ayan, oh.", "Dumating nang maaga na parang normal lang. Yabang."],
      ["Plot twist.", "Natalo ang snooze button. Fatality."],
      ["Kahina-hinalang maagap.", "Chine-check na ng teacher kung okay ka lang ba."],
      ["Wow, nag-exist ka.", "Attendance, ibinigay. Huwag mong ipagyabang."],
    ],
    streak: [
      ["{n} na sunod-sunod", "Okay, sino'ng pumalit sa'yo na responsableng tao?"],
      ["{n} nang tuloy-tuloy", "Mas matagal pa ang streak mo kaysa sa battery ng phone mo."],
      ["{n} klase", "Yabang. Mag-iwan ka naman ng attendance para sa amin."],
      ["Hindi kapani-paniwala", "{n} sunod-sunod. Robot ka ba?"],
      ["Alert: paborito ng teacher", "{n} sunod-sunod. Malalaman 'to ng group chat."],
    ],
    high: [
      ["{p}%?!", "Okay, nerd. Turuan mo naman kami."],
      ["{p}% na attendance", "Gusto ka na ng future boss mo kahit hindi ka pa nag-a-apply."],
      ["Kahina-hinala", "{p}%? Sinuhulan mo ba ang schedule?"],
      ["{p}%, bastos.", "Pinapahiya mo kaming lahat. Ituloy mo lang."],
      ["Overachiever.", "{p}% at hindi ka pa tapos? Kalma lang."],
    ],
    low: [
      ["{p}% na attendance", "Hindi 'yan score, weather forecast 'yan: maulap na may tsansa ng absent."],
      ["{p}%...", "Parehong kailangang i-charge ang attendance at battery mo."],
      ["Hello? May tao ba?", "Sa {p}%, iniisip na ng upuan mong magpa-rent."],
      ["Oras ng math", "Ibig sabihin ng {p}%, nakalimutan na ng klase ang pangalan mo. Magpakilala ka ulit bukas."],
      ["Attendance diet", "Crash diet ang {p}%. Panahon na para sa mas malusog na gawi."],
    ],
    monday: [
      ["Lunes na naman", "Miss ka ng kama mo. Hindi ka miss ng klase. Pumasok ka pa rin."],
      ["Lunes vibes", "Oo, pagod ka. Hindi, hindi matutulog ang klase para sa'yo."],
    ],
    friday: [
      ["Biyernes na", "Nag-check out na ang utak mo nang 7 AM. Hilahin mo na lang ang katawan sa klase."],
      ["Friday mode", "Sa isip, weekend ka na. Sa katawan, kailangan mo pang umupo sa classroom."],
    ],
    morning: [
      ["Good morning, antukin", "Hindi career ang snooze button. Bangon na."],
      ["Gising na, bida", "Ang kama mo ay parihabang puro kasinungalingan. Umalis ka na diyan."],
      ["Wakey wakey", "Naka-session ang klase, at ang kapalaran mo. Mostly klase."],
      ["Gising ka na", "Tumatawag ang future mo. Huwag mong ipa-voicemail."],
      ["Umaga, alamat", "Oo, puwede kang bumalik sa tulog. Hindi, huwag."],
    ],
    later: [
      ["Buhay ka pa?", "Congrats at nakaligtas ka sa maghapon. Proud sa'yo ang sofa mo."],
      ["Procrastination check", "Hindi gagawin ng gawain ang sarili niya. Tinanong ko na."],
      ["Halftime roast", "Sapat na ang scroll. Mabubuhay ang phone mo nang wala ka ng 10 minuto."],
      ["Gabi na, genius", "Hindi gagawin ng assignment ang sarili niya, pero puwede kang gumawa."],
      ["Paalala", "Hindi study technique ang pagtitig sa kisame."],
    ],
  },
};

const fill = (s, p) => s.replace(/\{(\w+)\}/g, (_, k) => (p[k] === undefined ? `{${k}}` : p[k]));

// bump changes the line when the student taps "Another one"
export function motivation({ all, rows, todayRecs, now, lang = "en", bump = 0, roast = true }) {
  const M = MSG[lang] || MSG.en;
  const day = Math.floor(now.getTime() / 86400000);
  const pick = (cat, params = {}) => {
    const teasing = roast && ROAST[lang] && ROAST[lang][cat];
    const list = teasing ? [...ROAST[lang][cat], ...M[cat]] : M[cat];
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
