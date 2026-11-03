import { useEffect, useState } from "react";
import "./ScreenFlash.css";

// one wave = two repeating humps, so sliding it by half its width loops seamlessly
const WAVE = "M0 30 Q 150 0 300 30 T 600 30 T 900 30 T 1200 30 V80 H0 Z";

// Pictures shown on check-in / check-out (replaces the green flash).
// To add one: put it in public/flash/ and add its path here.
const PICS = ["/flash/pic1.jpg", "/flash/pic2.jpg", "/flash/pic3.jpg", "/flash/pic4.jpg", "/flash/pic5.jpg"];
const PIC_MS = 3700;  // how long the picture flash lasts (3 s fully visible + fade out)
const WAVE_MS = 2900; // red wave flash (missed class / task)

let last = -1;
function pickPic() {
  let i;
  do { i = Math.floor(Math.random() * PICS.length); } while (i === last && PICS.length > 1);
  last = i;
  return PICS[i];
}

export default function ScreenFlash({ enabled }) {
  const [f, setF] = useState(null);

  // load the pictures early so the first flash is instant
  useEffect(() => {
    if (!enabled) return;
    PICS.forEach((src) => { const im = new Image(); im.src = src; });
  }, [enabled]);

  useEffect(() => {
    let timer;
    const on = (e) => {
      if (!enabled) return;
      clearTimeout(timer);
      const pic = e.detail.tone === "green" ? pickPic() : null;
      setF({ ...e.detail, pic, id: Date.now() });
      timer = setTimeout(() => setF(null), pic ? PIC_MS : WAVE_MS);
    };
    window.addEventListener("esched-flash", on);
    return () => { window.removeEventListener("esched-flash", on); clearTimeout(timer); };
  }, [enabled]);

  if (!f) return null;

  if (f.pic) {
    return (
      <div className="pf" key={f.id} role="status">
        <div className="pf-burst" />
        <div className="pf-white" />
        <div className="pf-frame"><img className="pf-img" src={f.pic} alt="" /></div>
        {f.text && <div className="pf-text">{f.text}</div>}
      </div>
    );
  }

  return (
    <div className={`flash ${f.tone}`} key={f.id} role="status">
      <div className="water">
        <svg className="wave w2" viewBox="0 0 1200 80" preserveAspectRatio="none"><path d={WAVE} /></svg>
        <svg className="wave w1" viewBox="0 0 1200 80" preserveAspectRatio="none"><path d={WAVE} /></svg>
      </div>
      <div className="flash-text">{f.text}</div>
    </div>
  );
}
