import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-bold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">This frequency isn't broadcasting.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-sm font-bold text-background"
        >
          Back to base
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">Something glitched</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Retry
          </button>
          <a href="/" className="rounded-2xl border-2 border-foreground px-4 py-2 text-sm font-bold">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f0b27a" },
      { title: "Morse Academy — Learn Morse in 15 minutes" },
      { name: "description", content: "Learn Morse code in under 15 minutes with bite-size lessons, an AI coach, and real-message challenges." },
      { property: "og:title", content: "Morse Academy — Learn Morse in 15 minutes" },
      { property: "og:description", content: "Learn Morse code in under 15 minutes with bite-size lessons, an AI coach, and real-message challenges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Morse Academy — Learn Morse in 15 minutes" },
      { name: "twitter:description", content: "Learn Morse code in under 15 minutes with bite-size lessons, an AI coach, and real-message challenges." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/436638b5-8ce8-4d8e-8864-0f62847152da/id-preview-db053e03--26b5a608-5a50-45f9-8760-04376b94828f.lovable.app-1781272521085.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/436638b5-8ce8-4d8e-8864-0f62847152da/id-preview-db053e03--26b5a608-5a50-45f9-8760-04376b94828f.lovable.app-1781272521085.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("morse-theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("morse-theme", next ? "dark" : "light");
  };

  const showNav = pathname !== "/welcome";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-24">
        <header className="flex items-center justify-between px-5 pt-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-foreground text-background">
              <span className="font-mono text-[10px] font-extrabold">·—</span>
            </div>
            <div className="leading-tight">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Frequency 14.025</p>
              <p className="text-sm font-extrabold">Morse Academy</p>
            </div>
          </Link>
          <button
            onClick={toggleDark}
            aria-label="Toggle theme"
            className="rounded-full border-2 border-foreground/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
          >
            {dark ? "Light" : "Dark"}
          </button>
        </header>
        <main className="flex-1">{children}</main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

const NAV = [
  { to: "/", label: "Home", code: "··" },
  { to: "/learn", label: "Learn", code: "·—" },
  { to: "/practice", label: "Drill", code: "—·" },
  { to: "/coach", label: "Coach", code: "AI" },
  { to: "/test", label: "Test", code: "??" },
] as const;

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto max-w-md px-4 pb-4">
        <div className="grid grid-cols-5 gap-1 rounded-3xl border-2 border-foreground bg-surface p-2 shadow-[0_8px_0_0_rgba(0,0,0,0.08)]">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-muted-foreground transition data-[status=active]:bg-foreground data-[status=active]:text-background"
            >
              <span className="font-mono text-xs font-extrabold">{item.code}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
