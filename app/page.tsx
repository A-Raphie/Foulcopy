import Link from "next/link";
import { SiteFooter, SiteHeader, SkipLink } from "./components/site-chrome";
import { SpecimenSheet } from "./components/proof-sheet";

export default function Home() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="home" />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24">
          <p className="micro">Dictation pad</p>
          <h1 className="mt-4 max-w-[680px] text-5xl font-semibold leading-none tracking-tight text-balance">
            <span className="text-[var(--text-primary)]">Speak once.</span>{" "}
            <span className="text-[var(--text-primary)]/55">
              See what you said and what you meant to send.
            </span>
          </h1>
          <p className="lede mt-6 text-lg">
            Foulcopy posts one utterance to the AssemblyAI Dictation API and
            prints both returns: the verbatim line, and the send ready rewrite
            with fillers gone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/app" className="btn btn-primary">
              Open the pad
            </Link>
            <Link href="/#proof" className="btn btn-ghost">
              See a specimen
            </Link>
          </div>
          <p className="caption mt-4">
            One POST per take. WAV or raw PCM. 120 seconds max.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <SpecimenSheet />
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24">
          <p className="micro">How</p>
          <h2 className="mt-3 max-w-[680px] text-3xl font-semibold tracking-tight text-balance">
            One request, both returns
          </h2>
          <div className="sheet mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border-default)] px-5 py-3">
              <p className="font-mono text-[12px] text-[var(--text-primary)]">
                POST dictation.assemblyai.com/v1/transcribe/live
              </p>
              <p className="font-mono text-[11px] text-[var(--text-muted)]">
                multipart · config first
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b border-[var(--border-default)] p-5 md:border-b-0 md:border-r">
                <p className="micro">Part 1 · config</p>
                <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-6 text-[var(--text-secondary)]">
                  {`{
  "language_codes": ["en"],
  "keyterms_prompt": ["Foulcopy", "AssemblyAI"]
}`}
                </pre>
              </div>
              <div className="p-5">
                <p className="micro">Part 2 · audio</p>
                <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-6 text-[var(--text-secondary)]">
                  {`spoken.wav
WAV · 16 kHz mono · 3.5 s`}
                </pre>
              </div>
            </div>
            <div className="border-t border-[var(--border-default)] px-5 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="micro">Response</p>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  200 · 452 ms
                </p>
              </div>
              <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-6 text-[var(--text-secondary)]">
                {`{
  "text": "Um, so yeah, I, I meant to say ship the receipt tonight, not tomorrow.",
  "llm_response": "So yeah, I meant to say ship the receipt tonight, not tomorrow.",
  "confidence": 0.958,
  "session_id": "6b45c74c-967f-4408-b019-3cb143e99572"
}`}
              </pre>
            </div>
          </div>
          <p className="caption mt-3">
            Recorded take 6b45c74c, keyterms on. Run your own on the pad.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <p className="micro">On this pad</p>
          <div className="mt-6 grid gap-px bg-[var(--border-default)] md:grid-cols-2">
            <div className="bg-[var(--bg-base)] px-5 py-4">
              <p className="font-medium">It does</p>
              <p className="caption mt-1">
                Live dictation, filler cleanup, optional rewrite instruction,
                keyterms, 19 languages.
              </p>
            </div>
            <div className="bg-[var(--bg-base)] px-5 py-4">
              <p className="font-medium">It does not</p>
              <p className="caption mt-1">
                Long meetings. Streaming captions while you talk. Translation.
                The rewrite never replaces the spoken line.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
