import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MESSAGES, encodeWord } from "@/lib/morse";
import { playMorse, playFeedback } from "@/lib/audio";
import { progressActions } from "@/lib/progress";

export const Route = createFileRoute("/message")({
  head: () => ({ meta: [{ title: "Message Challenge — Morse Academy" }] }),
  component: MessageChallenge,
});

const TIME_LIMIT = 45; // seconds

function pick() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

function MessageChallenge() {
  const [msg, setMsg] = useState(() => pick());
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState<null | "win" | "loss" | "timeout">(null);
  const code = useMemo(() => encodeWord(msg), [msg]);

  useEffect(() => {
    if (done) return;
    if (timeLeft <= 0) {
      setDone("timeout");
      playFeedback("wrong");
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done]);

  const submit = () => {
    const ok = input.trim().toUpperCase() === msg;
    setDone(ok ? "win" : "loss");
    playFeedback(ok ? "correct" : "wrong");
    msg.replace(/\s/g, "").split("").forEach((c) => progressActions.recordAnswer(c, ok, 8));
  };

  const reset = () => {
    setMsg(pick());
    setInput("");
    setTimeLeft(TIME_LIMIT);
    setDone(null);
  };

  const pct = (timeLeft / TIME_LIMIT) * 100;

  return (
    <div className="px-5 pt-4">
      <h1 className="mb-1 text-2xl font-black">Message Challenge</h1>
      <p className="mb-4 text-sm text-muted-foreground">Decode a full transmission against the clock.</p>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${pct > 33 ? "bg-accent" : "bg-destructive"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-sm font-extrabold">{timeLeft}s</span>
      </div>

      <div className="rounded-3xl border-2 border-foreground bg-surface p-6 shadow-[0_8px_0_0_rgba(0,0,0,0.06)]">
        <p className="break-words text-center font-mono text-xl font-extrabold leading-relaxed tracking-wider sm:text-2xl">
          {code.replace(/\./g, "·").replace(/-/g, "—").replace(/\//g, " / ")}
        </p>
        <button
          onClick={() => playMorse(encodeWord(msg))}
          className="mx-auto mt-4 flex items-center gap-2 rounded-full border-2 border-foreground px-4 py-2 text-xs font-bold"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Play
        </button>
      </div>

      <input
        autoFocus
        value={input}
        disabled={!!done}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="DECODED MESSAGE"
        className="mt-5 w-full rounded-2xl border-2 border-foreground bg-surface px-4 py-4 text-center text-lg font-extrabold tracking-widest outline-none focus:border-primary disabled:opacity-60"
      />

      {done && (
        <div
          className={`mt-4 rounded-2xl p-4 text-center font-extrabold ${
            done === "win" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"
          }`}
        >
          {done === "win" ? `✓ Transmission received` : done === "timeout" ? `⏱ Time's up — it was "${msg}"` : `✗ Not quite — it was "${msg}"`}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={submit}
          disabled={!!done}
          className="rounded-2xl bg-accent py-4 font-bold text-accent-foreground disabled:opacity-50"
        >
          Check
        </button>
        <button
          onClick={reset}
          className="rounded-2xl border-2 border-foreground bg-surface py-4 font-bold"
        >
          New message
        </button>
      </div>
    </div>
  );
}
