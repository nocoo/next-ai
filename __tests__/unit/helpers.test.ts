import { generateText } from "ai";
import { type Mock, describe, expect, test } from "vitest";
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

  test("throws error when retries is less than 1", async () => {
    await expect(
      aiCompleteWithRetry("Hello", {
        settings: TEST_SETTINGS,
        retries: 0,
      }),
    ).rejects.toThrow("retries must be at least 1");
  });

  test("throws error when retries is negative", async () => {
    await expect(
      aiCompleteWithRetry("Hello", {
        settings: TEST_SETTINGS,
        retries: -1,
      }),
    ).rejects.toThrow("retries must be at least 1");
  });

  test("throws last error after all retries fail", async () => {
    const mockedGenerateText = generateText as unknown as Mock;
    const originalImpl = mockedGenerateText.getMockImplementation();
    let callCount = 0;
    mockedGenerateText.mockImplementation(async () => {
      callCount++;
      throw new Error(`failure ${callCount}`);
    });

    try {
      await expect(
        aiCompleteWithRetry("Hello", {
          settings: TEST_SETTINGS,
          retries: 3,
          retryDelay: 1,
        }),
      ).rejects.toThrow("failure 3");
      expect(callCount).toBe(3);
    } finally {
      mockedGenerateText.mockImplementation(
        originalImpl ??
          (async () => ({
            text: "mocked response",
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          })),
      );
    }
  });

  test("succeeds after retrying past initial failures", async () => {
    const mockedGenerateText = generateText as unknown as Mock;
    const originalImpl = mockedGenerateText.getMockImplementation();
    let callCount = 0;
    mockedGenerateText.mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error(`transient ${callCount}`);
      }
      return {
        text: "recovered",
        usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
      };
    });

    try {
      const result = await aiCompleteWithRetry("Hello", {
        settings: TEST_SETTINGS,
        retries: 5,
        retryDelay: 1,
      });
      expect(result.text).toBe("recovered");
      expect(callCount).toBe(3);
    } finally {
      mockedGenerateText.mockImplementation(
        originalImpl ??
          (async () => ({
            text: "mocked response",
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          })),
      );
    }
  });

  test("uses incremental backoff between retries", async () => {
    const mockedGenerateText = generateText as unknown as Mock;
    const originalImpl = mockedGenerateText.getMockImplementation();
    const attemptTimes: number[] = [];
    mockedGenerateText.mockImplementation(async () => {
      attemptTimes.push(Date.now());
      throw new Error("always fails");
    });

    const retryDelay = 50;
    try {
      await expect(
        aiCompleteWithRetry("Hello", {
          settings: TEST_SETTINGS,
          retries: 3,
          retryDelay,
        }),
      ).rejects.toThrow("always fails");

      expect(attemptTimes.length).toBe(3);
      const firstGap = attemptTimes[1] - attemptTimes[0];
      const secondGap = attemptTimes[2] - attemptTimes[1];
      // Allow scheduler jitter but require monotonic growth roughly matching retryDelay * (i+1).
      expect(firstGap).toBeGreaterThanOrEqual(retryDelay - 5);
      expect(secondGap).toBeGreaterThanOrEqual(retryDelay * 2 - 5);
      expect(secondGap).toBeGreaterThan(firstGap);
    } finally {
      mockedGenerateText.mockImplementation(
        originalImpl ??
          (async () => ({
            text: "mocked response",
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          })),
      );
    }
  });
});

describe("usage normalization fallbacks", () => {
  test("aiComplete defaults missing usage fields to 0", async () => {
    const mockedGenerateText = generateText as unknown as Mock;
    const originalImpl = mockedGenerateText.getMockImplementation();
    mockedGenerateText.mockImplementation(async () => ({
      text: "no-usage",
      usage: {},
    }));

    try {
      const result = await aiComplete("Hello", { settings: TEST_SETTINGS });
      expect(result.usage).toEqual({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      });
    } finally {
      mockedGenerateText.mockImplementation(
        originalImpl ??
          (async () => ({
            text: "mocked response",
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          })),
      );
    }
  });

  test("aiChat defaults missing usage fields to 0", async () => {
    const mockedGenerateText = generateText as unknown as Mock;
    const originalImpl = mockedGenerateText.getMockImplementation();
    mockedGenerateText.mockImplementation(async () => ({
      text: "no-usage",
      usage: {},
    }));

    try {
      const result = await aiChat([{ role: "user", content: "Hi" }], {
        settings: TEST_SETTINGS,
      });
      expect(result.usage).toEqual({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      });
    } finally {
      mockedGenerateText.mockImplementation(
        originalImpl ??
          (async () => ({
            text: "mocked response",
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          })),
      );
    }
  });
});
