import Link from "next/link";

export function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  );
}

export function SiteHeader({ current }: { current: "home" | "app" }) {
  return (
    <header className="border-b border-[var(--border-default)]">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Foulcopy
        </Link>
        <div className="flex items-center gap-6 text-[14px]">
          <Link
            href="/#proof"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Proof
          </Link>
          <Link
            href="/#how"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            How
          </Link>
          {current === "app" ? (
            <span className="text-[var(--text-primary)] underline decoration-[var(--accent)] underline-offset-4">
              Pad
            </span>
          ) : (
            <Link
              href="/app"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Pad
            </Link>
          )}
          <span
            className="hidden items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border-default)] px-2.5 py-1 text-[11px] text-[var(--text-muted)] sm:inline-flex"
            title="AssemblyAI Dictation API, beta. One POST per utterance."
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            />
            Dictation API
          </span>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-default)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="caption">
          Foulcopy · built by{" "}
          <a
            href="https://x.com/a_raphie"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[var(--accent)]"
          >
            Raphie
          </a>{" "}
          for Voice Hackathon Week
        </span>
        <span className="caption hidden sm:inline">
          AssemblyAI Dictation · WAV or PCM · 120s
        </span>
      </div>
    </footer>
  );
}
