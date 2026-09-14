"use client";

import { SiteFooter, SiteHeader, SkipLink } from "./components/site-chrome";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <SkipLink />
      <SiteHeader current="home" />
      <main id="main" className="mx-auto flex max-w-6xl flex-1 flex-col px-6 py-24">
        <p className="micro">Error</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          The page failed to render.
        </h1>
        <button type="button" className="btn btn-primary mt-8 w-fit" onClick={reset}>
          Try again
        </button>
      </main>
      <SiteFooter />
    </>
  );
}
