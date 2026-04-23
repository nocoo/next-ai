# Examples + E2E Test Design

Status: Draft
Owner: SDK maintainers
Related: `src/react.ts`, `src/server-next.ts`, `README.md`

## 1. Overview

This document describes two example applications that consume the
`@nocoo/next-ai` SDK and the Playwright E2E test strategy that runs against
both. The goals are:

- Provide minimal, working integration examples for the two main consumer
  environments the SDK targets: **Next.js (App Router)** and **Vite + React**.
- Exercise the public React surface (`AiSettingsPanel`, sub-components,
  hooks, `AiConfigProvider`, CSS token output) end-to-end against a real
  browser.
- Catch regressions in the rendered UI, the storage-adapter contract, and
  the test-connection flow before they reach published versions.

The examples are not production templates. They use in-memory mock APIs and
never make a real call to an upstream LLM provider. Real provider calls are
covered by unit/integration tests under `__tests__/` in the SDK root.

## 2. Directory Structure

```
examples/
├── next-app/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   ├── settings/
│   │   │   └── ai/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── settings/
│   │           └── ai/
│   │               ├── route.ts
│   │               └── test/
│   │                   └── route.ts
│   ├── lib/
│   │   └── ai-adapter.ts
│   ├── e2e/
│   │   ├── settings-panel.spec.ts
│   │   ├── custom-provider.spec.ts
│   │   └── test-connection.spec.ts
│   ├── playwright.config.ts
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
└── vite-app/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── ai-adapter.ts
    │   └── mock-server.ts
    ├── e2e/
    │   ├── settings-panel.spec.ts
    │   ├── custom-provider.spec.ts
    │   └── test-connection.spec.ts
    ├── index.html
    ├── playwright.config.ts
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json
    └── package.json
```

### 2.1 next-app

- **Next.js 15 App Router** project, React 19, TypeScript.
- `app/layout.tsx` — root layout. Injects CSS variables produced by
  `generateCssVariables("light")` (and optionally `generateCssVariables("dark")`
  scoped under a `.dark` selector) into a `<style>` tag in `<head>`.
- `app/page.tsx` — landing page with a single link to `/settings/ai`.
- `app/settings/ai/page.tsx` — client component that wraps
  `<AiSettingsPanel />` in `<AiConfigProvider adapter={...}>`. The adapter
  is constructed from `lib/ai-adapter.ts`.
- `app/api/settings/ai/route.ts` — `GET` and `PUT` handlers backed by an
  in-memory module-scoped object.
- `app/api/settings/ai/test/route.ts` — `POST` handler that validates the
  body against the `AiTestConfig` shape and returns a deterministic success
  payload.
- `lib/ai-adapter.ts` — implements `AiStorageAdapter` using `fetch` against
  the local API routes.

Runtime dependencies:

- `@nocoo/next-ai`: `file:../../`
- `next`, `react`, `react-dom`, `server-only`

Dev dependencies:

- `@playwright/test`, `typescript`, `@types/node`, `@types/react`,
  `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`.

The SDK's React components are styled with Tailwind utility classes, so
the example must set up Tailwind:

- `tailwind.config.ts` — sets `content` to include the example's own
  `app/**/*.{ts,tsx}` plus the SDK distribution path
  (`../../dist/**/*.{js,mjs}`) so utility classes used inside SDK
  components are not purged.
- `app/globals.css` — contains the Tailwind directives
  (`@tailwind base; @tailwind components; @tailwind utilities;`) and is
  imported from `app/layout.tsx`.

### 2.2 vite-app

- **Vite + React 19** project, TypeScript.
- `src/main.tsx` — React entry, mounts `<App />` into `#root`.
- `src/App.tsx` — wraps `<AiSettingsPanel />` in `<AiConfigProvider>`.
- `src/ai-adapter.ts` — `AiStorageAdapter` implementation that talks to
  the local mock server via `fetch`.
- `src/mock-server.ts` — tiny Node `http` server (no Express, no extra
  deps) that mirrors the Next.js mock API. Started by Playwright's
  `webServer` config alongside Vite's dev server.
- `index.html` — Vite entry. Injects CSS variables either via a
  `<style>` tag in `<head>` populated from `generateCssVariables("light")`,
  or via a top-level effect in `App.tsx` (whichever is simpler at
  implementation time — both are valid).
