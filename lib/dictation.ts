import { LANGUAGE_CODES, type LanguageCode } from "./languages";

export const DICTATION_HOST = "https://dictation.assemblyai.com";
export const DICTATION_LIVE = `${DICTATION_HOST}/v1/transcribe/live`;
export const DICTATION_WARM = `${DICTATION_HOST}/warm`;
export const MAX_SECONDS = 120;

export type DictationWord = {
  text: string;
  confidence: number;
};

export type DictationResult = {
  text: string;
  words: DictationWord[];
  confidence: number | null;
  llm_response: string | null;
  llm_error: string | null;
  audio_duration_ms: number | null;
  session_id: string | null;
  request_time_ms: number | null;
  sync_time_ms: number | null;
};

export type DictateInput = {
  audio: Blob;
  contentType: "audio/pcm" | "audio/wav";
  sampleRate?: number;
  channels?: number;
  language: LanguageCode;
  llmInstruction?: string;
  keyterms?: string[];
};

export function parseLanguage(value: string | null): LanguageCode {
  if (value && (LANGUAGE_CODES as readonly string[]).includes(value)) {
    return value as LanguageCode;
  }
  return "en";
}

export function parseKeyterms(raw: string): string[] {
  const parts = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const unique: string[] = [];
  for (const p of parts) {
    if (!unique.includes(p) && unique.length < 100) unique.push(p);
  }
  return unique;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ASSEMBLYAI_API_KEY?.trim());
}

export function apiKey(): string {
  const key = process.env.ASSEMBLYAI_API_KEY?.trim();
  if (!key) {
    throw new Error("ASSEMBLYAI_API_KEY is not set");
  }
  return key;
}

export async function warmDictation(): Promise<boolean> {
  try {
    const res = await fetch(DICTATION_WARM, { method: "GET", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function transcribeLive(
  input: DictateInput,
): Promise<DictationResult> {
  const key = apiKey();
  const config: Record<string, unknown> = {
    language_codes: [input.language],
  };
  if (input.contentType === "audio/pcm") {
    config.sample_rate = input.sampleRate ?? 16000;
    config.channels = input.channels ?? 1;
  }
  if (input.llmInstruction?.trim()) {
    config.llm_instruction = input.llmInstruction.trim().slice(0, 2048);
  }
  if (input.keyterms && input.keyterms.length > 0) {
    config.keyterms_prompt = input.keyterms.slice(0, 100);
  }

  const body = new FormData();
  body.append("config", JSON.stringify(config));
  const file = new File([input.audio], "clip.pcm", { type: input.contentType });
  body.append("audio", file);

  const res = await fetch(DICTATION_LIVE, {
    method: "POST",
    headers: { Authorization: key },
    body,
    signal: AbortSignal.timeout(90_000),
  });

  const raw = await res.text();
  let json: unknown = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = { error: raw.slice(0, 400) };
  }

  if (!res.ok) {
    const message = extractError(json, res.status);
    const err = new Error(message);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }

  return normalizeResult(json);
}

function extractError(json: unknown, status: number): string {
  if (json && typeof json === "object") {
    const rec = json as Record<string, unknown>;
    if (typeof rec.error === "string") return rec.error;
    if (typeof rec.detail === "string") return rec.detail;
    if (typeof rec.title === "string") return rec.title;
    if (typeof rec.msg === "string") return rec.msg;
  }
  if (status === 404) return "Invalid API key (Dictation returns 404).";
  if (status === 415) return "Audio format rejected. WAV or raw PCM only.";
  return `Dictation request failed (${status}).`;
}

function normalizeResult(json: unknown): DictationResult {
  const rec = (json && typeof json === "object" ? json : {}) as Record<
    string,
    unknown
  >;
  const wordsRaw = Array.isArray(rec.words) ? rec.words : [];
  const words: DictationWord[] = wordsRaw
    .map((w) => {
      if (!w || typeof w !== "object") return null;
      const o = w as Record<string, unknown>;
      if (typeof o.text !== "string") return null;
      return {
        text: o.text,
        confidence: typeof o.confidence === "number" ? o.confidence : 0,
      };
    })
    .filter((w): w is DictationWord => w !== null);

  return {
    text: typeof rec.text === "string" ? rec.text : "",
    words,
    confidence: typeof rec.confidence === "number" ? rec.confidence : null,
    llm_response:
      typeof rec.llm_response === "string" ? rec.llm_response : null,
    llm_error: typeof rec.llm_error === "string" ? rec.llm_error : null,
    audio_duration_ms:
      typeof rec.audio_duration_ms === "number" ? rec.audio_duration_ms : null,
    session_id: typeof rec.session_id === "string" ? rec.session_id : null,
    request_time_ms:
      typeof rec.request_time_ms === "number" ? rec.request_time_ms : null,
    sync_time_ms:
      typeof rec.sync_time_ms === "number" ? rec.sync_time_ms : null,
  };
}
