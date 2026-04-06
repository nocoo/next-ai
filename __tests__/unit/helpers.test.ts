import { describe, expect, test } from "bun:test";
import {
  aiChat,
  aiComplete,
  aiCompleteWithRetry,
  aiStream,
} from "../../src/server/helpers";

const TEST_SETTINGS = {
  provider: "anthropic",
  apiKey: "sk-test",
  model: "claude-sonnet-4-20250514",
};

describe("aiComplete", () => {
  test("generates text with prompt", async () => {
    const result = await aiComplete("Hello", { settings: TEST_SETTINGS });

    expect(result.text).toBe("mocked response");
  });

  test("returns usage statistics", async () => {
    const result = await aiComplete("Hello", { settings: TEST_SETTINGS });

    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    });
  });

  test("returns duration in milliseconds", async () => {
    const result = await aiComplete("Hello", { settings: TEST_SETTINGS });

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("aiChat", () => {
  test("generates text with messages", async () => {
    const messages = [
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi!" },
      { role: "user" as const, content: "How are you?" },
    ];

    const result = await aiChat(messages, { settings: TEST_SETTINGS });

    expect(result.text).toBe("mocked response");
  });

  test("returns usage statistics", async () => {
    const result = await aiChat([{ role: "user", content: "Hi" }], {
      settings: TEST_SETTINGS,
    });

    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    });
  });

  test("returns duration in milliseconds", async () => {
    const result = await aiChat([{ role: "user", content: "Hi" }], {
      settings: TEST_SETTINGS,
    });

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("aiStream", () => {
  test("returns a readable stream", async () => {
    const stream = await aiStream("Hello", { settings: TEST_SETTINGS });

    expect(stream).toBeInstanceOf(ReadableStream);
  });

  test("stream contains text chunks", async () => {
    const stream = await aiStream("Hello", { settings: TEST_SETTINGS });
    const reader = stream.getReader();

    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    expect(chunks).toEqual(["streamed ", "response"]);
  });
});

describe("aiCompleteWithRetry", () => {
  test("succeeds on first attempt with valid config", async () => {
    const result = await aiCompleteWithRetry("Hello", {
      settings: TEST_SETTINGS,
      retries: 3,
    });

    expect(result.text).toBe("mocked response");
  });
});