- `vite.config.ts` — uses `@vitejs/plugin-react` and proxies
  `/api/*` requests to the mock server on port 5174 so the adapter can
  use relative URLs:

  ```ts
  // examples/vite-app/vite.config.ts
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": "http://localhost:5174",
      },
    },
  });
  ```

Runtime dependencies:

- `@nocoo/next-ai`: `file:../../`
- `react`, `react-dom`

Dev dependencies:

- `vite`, `@vitejs/plugin-react`, `@playwright/test`, `typescript`,
  `@types/react`, `@types/react-dom`, `@types/node`, `tailwindcss`,
  `postcss`, `autoprefixer`.

Tailwind setup mirrors the Next.js app:

- `tailwind.config.ts` — `content` covers `index.html`,
  `src/**/*.{ts,tsx}`, and the SDK dist path
  (`../../dist/**/*.{js,mjs}`).
- `src/index.css` — Tailwind directives, imported once from `main.tsx`.

## 3. Mock API Design

Both applications expose the same three endpoints with identical
behaviour. State is held in a module-scoped object and is reset whenever
the server process restarts (i.e. between test runs in CI).

### Default state

```ts
let settings: AiSettingsReadonly = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  hasApiKey: false,
};
```

### `GET /api/settings/ai`

Returns the current `AiSettingsReadonly` as JSON. Never returns the raw
API key — only the `hasApiKey: boolean` flag.

### `PUT /api/settings/ai`

Accepts `Partial<AiSettingsInput>` in the JSON body. Merges into the
in-memory state. If `apiKey` is provided and non-empty, sets
`hasApiKey = true` and stores the key in a separate in-memory variable
that is never returned. Returns the updated `AiSettingsReadonly`.

### `POST /api/settings/ai/test`

Accepts an `AiTestConfig` body. Returns:

```ts
{
  success: true,
  model: body.model,
  provider: body.provider,
}
```

No upstream call is made. The endpoint exists purely to verify the
client wiring.

### Sample Next.js handler

```ts
// app/api/settings/ai/route.ts
import type { AiSettingsInput, AiSettingsReadonly } from "@nocoo/next-ai";
import { NextResponse } from "next/server";

let state: AiSettingsReadonly = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  hasApiKey: false,
};
let apiKey = "";

export async function GET() {
  return NextResponse.json(state);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Partial<AiSettingsInput>;
  if (typeof body.apiKey === "string" && body.apiKey.length > 0) {
    apiKey = body.apiKey;
  }
  const { apiKey: _omit, ...rest } = body;
  state = { ...state, ...rest, hasApiKey: apiKey.length > 0 };
  return NextResponse.json(state);
}
```

### Sample storage adapter

```ts
// lib/ai-adapter.ts
import type {
  AiSettingsInput,
  AiSettingsReadonly,
  AiStorageAdapter,
  AiTestConfig,
  AiTestResult,
} from "@nocoo/next-ai";

export const aiAdapter: AiStorageAdapter = {
  async getSettings(): Promise<AiSettingsReadonly> {
    const res = await fetch("/api/settings/ai");
    return res.json();
  },
  async saveSettings(
    input: Partial<AiSettingsInput>,
  ): Promise<AiSettingsReadonly> {
    const res = await fetch("/api/settings/ai", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.json();
  },
  async testConnection(cfg: AiTestConfig): Promise<AiTestResult> {
    const res = await fetch("/api/settings/ai/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cfg),
    });
    return res.json();
  },
};
```

## 4. E2E Test Cases

Test files live under `e2e/` in each example app. Both apps run the same
scenarios against their respective mock APIs.

### 4.1 `settings-panel.spec.ts` — provider, model, API key, save

| # | Test | Expectation |
|---|------|-------------|
| 1 | Default provider on load | Provider select shows `anthropic`. |
| 2 | Switching provider updates model dropdown | Selecting `aihubmix` repopulates the model `<select>` with that provider's models from the registry (e.g. `gpt-4o-mini`). |
| 3 | API key field is masked | `<input type="password">` (or equivalent), value is not visible in DOM as plain text. |
| 4 | "Stored" indicator after save | After saving with a non-empty key, on next load the panel renders the muted helper text "API key is set. Enter a new key to update it." beneath the API key field. |
| 5 | Save calls PUT and triggers success callback | Network capture asserts `PUT /api/settings/ai` was called once. The panel itself shows no inline save-success badge — assert via the `onSaveSuccess` prop (wire a sentinel DOM node in the host page that flips on callback) and the cleared API key input. |
| 6 | Reload preserves saved settings | After reload, panel reflects the most recent saved provider/model. |

