// Test preload - mock server-only before any tests run
import { mock } from "bun:test";

// server-only throws in non-Next.js environments, mock it for tests
mock.module("server-only", () => ({}));

// Mock AI SDK modules for unit tests (actual calls only in integration tests)
mock.module("@ai-sdk/anthropic", () => ({
  createAnthropic: mock((opts: { baseURL: string; apiKey: string }) => {
    const clientFn = mock((model: string) => ({
      type: "anthropic",
      model,
      ...opts,
    }));
    return clientFn;
  }),
}));

mock.module("@ai-sdk/openai", () => ({
  createOpenAI: mock((opts: { baseURL: string; apiKey: string }) => {
    const clientFn = mock((model: string) => ({
      type: "openai",
      model,
      ...opts,
    }));
    return clientFn;
  }),
}));

mock.module("ai", () => ({
  generateText: mock(async () => ({
    text: "mocked response",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
  })),
  streamText: mock(() => ({
    textStream: new ReadableStream({
      start(controller) {
        controller.enqueue("streamed ");
        controller.enqueue("response");
        controller.close();
      },
    }),
  })),
}));
