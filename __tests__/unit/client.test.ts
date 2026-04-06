import { describe, expect, test } from "bun:test";
import type { AiConfig } from "../../src/core/types";
import { createAiClient, createAiModel } from "../../src/server/client";

describe("createAiClient", () => {
  test("creates Anthropic client for anthropic sdkType", () => {
    const config: AiConfig = {
      provider: "anthropic",
      baseURL: "https://api.anthropic.com/v1",
      apiKey: "sk-test",
      model: "claude-sonnet-4-20250514",
      sdkType: "anthropic",
    };

    const client = createAiClient(config);
    // Client is a function that takes a model name
    expect(typeof client).toBe("function");
  });

  test("creates OpenAI client for openai sdkType", () => {
    const config: AiConfig = {
      provider: "aihubmix",
      baseURL: "https://aihubmix.com/v1",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      sdkType: "openai",
    };

    const client = createAiClient(config);
    expect(typeof client).toBe("function");
  });
});

describe("createAiModel", () => {
  test("creates model from anthropic config", () => {
    const config: AiConfig = {
      provider: "anthropic",
      baseURL: "https://api.anthropic.com/v1",
      apiKey: "sk-test",
      model: "claude-sonnet-4-20250514",
      sdkType: "anthropic",
    };

    const model = createAiModel(config);

    expect(model).toMatchObject({
      type: "anthropic",
      model: "claude-sonnet-4-20250514",
      baseURL: "https://api.anthropic.com/v1",
      apiKey: "sk-test",
    });
  });

  test("creates model from openai config", () => {
    const config: AiConfig = {
      provider: "aihubmix",
      baseURL: "https://aihubmix.com/v1",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      sdkType: "openai",
    };

    const model = createAiModel(config);

    expect(model).toMatchObject({
      type: "openai",
      model: "gpt-4o-mini",
      baseURL: "https://aihubmix.com/v1",
      apiKey: "sk-test",
    });
  });
});
