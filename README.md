# @nocoo/next-ai

<p align="center">
  <strong>Multi-provider AI integration for Next.js</strong><br>
  Configure · Connect · Create
</p>

![npm](https://img.shields.io/npm/v/@nocoo/next-ai)
![license](https://img.shields.io/npm/l/@nocoo/next-ai)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## What is this?

A unified AI provider integration library for Next.js that supports multiple LLM providers (Anthropic, OpenAI-compatible endpoints) with React components for configuration UI. Built on top of Vercel AI SDK.

## Features

**Multi-Provider Support** — Built-in support for Anthropic, MiniMax, GLM (Zhipu), AIHubMix, plus custom providers

**React Components** — Ready-to-use settings panel with provider selection, model picker, and API key management

**Storage Adapter Pattern** — Bring your own storage (API routes, database) via simple interface

**Server/Client Separation** — Sensitive AI client creation runs server-side only with `server-only` protection

## Installation

```bash
npm install @nocoo/next-ai
# or
bun add @nocoo/next-ai
```

## Quick Start

### 1. Implement Storage Adapter

```typescript
// lib/ai-adapter.ts
import type { AiStorageAdapter } from "@nocoo/next-ai";

export const aiAdapter: AiStorageAdapter = {
  async getSettings() {
    const res = await fetch("/api/settings/ai");
    return res.json();
  },
  async saveSettings(updates) {
    const res = await fetch("/api/settings/ai", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async testConnection() {
    const res = await fetch("/api/settings/ai/test", { method: "POST" });
    return res.json();
  },
};
```

### 2. Add Settings UI

```tsx
// app/settings/ai/page.tsx
"use client";

import { AiConfigProvider, AiSettingsPanel } from "@nocoo/next-ai/react";
import { aiAdapter } from "@/lib/ai-adapter";

export default function AiSettingsPage() {
  return (
    <AiConfigProvider adapter={aiAdapter}>
      <AiSettingsPanel />
    </AiConfigProvider>
  );
}
```

### 3. Use AI on Server

```typescript
// app/api/analyze/route.ts
import { resolveAiConfig, createAiModel } from "@nocoo/next-ai/server";
import { generateText } from "ai";

export async function POST(req: Request) {
  const settings = await loadUserSettings();
  const config = resolveAiConfig(settings);
  const model = createAiModel(config);
  
  const { text } = await generateText({
    model,
    prompt: "Your prompt here",
  });
  
  return Response.json({ result: text });
}
```

## Exports

| Entry Point | Import Path | Contents |
|-------------|-------------|----------|
| Main | `@nocoo/next-ai` | Types, constants, utilities |
| Server | `@nocoo/next-ai/server` | AI client creation (server-only) |
| React | `@nocoo/next-ai/react` | Components, hooks, context |

## Built-in Providers

| Provider | SDK Type | Default Model |
|----------|----------|---------------|
| Anthropic | anthropic | claude-sonnet-4-20250514 |
| MiniMax | anthropic | MiniMax-M2.5 |
| GLM (Zhipu) | anthropic | glm-5 |
| AIHubMix | openai | gpt-4o-mini |
| Custom | configurable | configurable |

## Custom Provider Registration

```typescript
import { AiProviderRegistry } from "@nocoo/next-ai";

const customRegistry = new AiProviderRegistry({
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    baseURL: "https://api.deepseek.com/v1",
    sdkType: "openai",
    models: ["deepseek-chat", "deepseek-coder"],
    defaultModel: "deepseek-chat",
  },
});
```

## License

[MIT](LICENSE) © 2026 nocoo
