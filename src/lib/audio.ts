// Web Audio Morse tone player.
let ctx: AudioContext | null = null;
const UNIT_MS = 90; // dot length
const FREQ = 600;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(durationMs: number, startAt: number): number {
  const c = getCtx();
  if (!c) return startAt;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.frequency.value = FREQ;
  osc.type = "sine";
  gain.gain.value = 0;
  osc.connect(gain).connect(c.destination);
  const t = c.currentTime + startAt / 1000;
  const d = durationMs / 1000;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.25, t + 0.005);
  gain.gain.setValueAtTime(0.25, t + d - 0.01);
  gain.gain.linearRampToValueAtTime(0, t + d);
  osc.start(t);
  osc.stop(t + d + 0.02);
  return startAt + durationMs;
}

export function playMorse(code: string) {
  const c = getCtx();
  if (!c) return;
  let cursor = 0;
  for (const sym of code) {
    if (sym === ".") cursor = beep(UNIT_MS, cursor) + UNIT_MS;
    else if (sym === "-") cursor = beep(UNIT_MS * 3, cursor) + UNIT_MS;
    else if (sym === " ") cursor += UNIT_MS * 3;
    else if (sym === "/") cursor += UNIT_MS * 7;
  }
}

export function playFeedback(type: "correct" | "wrong") {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain).connect(c.destination);
  const t = c.currentTime;
  if (type === "correct") {
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(990, t + 0.15);
  } else {
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.2);
  }
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  osc.start(t);
  osc.stop(t + 0.3);
}
