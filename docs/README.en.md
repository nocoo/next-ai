<h1 align="center">next-ai</h1>
<p align="center">Multi-provider integration and settings UI for Next.js, Vite and React.</p>
<p align="center"><a href="../README.md">简体中文</a></p>

## What it does

`@nocoo/next-ai` builds on the Vercel AI SDK to unify provider configuration, model helpers and React settings UI. It supports Next.js, Vite, vinext and other frameworks; consumers supply their backend and database through a storage adapter.

## Features

- Built-in Anthropic, MiniMax, GLM and AIHubMix, plus custom URL-based providers.
- Provider/model selection, API-key input and connection-testing UI.
- Helpers for text generation, chat, streaming and retries.
- Multi-section prompt templates, variable substitution and custom provider registration.
- Separate browser/server entries with optional Next.js `server-only` protection.

## Usage

Requires Node.js 22+. Install the peer dependencies when using the React settings UI:

```sh
npm install @nocoo/next-ai
npm install react react-dom tailwindcss
```

Create models only on the server:

```typescript
import { resolveAiConfig, createAiModel } from "@nocoo/next-ai/server";

const apiKey = process.env.AI_API_KEY;
if (!apiKey) throw new Error("AI_API_KEY is required");
const config = resolveAiConfig({ provider: "anthropic", apiKey });
const model = createAiModel(config);
```

For Next.js App Router, use `@nocoo/next-ai/server-next` and install `server-only` to guard against client imports. Import React components from `@nocoo/next-ai/react`; `AiStorageAdapter` connects them to your backend. Keep API keys on the server; the client handles new input or masked values. See [integration](integration.md) for adapters, routes, UI and styling.

## Development

Install dependencies with Bun; tsup emits the package to `dist/`.

```sh
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run build
```

`src/core/` contains types, providers and templates, `src/server/` model helpers, and `src/react/` UI. Examples live in `examples/next-app/` and `examples/vite-app/`; build the library before installing each example’s dependencies.

## Tests

```sh
bun run test
bun run test:coverage
```

Vitest checks core library logic; example Playwright journeys verify React UI. Optional `bun run test:integration` calls a real model service only when `TEST_ANTHROPIC_API_KEY` is supplied. Normal local tests need no such credential. Each example README documents its test setup.

## Stack

| Technology | Role |
| --- | --- |
| TypeScript, tsup | Types and package builds |
| Vercel AI SDK | Provider adapters and model calls |
| React, Tailwind CSS | Settings UI |
| Bun, Biome | Dependencies and static checks |
| Vitest, Playwright | Core logic and example UI tests |

## Documentation

- [Full integration and API guide](integration.md).
- [Next.js example](../examples/next-app/README.md) and [Vite example](../examples/vite-app/README.md).
- [Public types](../src/core/types.ts) and [built-in provider configuration](../src/core/providers.ts).

## License

[MIT](../LICENSE)
