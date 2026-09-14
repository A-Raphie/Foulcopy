import { addedCount, droppedCount, wordDiff, type Mark } from "@/lib/diff";
import type { DictationResult, DictationWord } from "@/lib/dictation";

const SPECIMEN_SPOKEN =
  "um so yeah I I meant to say ship the receipt tonight not tomorrow";
const SPECIMEN_SEND = "Ship the receipt tonight, not tomorrow.";

function WordRun({ marks }: { marks: Mark[] }) {
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

export function SpecimenColumns() {
  const { left, right } = wordDiff(SPECIMEN_SPOKEN, SPECIMEN_SEND);
  return (
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
  );
}

function CountChip({ children }: { children: React.ReactNode }) {
  return <span className="count-chip">{children}</span>;
}

function SheetHeader({
  label,
  meta,
}: {
  label: string;
  meta: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border-default)] px-5 py-3">
      <p className="micro">{label}</p>
      <p className="font-mono text-[11px] text-[var(--text-muted)]">{meta}</p>
    </div>
  );
}

function ConfidenceSummary({ words }: { words: DictationWord[] }) {
  if (words.length === 0) return null;
  const strong = words.filter((w) => w.confidence >= 0.98).length;
  const lows = words.filter((w) => w.confidence < 0.95);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="font-mono text-[11px] text-[var(--text-muted)]">
        {strong} of {words.length} words ≥ 98{lows.length > 0 ? " · low:" : ""}
      </p>
      {lows.map((w, i) => (
        <span
          key={`${w.text}-${i}`}
          className="count-chip text-[var(--mark-drop)]"
          title={`confidence ${w.confidence.toFixed(2)}`}
        >
          {w.text} {Math.round(w.confidence * 100)}
        </span>
      ))}
    </div>
  );
}

export function ProofSheet({
  result,
  pending,
}: {
  result: DictationResult | null;
  pending: boolean;
}) {
  if (!result) {
    if (pending) {
      return (
        <section className="sheet">
          <SheetHeader
            label="Waiting on dictation.assemblyai.com"
            meta="one POST"
          />
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-[var(--border-default)] p-5 md:border-b-0 md:border-r">
              <p className="micro">Spoken · verbatim</p>
              <div className="mt-4 animate-pulse space-y-2">
                <div className="h-4 w-3/4 bg-[var(--bg-subtle)]" />
                <div className="h-4 w-1/2 bg-[var(--bg-subtle)]" />
              </div>
            </div>
            <div className="p-5">
              <p className="micro">Send ready · rewrite</p>
              <div className="mt-4 animate-pulse space-y-2">
                <div className="h-4 w-2/3 bg-[var(--bg-subtle)]" />
                <div className="h-4 w-1/3 bg-[var(--bg-subtle)]" />
              </div>
            </div>
          </div>
        </section>
      );
    }
    return (
      <section className="sheet">
        <SheetHeader
          label="Specimen · run a take to make this yours"
          meta="text vs llm_response"
        />
        <SpecimenColumns />
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
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="micro">Spoken · verbatim</p>
            <CountChip>{dropped} dropped</CountChip>
          </div>
          <div className="mt-4">
            <WordRun marks={left} />
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="micro">Send ready · rewrite</p>
            <CountChip>{added} added</CountChip>
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
            {Math.round(result.request_time_ms)} ms
          </p>
        ) : null}
      </div>
      <div className="border-t border-[var(--border-default)] px-5 py-3">
        <p className="micro">Word confidence</p>
        <div className="mt-2">
          <ConfidenceSummary words={result.words} />
        </div>
      </div>
    </section>
  );
}

export function SpecimenSheet() {
  return (
    <section id="proof" className="sheet scroll-mt-20">
      <SheetHeader
        label="Specimen · not a live take"
        meta="text vs llm_response"
      />
      <SpecimenColumns />
    </section>
  );
}
