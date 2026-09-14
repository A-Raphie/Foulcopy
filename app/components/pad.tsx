"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DictationResult } from "@/lib/dictation";
import {
  LANGUAGE_CODES,
  LANGUAGE_LABELS,
  REWRITE_PRESETS,
  type LanguageCode,
} from "@/lib/languages";
import {
  TARGET_RATE,
  concatFloat32,
  downsample,
  durationSeconds,
  floatTo16BitPCM,
} from "@/lib/pcm";
import { ProofSheet } from "./proof-sheet";

type Status = "idle" | "arming" | "live" | "sending" | "error";

const MAX_SECONDS = 120;

export function Pad() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictationResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [preset, setPreset] = useState<(typeof REWRITE_PRESETS)[number]["id"]>(
    "default",
  );
  const [keyterms, setKeyterms] = useState("");
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);

  const chunksRef = useRef<Float32Array[]>([]);
  const inputRateRef = useRef(48000);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const sendingRef = useRef(false);

  useEffect(() => {
    fetch("/api/warm")
      .then(async (r) => {
        setKeyConfigured(r.status !== 503);
      })
      .catch(() => setKeyConfigured(false));
  }, []);

  const stopGraph = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
  }, []);

  useEffect(() => () => stopGraph(), [stopGraph]);

  const sendPcm = useCallback(
    async (pcm: Int16Array) => {
      setStatus("sending");
      const copy = new ArrayBuffer(pcm.byteLength);
      new Uint8Array(copy).set(
        new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength),
      );
      const blob = new Blob([copy], { type: "audio/pcm" });
      const form = new FormData();
      form.append("audio", blob, "clip.pcm");
      form.append("contentType", "audio/pcm");
      form.append("sampleRate", String(TARGET_RATE));
      form.append("channels", "1");
      form.append("language", language);
      const instruction =
        REWRITE_PRESETS.find((p) => p.id === preset)?.instruction ?? "";
      if (instruction) form.append("llmInstruction", instruction);
      if (keyterms.trim()) form.append("keyterms", keyterms);

      const res = await fetch("/api/dictate", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `Request failed (${res.status})`);
      }
      setResult(json as DictationResult);
      setStatus("idle");
    },
    [keyterms, language, preset],
  );

  const stopAndSend = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    const rate = inputRateRef.current;
    const merged = concatFloat32(chunksRef.current);
    stopGraph();
    chunksRef.current = [];
    if (merged.length === 0) {
      setStatus("idle");
      setError("No audio captured.");
      return;
    }
    const down = downsample(merged, rate, TARGET_RATE);
    const pcm = floatTo16BitPCM(down);
    try {
      await sendPcm(pcm);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Dictation failed.");
    } finally {
      sendingRef.current = false;
    }
  }, [sendPcm, stopGraph]);

  const start = useCallback(async () => {
    setError(null);
    setCopied(false);
    setStatus("arming");
    chunksRef.current = [];
    try {
      void fetch("/api/warm");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      inputRateRef.current = ctx.sampleRate;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      processor.onaudioprocess = (ev) => {
        const input = ev.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(input));
        const seconds = durationSeconds(
          chunksRef.current.reduce((n, c) => n + c.length, 0),
          inputRateRef.current,
        );
        if (seconds >= MAX_SECONDS) {
          void stopAndSend();
        }
      };
      const mute = ctx.createGain();
      mute.gain.value = 0;
      source.connect(processor);
      processor.connect(mute);
      mute.connect(ctx.destination);
      startedAtRef.current = performance.now();
      setElapsed(0);
      tickRef.current = window.setInterval(() => {
        setElapsed((performance.now() - startedAtRef.current) / 1000);
      }, 200);
      setStatus("live");
    } catch (err) {
      stopGraph();
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Microphone permission was denied.",
      );
    }
  }, [stopAndSend, stopGraph]);

  const runSample = useCallback(async () => {
    setError(null);
    setCopied(false);
    setStatus("sending");
    try {
      const resWav = await fetch("/spoken.wav");
      if (!resWav.ok) throw new Error("Sample take is missing on this host.");
      const blob = await resWav.blob();
      const file = new File([blob], "spoken.wav", { type: "audio/wav" });
      const form = new FormData();
      form.append("audio", file, "spoken.wav");
      form.append("contentType", "audio/wav");
      form.append("language", language);
      const instruction =
        REWRITE_PRESETS.find((p) => p.id === preset)?.instruction ?? "";
      if (instruction) form.append("llmInstruction", instruction);
      if (keyterms.trim()) form.append("keyterms", keyterms);
      const res = await fetch("/api/dictate", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `Request failed (${res.status})`);
      }
      setResult(json as DictationResult);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Sample take failed.");
    }
  }, [keyterms, language, preset]);

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      setCopied(false);
      setStatus("sending");
      try {
        const form = new FormData();
        form.append("audio", file, file.name);
        form.append("contentType", "audio/wav");
        form.append("language", language);
        const instruction =
          REWRITE_PRESETS.find((p) => p.id === preset)?.instruction ?? "";
        if (instruction) form.append("llmInstruction", instruction);
        if (keyterms.trim()) form.append("keyterms", keyterms);
        const res = await fetch("/api/dictate", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? `Request failed (${res.status})`);
        }
        setResult(json as DictationResult);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    },
    [keyterms, language, preset],
  );

  const sendReady = result?.llm_response ?? result?.text ?? "";

  async function copySend() {
    if (!sendReady) return;
    await navigator.clipboard.writeText(sendReady);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const live = status === "live";
  const busy = status === "arming" || status === "sending";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-[var(--text-secondary)]">
          Press Record and speak a messy sentence. Stop to print both lines.
        </p>
        <p className="font-mono text-[12px] text-[var(--text-muted)]">
          {live ? `${elapsed.toFixed(1)}s / ${MAX_SECONDS}s` : "idle"}
        </p>
      </div>

      {keyConfigured === false ? (
        <p className="sheet px-4 py-3 caption text-[var(--status-error)]">
          ASSEMBLYAI_API_KEY is not set on this host. Recording will fail until
          it is.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary btn-record"
          data-live={live ? "true" : "false"}
          disabled={busy || keyConfigured === false}
          onClick={() => {
            if (live) void stopAndSend();
            else void start();
          }}
        >
          {status === "arming"
            ? "Arming mic"
            : status === "sending"
              ? "Sending"
              : live
                ? "Stop and print"
                : "Record"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy || live || keyConfigured === false}
          onClick={() => void runSample()}
        >
          Run sample take
        </button>
        <label className="btn btn-ghost cursor-pointer">
          Upload WAV
          <input
            type="file"
            accept="audio/wav,.wav"
            className="sr-only"
            disabled={busy || live}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!sendReady}
          onClick={() => void copySend()}
        >
          {copied ? "Copied" : "Copy send ready"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="micro">Language</span>
          <select
            className="min-h-11 border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-[14px]"
            value={language}
            disabled={live || busy}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          >
            {LANGUAGE_CODES.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="micro">Rewrite</span>
          <select
            className="min-h-11 border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-[14px]"
            value={preset}
            disabled={live || busy}
            onChange={(e) =>
              setPreset(e.target.value as (typeof REWRITE_PRESETS)[number]["id"])
            }
          >
            {REWRITE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="micro">Keyterms</span>
          <input
            className="min-h-11 border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 font-mono text-[13px]"
            placeholder="Foulcopy, AssemblyAI"
            value={keyterms}
            disabled={live || busy}
            onChange={(e) => setKeyterms(e.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="caption text-[var(--status-error)]" role="alert">
          {error}
        </p>
      ) : null}

      <ProofSheet result={result} pending={status === "sending"} />
    </div>
  );
}
