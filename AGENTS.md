# @nocoo/next-ai

Multi-provider AI SDK wrapper (Anthropic / OpenAI-compatible) with React settings UI for Next.js, Vite, and vinext.
Docs: [README.md](README.md) · [Docs Index](docs/README.md) · [Integration](docs/integration.md) · [Examples & E2E](docs/examples/01-examples-e2e.md) · [Retrospective](Retrospective.md)

## Commands

Run from root with TypeScript strict, Bun (`bun.lock`, CI Bun 1.4.2; `engines.node >=22`), Biome, tsup, and Vitest. Layout: `src/{core,server,react}`, `__tests__/{unit,integration}`, `examples/{next-app,vite-app}`, `scripts/gate-security.ts`, `tsup.config.ts`.

```sh
bun install --frozen-lockfile
bun run typecheck           # S1: tsc --noEmit
bun run lint                # S2: biome check --error-on-warnings .
bun run build               # B1: tsup ESM bundles -> dist/
bun run test:coverage       # L1: Vitest v8 >=95% (4 metrics)
bun run test:integration    # optional live Anthropic; skips unless TEST_ANTHROPIC_API_KEY is set
bun run gate:security       # G1+G2: osv-scanner + gitleaks; missing binary fails
```

Example E2E (`L4`): run `bun run build` at root, then in `examples/next-app` or `examples/vite-app` run `bun install --frozen-lockfile --ignore-scripts` and `bun run test:e2e`.

## Invariants

- Server-only secrets: create AI models only on the server (`./server` or Next.js `./server-next` / `src/server-next.ts` with `server-only`); never move secrets to `./react` client components.
- Adapter-based & ESM-only: ships no database (`AiStorageAdapter` is consumer-provided) and emits ESM-only exports (`.`, `./server`, `./server-next`, `./react` with `"use client"` banner).
- Version source: `package.json` `"version"` is authoritative (`1.2.3`, displayed `v1.2.3`).
- Coverage boundary: `L1` excludes `src/react/**`, `src/react.ts`, `src/server-next.ts`, `src/core/types.ts`, and barrels (`src/index.ts`, `src/server.ts`); React UI is verified by example Playwright E2E.
- Integration guard: `test:integration` uses `TEST_ANTHROPIC_API_KEY` (`skipIf` empty); skip for docs/routine work, never store keys, and never treat a skip as passing `L2`/`L3`.
- Clean example reinstalls: local `file:../../` installs in `examples/*` can fail incrementally in Bun (`ENOENT`); move `node_modules` aside and run a fresh frozen install when updating.
- Release gate: `npm publish` (triggers `prepublishOnly` build) requires explicit authorization, npm maintainer auth, green CI (`quality / Z1: Gate`), and passing example E2E; see [README.md](README.md).

## Quality & Local Gates

Follows `system1-quality`; CI runs `.github/workflows/pipeline.yml` -> `.github/workflows/quality-slots.yml` (`quality / Z1: Gate` required on `main`, pinned `base-ci` `v2026.24`), with no automated CD workflow (local `npm publish` only). Status vocabulary: `enforced`, `planned`, `manual`, `N/A`.

- **Exceptions / gaps**: `L2 Runtime` is `N/A` (not a Cloudflare Worker); `L3 Integration` is `N/A` (remote keyed Anthropic only, not CI-local); `P1 Package` is `planned` (`publint`/`attw` not wired).
- **Enforcement contract**: `.husky/*`, `.github/workflows/quality-slots.yml`, `vitest.config.ts`, and `scripts/gate-security.ts` enforce this file; if they disagree, raise enforcement, never weaken the contract.
- **Local hooks**: installed via `bun run prepare` (`.husky/`); hooks are check-only and `--no-verify` is forbidden.
- **pre-commit**: snapshots staged index (`git checkout-index --all`, cleaned on exit), checks `package.json`/`bun.lock` match worktree, symlinks `node_modules`, runs `typecheck`, `lint`, `test:coverage` (`<30s`).
- **pre-push**: runs working-tree `test:integration || true` and `scripts/gate-security.ts` (`osv-scanner` + `gitleaks detect`; gap: scans working tree instead of stdin push-refs; `<3min` target).

## Resources & Isolation

No Cloudflare Worker or SQLite database. Example E2E runs isolated in-memory mock servers (see [01-examples-e2e.md](docs/examples/01-examples-e2e.md)):

| Surface             | Endpoint / Env                                               | Boundary                                                                       |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `examples/next-app` | `PORT` (default `3100`)                                      | `bun run build && PORT=${PORT:-3100} bun run start` via Playwright `webServer` |
| `examples/vite-app` | Mock `:5174` (`bun run mock`) + Vite `:5173` (`bun run dev`) | In-memory mock API only; no upstream LLM calls                                 |
| Live integration    | `TEST_ANTHROPIC_API_KEY` (unset by default)                  | Remote Anthropic API; never commit, store, or treat as CI gate                 |

## Retrospective

Record incident narratives in [Retrospective.md](Retrospective.md); promote recurring project constraints to `Invariants` above and enforceable safeguards to tests/hooks.
