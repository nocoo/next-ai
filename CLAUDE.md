# @nocoo/next-ai

Multi-provider AI SDK wrapper (Anthropic / OpenAI-compatible) with React settings UI.
Profile: cli-library
Direction: [docs/README.md](docs/README.md). Frameworks must not rewrite this file.

## Sources of Truth

This file is the **contract**. Hooks, CI, and config are **enforcement**. If they disagree, that is a failure — raise enforcement to match this file; never lower the contract to a weaker hook.

| Fact | Where |
|---|---|
| Agent handbook | this file |
| Human docs | README.md, `docs/**` |
| Version | `package.json` `"version"` as `1.2.3`, display `v1.2.3` |
| Enforcement | `.husky/*`, `.github/workflows/ci.yml`, `vitest.config.ts`, `scripts/gate-security.ts` |
| Machine rules | global `AGENTS.md`, `rules/git-commit.md` |
| Accidents | [Retrospective.md](Retrospective.md) |
| Env files | optional `TEST_ANTHROPIC_API_KEY` for skipped integration tests — never commit values |

## Project Invariants

- AI client creation is server-side only (`server-only` / `src/server-next.ts`). Do not move secrets to client components.
- Storage is adapter-based; this library does not ship a database.
- `src/react/**` is UI; L1 coverage **excludes** it. React logic is not unit-tested; example Playwright is the UI path, not L1.
- Integration uses `TEST_ANTHROPIC_API_KEY` only (`skipIf` empty). Do not run live keyed APIs from this handbook. Not isolated L2.

## Stack / Layout

| Component | Choice |
|---|---|
| Language | TypeScript strict |
| Package manager | Bun (`bun.lock`) |
| Runtime | library for Next.js / Vite / vinext |
| Lint | Biome `--error-on-warnings` |
| Tests | Vitest L1 95%; optional `test:integration`; Playwright in `examples/*` |
| Data | none |

```
src/{core,react}  __tests__/{unit,integration}
examples/{next-app,vite-app}
scripts/gate-security.ts  tsup.config.ts
```

## Commands

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

## Verification

Status: `enforced` | `planned` | `manual` | `N/A`.
6DQ = L1/L2/L3 + G1/G2 + D1.
L1 requires statements/branches/functions/lines each ≥95%; no skipped or focused tests.

| Change | Proof | Status | Evidence |
|---|---|---|---|
| Logic | L1 Vitest ≥ 95% four metrics on library `src/**` excluding `src/react/**` | enforced (library only) | `vitest.config.ts` 95; pre-commit `test:coverage`; CI same. React/UI unit tests **planned** |
| API / schema | L2 real HTTP against a local app, 100% surface | planned | `__tests__/integration` is remote Anthropic via `TEST_ANTHROPIC_API_KEY`; pre-push `\|\| true` |
| UI path | L3 Playwright on example apps | enforced | CI `e2e-examples` next-app (`PORT` default 3100) / vite-app (5173+5174 mock) |
| Types / lint | G1 0 error, 0 warning | enforced | `biome check --error-on-warnings`; pre-commit lint+typecheck; CI |
| Deps / secrets | G2 osv-scanner + gitleaks; missing binary fails | enforced | pre-push `gate:security`; CI quality.yml default security |
| Test isolation | D1 isolated browser/mock-provider state and local-target guards | planned | Example E2E uses fresh Playwright contexts and local in-memory mock APIs. Optional integration still calls a remote provider when `TEST_ANTHROPIC_API_KEY` is supplied; complete offline-target enforcement is missing. SQLite/`_test_marker` are N/A because there is no database |
| Bundler output | `bun run build` (tsup) | enforced | CI `prepare-command`; `prepublishOnly` |
| Docs | docs/examples if public API changed | manual | human review |
| Release | npm `prepublishOnly` build | planned | no dedicated release workflow in-repo |

| Hook | Verifies | Budget | Runs |
|---|---|---|---|
| pre-commit | working-tree lint, typecheck, `test:coverage` (not index snapshot) | target <30s (unmeasured) | G1 → library L1 |
| pre-push | working-tree `test:integration` (`\|\| true`); `gate-security` on lockfile + `gitleaks detect` (not stdin refs) | target <3min (unmeasured) | G2; not a failing L2 |

Target: index-snapshot G1+L1; stdin push-ref L2+G2. Hooks check-only. `--no-verify` forbidden.

## Resources / Isolation

No Cloudflare Worker and no SQLite. Example E2E: next-app `PORT` (default 3100); vite-app mock 5174 + dev 5173. Do not store `TEST_ANTHROPIC_API_KEY`.

## Operations / Release

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
