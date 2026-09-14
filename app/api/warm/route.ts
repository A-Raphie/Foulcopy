import { NextResponse } from "next/server";
import { hasApiKey, warmDictation } from "@/lib/dictation";

export const runtime = "nodejs";

export async function GET() {
  if (!hasApiKey()) {
    return NextResponse.json(
      { ok: false, error: "ASSEMBLYAI_API_KEY is not set" },
      { status: 503 },
    );
  }
  const ok = await warmDictation();
  return NextResponse.json({ ok });
}
