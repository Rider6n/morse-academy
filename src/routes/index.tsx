import { createFileRoute, Link } from "@tanstack/react-router";
import { useHydratedProgress, masteryPct } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morse Academy — Dashboard" },
      { name: "description", content: "Your Morse code learning dashboard with progress, modules, and badges." },
    ],
  }),
  component: Dashboard,
});

const MODULES = [
  { to: "/learn", title: "Learn", desc: "Alphabet A–Z", code: "A-Z", featured: true },
  { to: "/practice", title: "Practice", desc: "Recall letters", code: ".." },
  { to: "/word", title: "Word", desc: "Decode words", code: "--" },
  { to: "/message", title: "Message", desc: "Timed messages", code: "//" },
  { to: "/coach", title: "Coach", desc: "AI feedback", code: "AI" },
  { to: "/test", title: "Test", desc: "Certification", code: "??" },
] as const;

function Dashboard() {
  const { progress: p } = useHydratedProgress();
  const mastery = masteryPct(p);

  return (
    <div className="px-5 pt-6 [animation:slideUp_.4s_var(--ease-out-expo)_both]">
      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Operator</p>
        <h1 className="text-3xl font-black tracking-tight">Welcome back.</h1>
      </div>

      <div className="mb-5 flex items-center gap-4 rounded-3xl border-2 border-foreground bg-surface p-5 shadow-[0_6px_0_0_rgba(0,0,0,0.08)]">
        <RadialProgress value={mastery} />
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold">Alphabet Mastery</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {26 - Object.keys(p.learned).length} characters until full coverage.
          </p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full ${i < Math.ceil(mastery / 25) ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Stat label="XP" value={p.xp.toLocaleString()} tone="accent" />
        <Stat label="Streak" value={`${p.streak}d`} tone="primary" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modules</h2>
        <Link to="/coach" className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
          Get a tip →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`flex aspect-square flex-col justify-between rounded-2xl p-4 transition active:scale-95 ${
              m.featured
                ? "bg-foreground text-background shadow-[0_6px_0_0_oklch(0.72_0.18_47)]"
                : "border-2 border-foreground/10 bg-surface"
            }`}
          >
            <div
              className={`grid size-9 place-items-center rounded-xl font-mono text-xs font-extrabold ${
                m.featured ? "bg-background/10 text-background" : "bg-muted text-foreground"
              }`}
            >
              {m.code}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold">{m.title}</p>
              <p className={`text-xs font-medium ${m.featured ? "opacity-60" : "text-muted-foreground"}`}>
                {m.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {p.badges.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {p.badges.map((b) => (
              <span
                key={b}
                className="rounded-full border-2 border-foreground bg-surface px-3 py-1 text-xs font-bold"
              >
                🏅 {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "accent" }) {
  return (
    <div
      className={`rounded-2xl border-2 px-4 py-3 ${
        tone === "primary" ? "border-primary/30 bg-primary/10" : "border-accent/30 bg-accent/10"
      }`}
    >
      <p
        className={`font-mono text-[9px] font-bold uppercase tracking-widest ${
          tone === "primary" ? "text-primary" : "text-accent"
        }`}
      >
        {label}
      </p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function RadialProgress({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0.94 0.01 80)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="oklch(0.72 0.18 47)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .6s var(--ease-out-expo)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black">{value}%</span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Mastery</span>
      </div>
    </div>
  );
}
