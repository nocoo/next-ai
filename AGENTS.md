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

Quality follows `system1-quality` (v1.3.0) with 12 canonical slots (`impl`, `todo`, `na`) and `nocoo/base-ci` v2026.15 (`777bbe4f9bacab8a91d8c01974480a6ee23d28e0`) in native mode (`quality-slots.yml`).

| Slot             | Required proof                                                                           | Status            | Evidence                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| S1: Types        | Strict TypeScript (`bun run typecheck`)                                                  | enforced (`impl`) | Husky index snapshot & CI `s1-types`                                       |
| S2: Lint         | Biome check-only (`bun run lint`), no `.skip`/`.only`                                    | enforced (`impl`) | Husky index snapshot & CI `s2-lint`                                        |
| S3: Workflow     | `actionlint` + 40-char SHA pinning                                                       | enforced (`impl`) | CI `s3-workflow`                                                           |
| G1: Secrets      | Gitleaks scan (`.gitleaks.toml`)                                                         | enforced (`impl`) | Pre-push `gate:security` & CI `g1-secrets`                                 |
| G2: Dependencies | `osv-scanner` on `bun.lock`                                                              | enforced (`impl`) | Pre-push `gate:security` & CI `g2-dependencies`                            |
| B1: Build        | `bun run build` (tsup)                                                                   | enforced (`impl`) | `prepublishOnly` & CI `b1-build`                                           |
| L1: Unit         | Vitest v8 (`>=95%` statements/branches/functions/lines on `src/**` excl. `src/react/**`) | enforced (`impl`) | Husky index snapshot (`test:coverage`, warm **~3s**) & CI `l1-unit`        |
| L2: Runtime      | Cloudflare Worker / workerd runtime suite                                                | N/A (`na`)        | Non-Cloudflare Worker project                                              |
| L3: Integration  | Local HTTP API integration                                                               | N/A (`na`)        | Remote Anthropic integration (`TEST_ANTHROPIC_API_KEY`) only; not CI-local |
| L4: E2E          | Playwright on example apps (`next-app` / `vite-app`)                                     | enforced (`impl`) | CI `l4-e2e`                                                                |
| P1: Package      | `publint` / `attw` or `ci:package`                                                       | planned (`todo`)  | Not yet wired into CI                                                      |
| Z1: Gate         | Aggregate all `impl` slots & SHA consistency                                             | enforced (`impl`) | CI `z1-gate` (`quality / Z1: Gate`)                                        |

| Hook       | Verifies                                                                                                        | Budget                              | Runs                                |
| ---------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| pre-commit | index-snapshot `typecheck`, `lint`, `test:coverage`; staged lockfiles must match install                        | target <30s (warm **~3s** measured) | S1, S2, L1 subchecks, library scope |
| pre-push   | working-tree `test:integration` (`\|\| true`); `gate-security` on lockfile + `gitleaks detect` (not stdin refs) | target <3min (unmeasured)           | G1, G2                              |

Current pre-commit materialises the Git index (`git checkout-index --all`), symlinks worktree `node_modules`, then runs check-only `typecheck`, `lint`, and `test:coverage` inside the snapshot; owned temp dirs are removed on exit or signal. Target: index-snapshot L1 <30s; stdin push-ref G2 <3min. Hooks check-only. `--no-verify` forbidden. CI runs `.github/workflows/ci.yml` -> `./.github/workflows/quality-slots.yml`, gated on `quality / Z1: Gate`.

## Resources and isolation

No Cloudflare Worker and no SQLite. Example E2E: next-app `PORT` (default 3100); vite-app mock 5174 + dev 5173. Do not store `TEST_ANTHROPIC_API_KEY`.

## Operations / release

- Entry: `npm publish` after `prepublishOnly` build
- Auth: npm maintainers
- Before ship: CI quality + example e2e
- Runbook: README

## Retrospective

| Kind                                  | Where                                |
| ------------------------------------- | ------------------------------------ |
| Accident narrative                    | [Retrospective.md](Retrospective.md) |
| Project-specific rule that will recur | one line here (cap ~10)              |
| Cross-project lesson                  | nmem / global `AGENTS.md` / `rules/` |
| Deterministically checkable rule      | hook or test, not prose              |

- Do not treat a skipped `test:integration` as a passing L2 gate.
