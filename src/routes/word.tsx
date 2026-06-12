import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { WORDS, encodeWord } from "@/lib/morse";
import { playMorse, playFeedback } from "@/lib/audio";
import { progressActions } from "@/lib/progress";

type Level = "beginner" | "intermediate" | "advanced";

export const Route = createFileRoute("/word")({
  head: () => ({ meta: [{ title: "Word Challenge — Morse Academy" }] }),
  component: WordChallenge,
});

function pick(level: Level) {
  const list = WORDS[level];
  return list[Math.floor(Math.random() * list.length)];
}

function WordChallenge() {
  const [level, setLevel] = useState<Level>("beginner");
  const [word, setWord] = useState(() => pick("beginner"));
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const code = useMemo(() => encodeWord(word), [word]);

  useEffect(() => {
    setWord(pick(level));
    setInput("");
    setResult(null);
  }, [level]);

  const submit = () => {
    const ok = input.trim().toUpperCase() === word;
    setResult(ok ? "correct" : "wrong");
    playFeedback(ok ? "correct" : "wrong");
    word.split("").forEach((c) => progressActions.recordAnswer(c, ok, 5));
  };

  const newWord = () => {
    setWord(pick(level));
    setInput("");
    setResult(null);
  };

  return (
    <div className="px-5 pt-4">
      <h1 className="mb-1 text-2xl font-black">Word Challenge</h1>
      <p className="mb-5 text-sm text-muted-foreground">Decode the broadcast.</p>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border-2 border-foreground/10 bg-surface p-1">
        {(["beginner", "intermediate", "advanced"] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-xl py-2 text-xs font-extrabold uppercase tracking-wider transition ${
              level === l ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border-2 border-foreground bg-surface p-6 shadow-[0_8px_0_0_rgba(0,0,0,0.06)]">
        <p className="mb-4 break-words text-center font-mono text-2xl font-extrabold leading-relaxed tracking-widest sm:text-3xl">
          {code.replace(/\./g, "·").replace(/-/g, "—")}
        </p>
        <button
          onClick={() => playMorse(encodeWord(word).replace(/ /g, "  "))}
          className="mx-auto flex items-center gap-2 rounded-full border-2 border-foreground px-4 py-2 text-xs font-bold"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Play audio
        </button>
      </div>

      <div className="mt-5">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Your decode
        </label>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="TYPE WORD"
          className="mt-1 w-full rounded-2xl border-2 border-foreground bg-surface px-4 py-4 text-center text-2xl font-extrabold tracking-widest outline-none focus:border-primary"
        />
      </div>

      {result && (
        <div
          className={`mt-4 rounded-2xl p-4 text-center font-extrabold ${
            result === "correct"
              ? "bg-accent/15 text-accent"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {result === "correct" ? `✓ Copy that — ${word}` : `✗ It was: ${word}`}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={submit}
          className="rounded-2xl bg-accent py-4 font-bold text-accent-foreground active:scale-95"
        >
          Check
        </button>
        <button
          onClick={newWord}
          className="rounded-2xl border-2 border-foreground bg-surface py-4 font-bold active:scale-95"
        >
          New word
        </button>
      </div>
    </div>
  );
}