### 4.2 `custom-provider.spec.ts` — custom provider flow

| # | Test | Expectation |
|---|------|-------------|
| 1 | Selecting `custom` reveals extra fields | `baseURL` and `sdkType` inputs become visible. |
| 2 | Custom config persists | Fill `baseURL`, `sdkType`, `model`, `apiKey`; save; reload; all values are restored from the mock API. |

### 4.3 `test-connection.spec.ts` — connection test

| # | Test | Expectation |
|---|------|-------------|
| 1 | Test button calls POST endpoint | Network capture asserts `POST /api/settings/ai/test`. |
| 2 | Success result displays model | UI renders the green "✓ Connection successful" badge with the returned model name in parentheses (e.g. `(claude-sonnet-4-20250514)`). The panel does not display the provider string in the badge — the model is the only echoed value. |

### 4.4 Optional: dark mode

If the panel responds to a `prefers-color-scheme` or class-based dark
mode trigger, add a `dark-mode.spec.ts`:

| # | Test | Expectation |
|---|------|-------------|
| 1 | Dark class swaps tokens | Toggling the dark class on `<html>` causes the computed unprefixed CSS variables emitted by `generateCssVariables` (e.g. `--background`, `--card-foreground`, `--border`) to change between the `light` and `dark` token sets. |

### 4.5 Sample Playwright config

```ts
// examples/next-app/playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "bun run start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

```ts
// examples/vite-app/playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:5173" },
  webServer: [
    {
      command: "bun run mock",
      port: 5174,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun run dev",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

## 5. SDK Linking Strategy

Each example app declares the SDK as a local file dependency:

```json
{
  "dependencies": {
    "@nocoo/next-ai": "file:../../"
  }
}
```

This resolves to a symlink into the SDK root, so the example consumes
the contents of `dist/`. The SDK **must** be built before either example
is installed or run:

```bash
# from repo root
bun install
bun run build

# then per example
cd examples/next-app && bun install && bun run build
cd examples/vite-app && bun install && bun run build
```

Notes:

- The SDK's `package.json` `exports` map points all subpaths
  (`.`, `./server`, `./server-next`, `./react`) into `dist/`. A stale
  build will produce confusing import-time errors in the examples.
- The examples never import from `src/` directly. Treat them as external
  consumers.

## 6. CI Integration

Add a new job to `.github/workflows/ci.yml` that runs after the existing
`quality` job (which lints, type-checks, and builds the SDK).

```yaml
e2e-examples:
  needs: quality
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
    matrix:
      app: [next-app, vite-app]
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v2
    - run: bun install
    - run: bun run build
    - run: bun install
      working-directory: examples/${{ matrix.app }}
    - if: matrix.app == 'next-app'
      run: bun run build
      working-directory: examples/${{ matrix.app }}
    - run: bunx playwright install --with-deps chromium
      working-directory: examples/${{ matrix.app }}
    - run: bunx playwright test
      working-directory: examples/${{ matrix.app }}
    - if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-${{ matrix.app }}
        path: examples/${{ matrix.app }}/playwright-report
        retention-days: 7
```

## 7. What This Does NOT Cover

- **No real provider calls.** The test endpoint always returns success and
  the SDK's actual `aiComplete` / `aiChat` / `aiStream` paths are not
  exercised here. Server-side correctness is the responsibility of the
  unit tests under `__tests__/`.
- **No persistence.** State lives in process memory; restarting the
  server resets all settings.
- **No authentication.** Anyone who can reach the mock API can read/write
  the settings.
- **No prompt template UI tests.** `PromptTemplateSelector` coverage may
  be added in a follow-up document; it is intentionally out of scope here
  to keep the first iteration small.
- **No visual regression tests.** Only behaviour and DOM/network
  assertions; pixel diffs are out of scope.

## 8. Atomic Commit Plan

1. `docs: add examples E2E design document`
   - Adds `docs/examples/01-examples-e2e.md`.
2. `docs: add docs/README.md index`
   - Adds `docs/README.md` with a link to this document.

Implementation of the example apps and CI wiring is tracked separately
and will land in its own commits once this design is approved.
