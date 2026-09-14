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
            Mic to proof sheet in one request
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            <li>
              <p className="micro">01</p>
              <p className="mt-2 font-medium">Hold and speak</p>
              <p className="caption mt-1">
                The pad captures 16 kHz mono PCM while you talk.
              </p>
            </li>
            <li>
              <p className="micro">02</p>
              <p className="mt-2 font-medium">One live POST</p>
              <p className="caption mt-1">
                Config goes first, then audio, to
                dictation.assemblyai.com/v1/transcribe/live.
              </p>
            </li>
            <li>
              <p className="micro">03</p>
              <p className="mt-2 font-medium">Read the DIFF</p>
              <p className="caption mt-1">
                Spoken stays on the left. Send ready on the right. Copy the
                rewrite.
              </p>
            </li>
          </ol>
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
