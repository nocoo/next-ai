# @nocoo/next-ai

<p align="center">
  <strong>Multi-provider AI integration for Next.js and Vite</strong><br>
  Configure · Connect · Create
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nocoo/next-ai"><img src="https://img.shields.io/npm/v/@nocoo/next-ai" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@nocoo/next-ai"><img src="https://img.shields.io/npm/dm/@nocoo/next-ai" alt="npm downloads"></a>
  <a href="https://github.com/nicnocquee/next-ai/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@nocoo/next-ai" alt="license"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
</p>

---

## Overview

A unified AI provider integration library that supports multiple LLM providers (Anthropic, OpenAI-compatible endpoints) with React components for configuration UI. Works with **Next.js**, **Vite**, **vinext**, and other frameworks. Built on top of [Vercel AI SDK](https://sdk.vercel.ai/).

## Features

- **Multi-Provider Support** — Built-in support for Anthropic, MiniMax, GLM (Zhipu), AIHubMix, plus custom URL-based providers
- **Framework Agnostic** — Works with Next.js, Vite, vinext, and other React frameworks
- **React Components** — Ready-to-use settings panel with provider selection, model picker, and API key management
- **Storage Adapter Pattern** — Bring your own storage (API routes, database) via simple interface
- **Server/Client Separation** — Sensitive AI client creation runs server-side only
- **Prompt Templates** — Multi-section prompt system with Mustache-style variable substitution
- **Type-Safe** — Full TypeScript support with strict types

## Installation

```bash
npm install @nocoo/next-ai
# or
pnpm add @nocoo/next-ai
# or
bun add @nocoo/next-ai
```

### Peer Dependencies

```bash
npm install react react-dom tailwindcss
```

## Quick Start

### 1. Implement Storage Adapter

The adapter connects the UI to your backend storage. API keys should be stored server-side.

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
    // config.apiKey may be undefined - server should use stored key
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
      <AiSettingsPanel 
        onSaveSuccess={() => console.log("Settings saved!")}
        onTestSuccess={(result) => console.log("Test passed:", result)}
      />
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
  const settings = await loadUserSettings(); // Your storage logic
  const config = resolveAiConfig(settings);
  const model = createAiModel(config);
  
  const { text } = await generateText({
    model,
    prompt: "Your prompt here",
  });
  
  return Response.json({ result: text });
}
```

### 4. Test Connection Route

Handle test connection requests, supporting both new API keys and stored keys:

```typescript
// app/api/settings/ai/test/route.ts
import { validateTestConfig, resolveAiConfig, createAiModel } from "@nocoo/next-ai/server";
import { generateText } from "ai";
import type { AiTestConfig } from "@nocoo/next-ai";

