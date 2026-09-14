import { addedCount, droppedCount, wordDiff, type Mark } from "@/lib/diff";
import type { DictationResult } from "@/lib/dictation";

function WordRun({ marks }: { marks: Mark[] }) {
  if (marks.length === 0) {
    return <span className="text-[var(--text-muted)]">Nothing here yet.</span>;
  }
  return (
    <p className="font-mono text-[15px] leading-7 text-[var(--text-primary)]">
      {marks.map((m, i) => {
        if (m.kind === "drop") {
          return (
            <mark
              key={`${m.word}-${i}`}
              className="mx-[1px] bg-[var(--mark-drop-bg)] text-[var(--mark-drop)] line-through decoration-[var(--mark-drop)]"
            >
              {m.word}{" "}
            </mark>
          );
        }
        if (m.kind === "add") {
          return (
            <mark
              key={`${m.word}-${i}`}
              className="mx-[1px] bg-[var(--mark-add-bg)] text-[var(--mark-add)]"
            >
              {m.word}{" "}
            </mark>
          );
        }
        return <span key={`${m.word}-${i}`}>{m.word} </span>;
      })}
    </p>
  );
}

function ConfidenceStrip({
  words,
}: {
  words: { text: string; confidence: number }[];
}) {
  if (words.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-1">
      {words.map((w, i) => {
        const low = w.confidence < 0.7;
        return (
          <span
            key={`${w.text}-${i}`}
            className="font-mono text-[11px] tracking-wide"
            title={`confidence ${w.confidence.toFixed(2)}`}
            style={{
              color: low ? "var(--mark-drop)" : "var(--text-muted)",
            }}
          >
            {w.text}
            <span className="ml-1 opacity-70">
              {Math.round(w.confidence * 100)}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function ProofSheet({
  result,
  emptyHint,
}: {
  result: DictationResult | null;
  emptyHint: string;
}) {
  if (!result) {
    return (
      <section className="sheet grid min-h-[280px] grid-cols-1 md:grid-cols-2">
        <div className="border-b border-[var(--border-default)] p-5 md:border-b-0 md:border-r">
          <p className="micro">Spoken</p>
          <p className="mt-6 caption">{emptyHint}</p>
        </div>
        <div className="p-5">
          <p className="micro">Send ready</p>
          <p className="mt-6 caption">The rewrite lands here after one POST.</p>
        </div>
      </section>
    );
  }

  const send = result.llm_response ?? result.text;
  const { left, right } = wordDiff(result.text, send);
  const dropped = droppedCount(left);
  const added = addedCount(right);
  const same = result.text.trim() === send.trim();

  return (
    <section className="sheet">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-[var(--border-default)] p-5 md:border-b-0 md:border-r">
          <div className="flex items-baseline justify-between gap-4">
            <p className="micro">Spoken · verbatim</p>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">
              {dropped} dropped
            </p>
          </div>
          <div className="mt-4">
            <WordRun marks={left} />
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="micro">Send ready · rewrite</p>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">
              {added} added
            </p>
          </div>
          <div className="mt-4">
            <WordRun marks={right} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--border-default)] px-5 py-3">
        <p className="caption">
          {same
            ? "No rewrite delta. The two lines match."
            : result.llm_response
              ? "Default cleanup or your instruction wrote the right column."
              : "Rewrite empty. Showing verbatim on both sides."}
        </p>
        {result.llm_error ? (
          <p className="caption text-[var(--status-error)]">
            Rewrite note: {result.llm_error}
          </p>
        ) : null}
        {result.session_id ? (
          <p className="font-mono text-[11px] text-[var(--text-muted)]">
            {result.session_id}
          </p>
        ) : null}
        {result.request_time_ms != null ? (
          <p className="font-mono text-[11px] text-[var(--text-muted)]">
            {result.request_time_ms} ms
          </p>
        ) : null}
      </div>
      <div className="border-t border-[var(--border-default)] px-5 py-3">
        <p className="micro">Word confidence</p>
        <ConfidenceStrip words={result.words} />
      </div>
    </section>
  );
}

export function SpecimenSheet() {
  const spoken =
    "um so yeah I I meant to say ship the receipt tonight not tomorrow";
  const send = "Ship the receipt tonight, not tomorrow.";
  const { left, right } = wordDiff(spoken, send);
  return (
    <section id="proof" className="sheet scroll-mt-20">
      <div className="flex items-baseline justify-between border-b border-[var(--border-default)] px-5 py-3">
        <p className="micro">Specimen · not a live take</p>
        <p className="font-mono text-[11px] text-[var(--text-muted)]">
          text vs llm_response
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-[var(--border-default)] p-5 md:border-b-0 md:border-r">
          <p className="micro">Spoken</p>
          <div className="mt-4">
            <WordRun marks={left} />
          </div>
        </div>
        <div className="p-5">
          <p className="micro">Send ready</p>
          <div className="mt-4">
            <WordRun marks={right} />
          </div>
        </div>
      </div>
    </section>
  );
}
