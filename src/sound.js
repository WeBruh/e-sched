// Modern notification sounds made with the Web Audio API (no audio files needed).
let ctx, master;
let current = "glass";

export const SOUNDS = [
  { id: "glass", label: "Glass" },
  { id: "pulse", label: "Pulse" },
  { id: "bubble", label: "Bubble" },
  { id: "marimba", label: "Marimba" },
  { id: "beacon", label: "Beacon" },
];

export function unlockAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0.9;
      const comp = ctx.createDynamicsCompressor();
      const echo = ctx.createDelay(0.5);
      echo.delayTime.value = 0.18;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.28;
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      master.connect(comp);
      comp.connect(ctx.destination);
      master.connect(echo);
      echo.connect(feedback);
      feedback.connect(echo);
      echo.connect(wet);
      wet.connect(comp);
    }
  } catch { /* audio not available */ }
}

function tone({ f, t = 0, d = 0.5, type = "sine", g = 0.3, to }) {
  const o = ctx.createOscillator();
  const a = ctx.createGain();
  const s = ctx.currentTime + t;
  o.type = type;
  o.frequency.setValueAtTime(f, s);
  if (to) o.frequency.exponentialRampToValueAtTime(to, s + d * 0.6);
  a.gain.setValueAtTime(0.0001, s);
  a.gain.exponentialRampToValueAtTime(g, s + 0.006);
  a.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(a);
  a.connect(master);
  o.start(s);
  o.stop(s + d + 0.05);
}

const PLAYERS = {
  glass: () => {
    tone({ f: 1319, d: 0.9, g: 0.28 }); tone({ f: 2637, d: 0.5, g: 0.08 });
    tone({ f: 1760, t: 0.14, d: 1.0, g: 0.26 }); tone({ f: 3520, t: 0.14, d: 0.5, g: 0.07 });
  },
  pulse: () => {
    [0, 0.16, 0.32].forEach((t, i) => tone({ f: 660 + i * 110, t, d: 0.22, type: "triangle", g: 0.28 }));
  },
  bubble: () => {
    tone({ f: 420, to: 1100, d: 0.18, g: 0.32 });
    tone({ f: 560, to: 1500, t: 0.22, d: 0.18, g: 0.28 });
  },
  marimba: () => {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      tone({ f, t: i * 0.13, d: 0.45, g: 0.3 });
      tone({ f: f * 4, t: i * 0.13, d: 0.12, g: 0.06 });
    });
  },
  beacon: () => {
    tone({ f: 880, d: 0.55, type: "triangle", g: 0.25 });
    tone({ f: 660, t: 0.28, d: 0.9, type: "triangle", g: 0.25 });
  },
};

export function setSound(id) { if (PLAYERS[id]) current = id; }

export function playSound(id) {
  if (!ctx || !master) return;
  try { PLAYERS[id || current](); } catch { /* ignore */ }
}

export const playChime = () => playSound(current);
