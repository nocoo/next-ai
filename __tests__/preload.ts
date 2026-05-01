// Test setup - mock server-only and AI SDK modules before any tests run.
import { vi } from "vitest";

// `server-only` throws in non-Next.js environments; stub it out for tests.
vi.mock("server-only", () => ({}));

// Mock AI SDK provider factories. Unit tests verify wiring without making
// real network calls — actual API calls are exercised in integration tests.
vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn((opts: { baseURL: string; apiKey: string }) => {
    const clientFn = vi.fn((model: string) => ({
      type: "anthropic",
      model,
      ...opts,
    }));
    return clientFn;
  }),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn((opts: { baseURL: string; apiKey: string }) => {
    const clientFn = vi.fn((model: string) => ({
      type: "openai",
      model,
      ...opts,
    }));
    return clientFn;
  }),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({
    text: "mocked response",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
  })),
  streamText: vi.fn(() => ({
    textStream: new ReadableStream({
      start(controller) {
        controller.enqueue("streamed ");
        controller.enqueue("response");
        controller.close();
      },
    }),
  })),
}));