export async function POST(req: Request) {
  const testConfig = (await req.json()) as AiTestConfig;
  
  // Validate test config (does not require apiKey)
  const errors = validateTestConfig(testConfig);
  if (errors.length > 0) {
    return Response.json({
      success: false,
      error: errors.map(e => e.message).join("; "),
    });
  }

  // Merge with stored apiKey if not provided in request
  const storedSettings = await loadUserSettings();
  const mergedConfig = {
    ...testConfig,
    apiKey: testConfig.apiKey || storedSettings.apiKey,
  };

  try {
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

## API Reference

### Entry Points

| Import Path | Contents | Environment |
|-------------|----------|-------------|
| `@nocoo/next-ai` | Types, constants, registry, utilities | Universal |
| `@nocoo/next-ai/server` | AI client, helpers, config resolvers | Server (universal) |
| `@nocoo/next-ai/server-next` | Same as `/server` with `server-only` guard | Server (Next.js only) |
| `@nocoo/next-ai/react` | Components, hooks, context | Client |

### Choosing a Server Entry Point

**Use `/server`** (recommended for most projects):
- Works with **Vite**, **vinext**, and other non-Next.js frameworks
- Works with **Next.js** (but without client-import protection)
- No additional dependencies required

**Use `/server-next`** (strict mode for Next.js):
- Adds `server-only` protection to prevent accidental client-side imports
- Only works in **Next.js App Router** projects
- Requires `server-only` as a peer dependency: `npm install server-only`

```typescript
// For Vite, vinext, or universal compatibility:
import { resolveAiConfig, createAiModel } from "@nocoo/next-ai/server";

// For Next.js App Router with strict protection:
import { resolveAiConfig, createAiModel } from "@nocoo/next-ai/server-next";
```

### Built-in Providers

| Provider | ID | SDK Type | Default Model |
|----------|-----|----------|---------------|
| Anthropic | `anthropic` | anthropic | claude-sonnet-4-20250514 |
| MiniMax | `minimax` | anthropic | MiniMax-M2.5 |
| GLM (Zhipu) | `glm` | anthropic | glm-5 |
| AIHubMix | `aihubmix` | openai | gpt-4o-mini |
| Custom | `custom` | configurable | configurable |

### Custom Provider Registration

```typescript
import { AiProviderRegistry } from "@nocoo/next-ai";
import { AiConfigProvider } from "@nocoo/next-ai/react";

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

// Use with provider
<AiConfigProvider adapter={adapter} registry={customRegistry}>
  <AiSettingsPanel />
</AiConfigProvider>
```

### Prompt Templates

Multi-section prompts with Mustache-style variable substitution:

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

// Build prompt with variables
const prompt = templates.build("daily-analysis", { date: "2024-01-15" });
// => "You are a productivity analyst.\n\nAnalyze data for 2024-01-15."

// Override specific sections
const customPrompt = templates.build(
  "daily-analysis",
  { date: "2024-01-15" },
  { role: "You are an expert analyst with 10 years experience." }
);
```

### Server Helpers

High-level AI helpers for common use cases:

```typescript
import { aiComplete, aiChat, aiStream, aiCompleteWithRetry } from "@nocoo/next-ai/server";

// Simple completion
const result = await aiComplete("Your prompt", {
  settings: userSettings,
  maxOutputTokens: 1000,
  temperature: 0.7,
});
console.log(result.text, result.usage, result.durationMs);

// Multi-turn chat
const chatResult = await aiChat([
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi!" },
  { role: "user", content: "How are you?" },
], { settings: userSettings });

// Streaming
const stream = await aiStream("Your prompt", { settings: userSettings });

// With automatic retry
const retryResult = await aiCompleteWithRetry("Your prompt", {
  settings: userSettings,
  retries: 3,
  retryDelay: 1000,
});
```

### React Components

#### AiSettingsPanel

Full settings panel with all configuration options:

```tsx
<AiSettingsPanel
  className="my-custom-class"
  onSaveSuccess={() => {}}
  onTestSuccess={(result) => {}}
  onTestError={(error) => {}}
  hideTestButton={false}
/>
```

#### Individual Components

```tsx
import {
  ProviderSelect,
  ModelSelect,
  ApiKeyInput,
  PromptTemplateSelector,
} from "@nocoo/next-ai/react";

// Provider dropdown
<ProviderSelect value={provider} onChange={setProvider} />

// Model dropdown with custom model support
<ModelSelect provider={provider} value={model} onChange={setModel} />

// Masked API key input
<ApiKeyInput value={apiKey} onChange={setApiKey} hasStoredKey={true} />
```

### Hooks

```typescript
import { useAiSettings, useAiTest, useProviderRegistry } from "@nocoo/next-ai/react";

// Settings management
const { settings, loading, saving, save, reload } = useAiSettings();

// Connection testing
const { test, testing, result, error } = useAiTest();

// Provider registry access
const registry = useProviderRegistry();
const providers = registry.getAll();
```

## Styling

Components use CSS variables following the Basalt design system. Add these to your global CSS:

```css
:root {
  --background: 220 14% 96%;
  --foreground: 220 9% 12%;
  --card: 220 14% 98%;
  --card-foreground: 220 9% 12%;
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14% 92%;
  --secondary-foreground: 220 9% 12%;
  --muted: 220 14% 92%;
  --muted-foreground: 220 9% 46%;
  --border: 220 14% 88%;
  --input: 220 14% 96%;
  --destructive: 0 84% 60%;
}

.dark {
  --background: 220 14% 10%;
  --foreground: 220 9% 94%;
  /* ... dark mode values */
}
```

Or generate programmatically:

```typescript
import { generateCssVariables } from "@nocoo/next-ai/react";

const lightVars = generateCssVariables("light");
const darkVars = generateCssVariables("dark");
```

## Security

- **API keys must be stored server-side** (database, environment variables)
- Client UI only handles input and displays masks
- For Next.js: use `@nocoo/next-ai/server-next` to prevent accidental client imports
- For other frameworks: ensure server modules are only imported in server-side code
- Never expose real API keys to the client

## TypeScript

All types are exported from the main entry:

```typescript
import type {
  AiConfig,
  AiSettingsInput,
  AiSettingsReadonly,
  AiTestConfig,
  AiTestResult,
  AiStorageAdapter,
  AiProviderInfo,
  AiConfigError,
  SdkType,
} from "@nocoo/next-ai";
```

## License

[MIT](LICENSE) © 2026 nocoo
