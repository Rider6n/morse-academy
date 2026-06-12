import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MORSE, prettyCode } from "@/lib/morse";
import { playMorse, playFeedback } from "@/lib/audio";
import { progressActions } from "@/lib/progress";

export const Route = createFileRoute("/test")({
  head: () => ({ meta: [{ title: "Certification Test — Morse Academy" }] }),
  component: TestPage,
});

type Q =
  | { kind: "recognize"; code: string; answer: string; choices: string[] }
  | { kind: "decode"; code: string; answer: string };

function buildTest(): Q[] {
  const pool = [...MORSE].sort(() => Math.random() - 0.5).slice(0, 10);
  return pool.map((m, idx) => {
    if (idx % 2 === 0) {
      const choices = new Set<string>([m.char]);
      while (choices.size < 4) {
        choices.add(MORSE[Math.floor(Math.random() * MORSE.length)].char);
      }
      return {
        kind: "recognize",
        code: m.code,
        answer: m.char,
        choices: Array.from(choices).sort(() => Math.random() - 0.5),
      };
    }
    return { kind: "decode", code: m.code, answer: m.char };
  });
}

function TestPage() {
  const [questions] = useState<Q[]>(() => buildTest());
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<{ ok: boolean; char: string }[]>([]);
  const [input, setInput] = useState("");

  const done = i >= questions.length;
  const q = questions[i];
  const score = answers.filter((a) => a.ok).length;

  const submit = (val: string) => {
    if (!q) return;
    const ok = val.trim().toUpperCase() === q.answer;
    playFeedback(ok ? "correct" : "wrong");
    progressActions.recordAnswer(q.answer, ok, 15);
    const next = [...answers, { ok, char: q.answer }];
    setAnswers(next);
    setInput("");
    if (i + 1 >= questions.length) {
      progressActions.setCertificationScore(next.filter((a) => a.ok).length);
    }
    setI(i + 1);
  };

  const breakdown = useMemo(() => {
    const wrong = answers.filter((a) => !a.ok).map((a) => a.char);
    return { wrong };
  }, [answers]);

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const pass = score >= 8;
    return (
      <div className="px-5 pt-4">
        <h1 className="mb-1 text-2xl font-black">Certification Result</h1>
        <p className="mb-5 text-sm text-muted-foreground">10-question final exam</p>
        <div
          className={`rounded-3xl border-2 p-8 text-center shadow-[0_8px_0_0_rgba(0,0,0,0.06)] ${
            pass ? "border-accent bg-accent/10" : "border-foreground bg-surface"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Score</p>
          <p className="text-6xl font-black">{score}/10</p>
          <p className="mt-1 font-mono text-sm font-bold text-muted-foreground">{pct}%</p>
          <p className="mt-4 text-lg font-extrabold">
            {pass ? "🏆 Certified OPERATOR" : "Keep going, OPERATOR."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {pass
              ? "You've demonstrated solid command of Morse fundamentals."
              : "Aim for 8/10. Review weak letters and try again."}
          </p>
        </div>

        {breakdown.wrong.length > 0 && (
          <div className="mt-5 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-destructive">
              Review these
            </p>
            <div className="flex flex-wrap gap-2">
              {breakdown.wrong.map((c, idx) => (
                <span
                  key={`${c}-${idx}`}
                  className="rounded-full bg-destructive/15 px-3 py-1 text-sm font-extrabold text-destructive"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => location.reload()}
          className="mt-6 w-full rounded-2xl bg-foreground py-4 font-bold text-background"
        >
          Take it again
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((i + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          {i + 1}/{questions.length}
        </span>
      </div>

      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {q.kind === "recognize" ? "Recognize" : "Decode"}
      </p>
      <h1 className="mb-5 text-xl font-extrabold">
        {q.kind === "recognize" ? "Which letter is this signal?" : "Type the letter for this signal:"}
      </h1>

      <button
        onClick={() => playMorse(q.code)}
        className="grid w-full place-items-center rounded-3xl border-2 border-foreground bg-surface px-8 py-12 shadow-[0_6px_0_0_rgba(0,0,0,0.06)]"
      >
        <p className="font-mono text-4xl font-extrabold tracking-[0.4em]">{prettyCode(q.code)}</p>
        <span className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ▶ tap to replay
        </span>
      </button>

      {q.kind === "recognize" ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {q.choices.map((c) => (
            <button
              key={c}
              onClick={() => submit(c)}
              className="h-16 rounded-2xl border-2 border-foreground/10 bg-surface text-xl font-extrabold active:scale-95"
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 1))}
            onKeyDown={(e) => e.key === "Enter" && input && submit(input)}
            placeholder="?"
            className="mt-6 w-full rounded-2xl border-2 border-foreground bg-surface px-4 py-6 text-center text-4xl font-black outline-none focus:border-primary"
          />
          <button
            disabled={!input}
            onClick={() => submit(input)}
            className="mt-3 w-full rounded-2xl bg-foreground py-4 font-bold text-background disabled:opacity-50"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}
