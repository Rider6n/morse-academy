import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

export type Progress = {
  xp: number;
  streak: number;
  lastActiveDay: string; // YYYY-MM-DD
  learned: Record<string, number>; // char -> times reviewed
  mistakes: Record<string, number>; // char -> mistake count
  correct: Record<string, number>; // char -> correct count
  badges: string[];
  certificationScore: number | null;
};

const KEY = "morse-academy:v1";

const initial: Progress = {
  xp: 0,
  streak: 0,
  lastActiveDay: "",
  learned: {},
  mistakes: {},
  correct: {},
  badges: [],
  certificationScore: null,
};

const listeners = new Set<() => void>();
let cache: Progress | null = null;

function read(): Progress {
  if (cache) return cache;
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    cache = initial;
  }
  return cache!;
}

function write(next: Progress) {
  cache = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useProgress() {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  const snap = useSyncExternalStore(subscribe, read, () => initial);
  return snap;
}

export const progressActions = {
  markLearned(char: string) {
    const p = read();
    write({ ...p, learned: { ...p.learned, [char]: (p.learned[char] ?? 0) + 1 } });
  },
  recordAnswer(char: string, correct: boolean, xpGained: number) {
    const p = read();
    const today = todayStr();
    let streak = p.streak;
    if (p.lastActiveDay !== today) {
      const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = p.lastActiveDay === yest ? streak + 1 : 1;
    }
    const next: Progress = {
      ...p,
      xp: p.xp + (correct ? xpGained : 0),
      streak,
      lastActiveDay: today,
      correct: correct ? { ...p.correct, [char]: (p.correct[char] ?? 0) + 1 } : p.correct,
      mistakes: correct ? p.mistakes : { ...p.mistakes, [char]: (p.mistakes[char] ?? 0) + 1 },
    };
    // Badges
    const badges = new Set(next.badges);
    if (next.xp >= 100) badges.add("Spark");
    if (next.xp >= 500) badges.add("Operator");
    if (next.xp >= 1500) badges.add("Telegrapher");
    if (next.streak >= 3) badges.add("3-Day Streak");
    if (next.streak >= 7) badges.add("Week Warrior");
    if (Object.keys(next.learned).length >= 26) badges.add("Alphabet Complete");
    next.badges = Array.from(badges);
    write(next);
  },
  setCertificationScore(score: number) {
    const p = read();
    const badges = new Set(p.badges);
    if (score >= 8) badges.add("Certified Operator");
    write({ ...p, certificationScore: score, badges: Array.from(badges) });
  },
  reset() {
    write(initial);
  },
};

export function masteryPct(p: Progress) {
  const learnedCount = Object.keys(p.learned).length;
  return Math.round((learnedCount / 26) * 100);
}

export function weakLetters(p: Progress, limit = 4): string[] {
  return Object.entries(p.mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([c]) => c);
}

// Hydration helper: re-read after mount in case SSR returned initial.
export function useHydratedProgress() {
  const p = useProgress();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    cache = null;
    listeners.forEach((l) => l());
    setHydrated(true);
  }, []);
  return { progress: p, hydrated };
}
