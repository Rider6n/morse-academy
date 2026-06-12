import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MORSE, prettyCode } from "@/lib/morse";
import { playMorse } from "@/lib/audio";
import { progressActions } from "@/lib/progress";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — Morse Academy" }] }),
  component: Learn,
});

function Learn() {
  const [i, setI] = useState(0);
  const m = MORSE[i];
  const progress = ((i + 1) / MORSE.length) * 100;

  const next = () => {
    progressActions.markLearned(m.char);
    setI((v) => Math.min(MORSE.length - 1, v + 1));
  };
  const prev = () => setI((v) => Math.max(0, v - 1));

  return (
    <div className="px-5 pt-4 [animation:slideUp_.4s_var(--ease-out-expo)_both]">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back"
          className="grid size-9 place-items-center rounded-full border-2 border-foreground/15 font-mono text-sm"
        >
          ←
        </Link>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          {i + 1}/{MORSE.length}
        </span>
      </div>

      <div
        key={m.char}
        className="flex flex-col items-center justify-between gap-6 rounded-[2rem] border-2 border-foreground bg-surface p-8 shadow-[0_8px_0_0_rgba(0,0,0,0.06)] [animation:pop_.35s_var(--ease-out-expo)_both]"
      >
        <span className="text-[7rem] font-black leading-none tracking-tighter">{m.char}</span>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {m.code.split("").map((s, idx) => (
              <span
                key={idx}
                className={`block rounded-full bg-foreground ${s === "." ? "size-4" : "h-4 w-12"}`}
              />
            ))}
          </div>
          <p className="font-mono text-sm tracking-widest text-muted-foreground">{m.pronunciation}</p>
          <p className="font-mono text-lg font-bold tracking-[0.3em]">{prettyCode(m.code)}</p>
        </div>

        <div className="w-full rounded-2xl bg-muted p-4">
          <p className="text-center text-sm italic text-muted-foreground">"{m.mnemonic}"</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => playMorse(m.code)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-surface py-4 font-bold active:scale-95"
        >
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          Play
        </button>
        <button
          onClick={next}
          className="rounded-2xl bg-foreground py-4 font-bold text-background active:scale-95"
        >
          {i === MORSE.length - 1 ? "Done" : "Next"}
        </button>
      </div>
      {i > 0 && (
        <button onClick={prev} className="mt-3 w-full py-2 text-xs font-bold text-muted-foreground">
          ← Previous letter
        </button>
      )}
    </div>
  );
}
