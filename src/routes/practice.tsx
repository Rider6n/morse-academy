import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MORSE, prettyCode } from "@/lib/morse";
import { playFeedback, playMorse } from "@/lib/audio";
import { progressActions, useHydratedProgress } from "@/lib/progress";

export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "Practice — Morse Academy" }] }),
  component: Practice,
});

function pickQuestion(weak: string[]) {
  // Adaptive: 60% chance pick a weak letter if available
  const pool = MORSE;
  if (weak.length && Math.random() < 0.6) {
    const w = weak[Math.floor(Math.random() * weak.length)];
    const m = pool.find((x) => x.char === w);
    if (m) return buildQ(m, pool);
  }
  const m = pool[Math.floor(Math.random() * pool.length)];
  return buildQ(m, pool);
}

function buildQ(answer: (typeof MORSE)[number], pool: typeof MORSE) {
  const choices = new Set<string>([answer.char]);
  while (choices.size < 6) {
    choices.add(pool[Math.floor(Math.random() * pool.length)].char);
  }
  const arr = Array.from(choices).sort(() => Math.random() - 0.5);
  return { answer, choices: arr };
}

function Practice() {
  const { progress } = useHydratedProgress();
  const weak = useMemo(
    () => Object.entries(progress.mistakes).sort((a, b) => b[1] - a[1]).map(([c]) => c),
    [progress.mistakes],
  );
  const [q, setQ] = useState(() => pickQuestion([]));
  const [pick, setPick] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // play on new question
    const t = setTimeout(() => playMorse(q.answer.code), 300);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (c: string) => {
    if (pick) return;
    setPick(c);
    const correct = c === q.answer.char;
    playFeedback(correct ? "correct" : "wrong");
    progressActions.recordAnswer(q.answer.char, correct, 10);
    setStreak((s) => (correct ? s + 1 : 0));
    setTimeout(() => {
      setPick(null);
      setQ(pickQuestion(weak));
    }, 900);
  };

  return (
    <div className="flex min-h-[80vh] flex-col px-5 pt-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
          <span className="text-primary">🔥</span>
          <span className="text-xs font-bold text-primary">{progress.streak}d</span>
        </div>
        <div className="rounded-full bg-accent/10 px-3 py-1.5">
          <span className="text-xs font-bold text-accent">{progress.xp.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Identify Signal
        </p>
        <button
          onClick={() => playMorse(q.answer.code)}
          className="grid h-32 place-items-center rounded-3xl border-2 border-foreground/10 bg-surface px-10"
          aria-label="Replay"
        >
          <p className="font-mono text-4xl font-extrabold tracking-[0.4em]">
            {prettyCode(q.answer.code)}
          </p>
          <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ▶ tap to replay
          </span>
        </button>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Combo: <span className="font-bold text-foreground">{streak}</span>
        </div>
      </div>

      <div className="mt-auto rounded-t-[2rem] border-t-2 border-foreground/10 bg-surface p-6">
        <div className="grid grid-cols-3 gap-2">
          {q.choices.map((c) => {
            const state =
              pick == null
                ? "idle"
                : c === q.answer.char
                  ? "correct"
                  : c === pick
                    ? "wrong"
                    : "idle";
            return (
              <button
                key={c}
                onClick={() => submit(c)}
                className={`h-16 rounded-xl text-xl font-extrabold transition active:scale-95 ${
                  state === "correct"
                    ? "bg-accent text-accent-foreground"
                    : state === "wrong"
                      ? "bg-destructive text-destructive-foreground"
                      : "border-2 border-foreground/10 bg-muted"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
