<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Foulcopy agent rules

Next.js 16 App Router. `bun` only. Vercel host. Dictation key is server-only.

## Decision defaults
Least surprising reversible option. Stop only for: deleting data, publishing, spending, force-push, changing auth, or clicking Submit on the Google Form.

## Self-questioning
State assumptions at the start of a task. If an assumption would change the approach and the repo can settle it, settle it first.

## Research-first
Never edit a file you have not read this session. Before claiming the Dictation API does X, cite `lib/dictation.ts` or AssemblyAI docs.

## Wrongness detection
Do not claim done without a passing `bun run build` or a live POST that returned `text`. After a fix, re-run the original failure.

## Don't go in blind
Explore, short plan, then edit. The product is the spoken vs send-ready DIFF. Do not turn this into a notes app.

## Stop conditions
- Do not commit `.env*` or `ASSEMBLYAI_API_KEY`.
- Do not put the key in client code.
- Do not click the hackathon Submit button. Stage the form and wait.
- Do not add Railway or a persistent process.

## Persistence
`git status` before work. Commit after each working slice. Log one line to this file or README only when the fact is not already in git.

## Commands
- `bun run dev`
- `bun run build`
- `bun scripts/make-fixture-wav.ts`
