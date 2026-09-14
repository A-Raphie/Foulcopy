"use client";

import { useEffect, useState } from "react";

export function WarmDot() {
  const [warm, setWarm] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/warm")
      .then((r) => r.json())
      .then((j) => {
        if (alive) setWarm(Boolean(j.ok));
      })
      .catch(() => {
        if (alive) setWarm(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const label = warm === null ? "checking" : warm ? "warm" : "cold";
  return (
    <span
      className="hidden items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border-default)] px-2.5 py-1 text-[11px] text-[var(--text-muted)] sm:inline-flex"
      title="AssemblyAI Dictation API, beta. The dot is the live GET /warm probe: violet when the connection path answers, gray when it does not."
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: warm ? "var(--accent)" : "var(--text-muted)" }}
      />
      Dictation API · {label}
    </span>
  );
}
