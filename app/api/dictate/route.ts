import { NextResponse } from "next/server";
import {
  hasApiKey,
  parseKeyterms,
  parseLanguage,
  transcribeLive,
} from "@/lib/dictation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasApiKey()) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY is not set on this host." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Missing audio." }, { status: 400 });
  }

  const rawType = (form.get("contentType") as string | null) ?? audio.type;
  const contentType =
    rawType === "audio/wav" || rawType === "audio/x-wav" ? "audio/wav" : "audio/pcm";

  const sampleRate = Number(form.get("sampleRate") ?? "16000") || 16000;
  const channels = Number(form.get("channels") ?? "1") || 1;
  const language = parseLanguage((form.get("language") as string | null) ?? "en");
  const llmInstruction = ((form.get("llmInstruction") as string | null) ?? "").trim();
  const keyterms = parseKeyterms((form.get("keyterms") as string | null) ?? "");

  try {
    const result = await transcribeLive({
      audio,
      contentType,
      sampleRate,
      channels,
      language,
      llmInstruction: llmInstruction || undefined,
      keyterms,
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 502;
    const message = err instanceof Error ? err.message : "Dictation failed.";
    return NextResponse.json({ error: message }, { status });
  }
}
