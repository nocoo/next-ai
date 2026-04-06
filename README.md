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
import type { AiStorageAdapter, AiTestConfig } from "@nocoo/next-ai";

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
  async testConnection(config: AiTestConfig) {
    // config.apiKey may be undefined - server should use stored key in that case
    const res = await fetch("/api/settings/ai/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
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

### 4. Test Connection Route (using stored API key)

```typescript
// app/api/settings/ai/test/route.ts
import { resolveAiConfig, createAiModel } from "@nocoo/next-ai/server";
import { generateText } from "ai";
import type { AiTestConfig } from "@nocoo/next-ai";

export async function POST(req: Request) {
  const testConfig = (await req.json()) as AiTestConfig;
  
  // If apiKey is not provided in request, use stored key
  const storedSettings = await loadUserSettings();
  const mergedConfig = {
    ...testConfig,
    apiKey: testConfig.apiKey || storedSettings.apiKey,
  };

  try {
    // Use allowMissingApiKey: false since we've merged the key above
    const resolved = resolveAiConfig(mergedConfig);
    const model = createAiModel(resolved);

    const { text } = await generateText({
      model,
      prompt: "Reply with exactly: OK",
      maxOutputTokens: 10,
    });

    return Response.json({
      success: text.includes("OK"),
      model: resolved.model,
      provider: resolved.provider,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
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

## Prompt Templates

Register and build multi-section prompts with variable substitution:

```typescript
import { PromptTemplateRegistry } from "@nocoo/next-ai";

const templates = new PromptTemplateRegistry();

templates.register({
  id: "daily-analysis",
  name: "Daily Analysis",
  sections: [
    { id: "role", label: "Role", content: "You are a productivity analyst." },
    { id: "task", label: "Task", content: "Analyze data for {{date}}." },
  ],
  variables: [
    { key: "date", label: "Date", required: true },
  ],
});

const prompt = templates.build("daily-analysis", { date: "2024-01-15" });
// => "You are a productivity analyst.\n\nAnalyze data for 2024-01-15."
```

## Server Helpers

High-level AI helpers for common use cases:

```typescript
import { aiComplete, aiChat, aiStream } from "@nocoo/next-ai/server";

// Simple completion
const result = await aiComplete("Your prompt", {
  settings: userSettings,
  maxOutputTokens: 1000,
});

// Multi-turn chat
const result = await aiChat([
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi!" },
  { role: "user", content: "How are you?" },
], { settings: userSettings });

// Streaming
const stream = await aiStream("Your prompt", { settings: userSettings });
```

## CSS Variables

Components use Basalt design system CSS variables. Generate them with:

```typescript
import { generateCssVariables } from "@nocoo/next-ai/react";

const lightVars = generateCssVariables("light");
const darkVars = generateCssVariables("dark");
```

## License

[MIT](LICENSE) © 2026 nocoo
