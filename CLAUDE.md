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
| Env files | integration tests may need provider keys — never commit values |

## Project Invariants

- AI client creation is server-side only (`server-only` / `src/server-next.ts`). Do not move secrets to client components.
- Storage is adapter-based; this library does not ship a database.
- `src/react/**` is UI; L1 coverage excludes it by design (browser/E2E).
- Integration tests hit real provider APIs when keys exist; they are not a substitute for isolated L2.

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
bun run test:integration    # vitest.integration.config.ts (real APIs; may skip)
bun run gate:security       # scripts/gate-security.ts (osv-scanner + gitleaks; missing binary fails)
# examples (after bun run build):
cd examples/next-app && bun install --frozen-lockfile --ignore-scripts && bun run test:e2e
```

## Verification

Status: `enforced` | `planned` | `manual` | `N/A`.
6DQ = L1/L2/L3 + G1/G2 + D1.

| Change | Proof | Status | Evidence |
|---|---|---|---|
| Logic | L1 Vitest ≥ 95% four metrics on `src/**` (exclusions listed in vitest.config.ts) | enforced | pre-commit `test:coverage`; CI same |
| API / schema | L2 real HTTP against a local app, 100% library surface | planned | `test:integration` hits **remote** providers and pre-push uses `\|\| true` skip |
| UI path | L3 Playwright on example apps | enforced | CI `e2e-examples` matrix next-app / vite-app |
| Types / lint | G1 0 error, 0 warning | enforced | pre-commit lint+typecheck; CI |
| Deps / secrets | G2 osv-scanner + gitleaks; missing binary fails | enforced | pre-push `gate:security`; CI quality.yml default security |
| Test isolation | D1 examples/L3 local; no prod keys in fixtures | planned | integration uses live providers when keyed; no per-run SQLite (library has none) |
| Bundler output | `bun run build` (tsup) | enforced | CI `prepare-command`; `prepublishOnly` |
| Docs | docs/examples if public API changed | manual | human review |
| Release | npm `prepublishOnly` build | planned | no dedicated release workflow in-repo |

| Hook | Verifies | Budget | Runs |
|---|---|---|---|
| pre-commit | lint, typecheck, test:coverage | <30s | G1 → L1 |
| pre-push | integration **allowed to skip**; gate-security must pass | <3min | G2; not a failing L2 |

Hooks check-only. `--no-verify` forbidden.

## Resources / Isolation

No Cloudflare Worker. Example E2E uses local app servers. Do not store provider tokens in the repo.

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
