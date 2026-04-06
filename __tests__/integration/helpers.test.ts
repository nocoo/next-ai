import { describe, expect, test } from "bun:test";
import { aiChat, aiComplete } from "../../src/server/helpers";

// 使用环境变量配置测试 API Key
const TEST_SETTINGS = {
  provider: "anthropic",
  apiKey: process.env.TEST_ANTHROPIC_API_KEY || "",
  model: "claude-3-5-haiku-20241022", // 使用便宜的模型
};

describe("AI Helpers Integration", () => {
  test.skipIf(!TEST_SETTINGS.apiKey)(
    "aiComplete returns valid response",
    async () => {
      const result = await aiComplete("Reply with: OK", {
        settings: TEST_SETTINGS,
        maxOutputTokens: 10,
      });
      expect(result.text).toContain("OK");
      expect(result.usage.totalTokens).toBeGreaterThan(0);
      expect(result.durationMs).toBeGreaterThan(0);
    },
  );

  test.skipIf(!TEST_SETTINGS.apiKey)("aiChat handles multi-turn", async () => {
    const result = await aiChat(
      [
        { role: "user", content: "Say hello" },
        { role: "assistant", content: "Hello!" },
        { role: "user", content: "Say goodbye" },
      ],
      { settings: TEST_SETTINGS, maxOutputTokens: 20 },
    );
    expect(result.text.toLowerCase()).toContain("bye");
  });
});

// 注意：L2 测试需要真实 API Key，CI 中通过 secrets 注入。本地开发时可 skip。
