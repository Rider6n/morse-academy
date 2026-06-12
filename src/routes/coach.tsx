import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useHydratedProgress, weakLetters } from "@/lib/progress";
import { getCoachFeedback } from "@/lib/coach.functions";

export const Route = createFileRoute("/coach")({
  head: () => ({ meta: [{ title: "AI Coach — Morse Academy" }] }),
  component: Coach,
});

function Coach() {
  const { progress: p } = useHydratedProgress();
  const fn = useServerFn(getCoachFeedback);
  const weak = weakLetters(p, 5);

  const m = useMutation({
    mutationFn: () =>
      fn({
        data: {
          xp: p.xp,
          streak: p.streak,
          learnedCount: Object.keys(p.learned).length,
          weakLetters: weak,
          certificationScore: p.certificationScore,
        },
      }),
  });

  return (
    <div className="px-5 pt-4 [animation:slideUp_.4s_var(--ease-out-expo)_both]">
      <h1 className="mb-1 text-2xl font-black">AI Coach</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Dash analyzes your stats and recommends the highest-leverage next step.
      </p>

      <div className="rounded-3xl border-2 border-foreground bg-foreground p-6 text-background shadow-[0_8px_0_0_oklch(0.72_0.18_47)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-mono text-base font-extrabold">D</span>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">Coach</p>
            <p className="text-lg font-extrabold">Dash</p>
          </div>
        </div>

        {m.data ? (
          <>
            <p className="text-sm leading-relaxed">{m.data.message}</p>
            <div className="mt-4 rounded-2xl bg-background/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">Recommended</p>
              <p className="text-sm font-bold">{m.data.recommendation}</p>
            </div>
          </>
        ) : (
          <p className="text-sm leading-relaxed opacity-80">
            Tap below to get personalized coaching based on your XP, streak, and mistake patterns.
          </p>
        )}

        <button
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="mt-5 w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60"
        >
          {m.isPending ? "Analyzing signal…" : m.data ? "Get another tip" : "Get my coaching"}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Knowledge Gaps
        </h2>
        {weak.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-foreground/20 p-4 text-center text-sm text-muted-foreground">
            No weak letters yet — keep drilling to surface patterns.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {weak.map((c) => (
              <div
                key={c}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-destructive/40 bg-destructive/10"
              >
                <span className="text-xl font-black text-destructive">{c}</span>
                <span className="font-mono text-[9px] text-destructive/70">×{p.mistakes[c]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
