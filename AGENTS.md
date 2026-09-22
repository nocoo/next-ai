# @nocoo/next-ai

Multi-provider AI SDK wrapper (Anthropic / OpenAI-compatible) with React settings UI.
Profile: cli-library
Direction: [docs/README.md](docs/README.md). Frameworks must not rewrite this file.

## Scope and instruction sources

- This file is the only project handbook; nested files do not compete with it. Do not create a `CLAUDE.md` alias or copy.
- This file is the contract; `.husky/*`, `.github/workflows/ci.yml`, `vitest.config.ts` and `scripts/gate-security.ts` are enforcement. If they disagree, that is a failure — raise enforcement to match this file; never lower the contract to a weaker hook.
- Human docs: [README.md](README.md) and `docs/**`. Version is `package.json` `"version"` as `1.2.3`, displayed `v1.2.3`. Optional `TEST_ANTHROPIC_API_KEY` env var enables otherwise-skipped integration tests — never commit values. Global machine rules live in the machine `AGENTS.md` and `rules/git-commit.md`.
- Accidents: [Retrospective.md](Retrospective.md).

## Project invariants

- AI client creation is server-side only (`server-only` / `src/server-next.ts`). Do not move secrets to client components.
- Storage is adapter-based; this library does not ship a database.
- `src/react/**` is UI; L1 coverage **excludes** it. React logic is not unit-tested; example Playwright is the UI path, not L1.
- Integration uses `TEST_ANTHROPIC_API_KEY` only (`skipIf` empty). Do not run live keyed APIs from this handbook. Not isolated L2.

## Setup and commands

TypeScript strict; Bun (`bun.lock`); library for Next.js / Vite / vinext; Biome `--error-on-warnings`; Vitest L1 95% plus optional `test:integration` and Playwright in `examples/*`; no data layer. Layout: `src/{core,react}`, `__tests__/{unit,integration}`, `examples/{next-app,vite-app}`, `scripts/gate-security.ts`, `tsup.config.ts`.

```bash
bun install
bun run typecheck           # tsc --noEmit
bun run lint                # biome check --error-on-warnings .
bun run build               # tsup
bun run test:coverage       # vitest unit --coverage (95% four metrics)
bun run test:integration    # skip unless TEST_ANTHROPIC_API_KEY is set; do not run for docs
bun run gate:security       # osv-scanner + gitleaks; missing binary fails
# examples after `bun run build` + per-app `bun install --frozen-lockfile --ignore-scripts`:
# next-app: webServer `bun run build && PORT=${PORT:-3100} bun run start`
# vite-app: mock :5174 (`bun run mock`) + Vite :5173 (`bun run dev`) then `bun run test:e2e`
```

## Testing and quality contract

6DQ keeps its name with unified L1, L2/L3, G2 and D1; the owner merged former G1 into L1 on 2026-09-21.
Unified L1 requires statements/branches/functions/lines each ≥95%; no skipped or focused tests; strict types and check-only lint/format with zero errors/warnings, installed hooks and failure rejection.
Statuses: `enforced` | `planned` | `manual` | `N/A`.

| Dimension | Required proof | Status | Evidence |
|---|---|---|---|
| L1 pre-commit quality | Four metrics ≥ 95% on library `src/**` excluding `src/react/**`, no skipped/focused tests, strict types and check-only lint with zero errors/warnings | planned (library-scope subchecks enforced) | `vitest.config.ts` 95; pre-commit `lint`+`typecheck`+`test:coverage`; CI same — these run on the working tree, so index-snapshot, <30s and rejection evidence are missing. React/UI unit tests **planned**, keeping complete unified L1 planned even for the library lane |
| L2 API | Real HTTP against a local app, 100% surface | planned | `__tests__/integration` is remote Anthropic via `TEST_ANTHROPIC_API_KEY`; pre-push `\|\| true` |
| L3 UI path | Playwright on example apps | enforced | CI `e2e-examples` next-app (`PORT` default 3100) / vite-app (5173+5174 mock) |
| G2 security | osv-scanner + gitleaks; missing binary fails | enforced | pre-push `gate:security`; CI quality.yml default security |
| D1 isolation | Isolated browser/mock-provider state and local-target guards | planned | Example E2E uses fresh Playwright contexts and local in-memory mock APIs. Optional integration still calls a remote provider when `TEST_ANTHROPIC_API_KEY` is supplied; complete offline-target enforcement is missing. SQLite/`_test_marker` are N/A because there is no database |
| Build | `bun run build` (tsup) | enforced | CI `prepare-command`; `prepublishOnly` |
| Docs | docs/examples if public API changed | manual | human review |
| Release | npm `prepublishOnly` build | planned | no dedicated release workflow in-repo |

| Hook | Verifies | Budget | Runs |
|---|---|---|---|
| pre-commit | working-tree lint, typecheck, `test:coverage` (not index snapshot) | target <30s (unmeasured) | unified-L1 subchecks, library scope |
| pre-push | working-tree `test:integration` (`\|\| true`); `gate-security` on lockfile + `gitleaks detect` (not stdin refs) | target <3min (unmeasured) | G2; not a failing L2 |

Target: index-snapshot unified L1; stdin push-ref L2+G2. Hooks check-only. `--no-verify` forbidden.

## Resources and isolation

No Cloudflare Worker and no SQLite. Example E2E: next-app `PORT` (default 3100); vite-app mock 5174 + dev 5173. Do not store `TEST_ANTHROPIC_API_KEY`.

## Operations / release

- Entry: `npm publish` after `prepublishOnly` build
- Auth: npm maintainers
- Before ship: CI quality + example e2e
- Runbook: README

## Retrospective

| Kind | Where |
|---|---|
| Accident narrative | [Retrospective.md](Retrospective.md) |
| Project-specific rule that will recur | one line here (cap ~10) |
| Cross-project lesson | nmem / global `AGENTS.md` / `rules/` |
| Deterministically checkable rule | hook or test, not prose |

- Do not treat a skipped `test:integration` as a passing L2 gate.
