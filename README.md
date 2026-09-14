# Foulcopy

Speak once. See what you said and what you meant to send.

Foulcopy is a dictation pad on the [AssemblyAI Dictation API](https://www.assemblyai.com/docs/dictation). One utterance is posted as 16 kHz PCM (or a WAV file) to `POST https://dictation.assemblyai.com/v1/transcribe/live`. The pad prints both returns: `text` (verbatim) and `llm_response` (send ready).

## Judge path (under 90 seconds)

1. Open `/app`.
2. Press Record. Speak a messy sentence with an "um" and a self correction.
3. Press Stop and print.
4. Read the two columns. Copy send ready.

If the mic is blocked, Upload WAV accepts a 16-bit WAV under 120 seconds.

## Stack

Next.js 16 on Vercel. The browser never sees `ASSEMBLYAI_API_KEY`. `/api/dictate` forwards multipart config-then-audio. `/api/warm` hits `GET /warm`.

## Honesty

- Dictation is a separate service from AssemblyAI streaming STT. This app does not caption while you talk. Capture finishes, then one POST runs.
- Rewrite is best effort. A timeout still returns 200 with `text` and `llm_error`.
- The landing specimen is labeled. Live takes come from the API.
- GET `https://dictation.assemblyai.com/transcribe` returns 405. There is no public playground UI.

## Local

```bash
cp .env.example .env.local
# paste ASSEMBLYAI_API_KEY
bun install
bun run dev
```

Built by [Raphie](https://x.com/a_raphie) for Voice Hackathon Week.
