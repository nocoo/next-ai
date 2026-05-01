import { describe, expect, test } from "vitest";
import {
  isValidProvider,
  resolveAiConfig,
  validateAiConfig,
  validateTestConfig,
} from "../../src/core/config";
import { AiProviderRegistry } from "../../src/core/registry";

describe("validateAiConfig", () => {
  test("returns empty array for valid builtin provider config", () => {
    const errors = validateAiConfig({
      provider: "anthropic",
      apiKey: "sk-xxx",
      model: "claude-sonnet-4-20250514",
    });
    expect(errors).toEqual([]);
  });

  test("returns error for missing provider", () => {
    const errors = validateAiConfig({
      provider: "",
      apiKey: "sk-xxx",
      model: "some-model",
    });
    expect(errors).toContainEqual({
      field: "provider",
      message: "Provider is required",
    });
  });

  test("returns error for unknown provider", () => {
    const errors = validateAiConfig({
      provider: "unknown-provider",
      apiKey: "sk-xxx",
      model: "some-model",
    });
    expect(errors).toContainEqual({
      field: "provider",
      message: "Unknown provider: unknown-provider",
    });
  });

  test("returns error for missing apiKey", () => {
    const errors = validateAiConfig({
      provider: "anthropic",
      apiKey: "",
      model: "claude-sonnet-4-20250514",
    });
    expect(errors).toContainEqual({
      field: "apiKey",
      message: "API key is required",
    });
  });

  test("returns multiple errors for multiple issues", () => {
    const errors = validateAiConfig({
      provider: "",
      apiKey: "",
    });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  describe("custom provider validation", () => {
    test("returns error for missing baseURL", () => {
      const errors = validateAiConfig({
        provider: "custom",
        apiKey: "sk-xxx",
        model: "my-model",
        sdkType: "openai",
      });
      expect(errors).toContainEqual({
        field: "baseURL",
        message: "Base URL is required for custom provider",
      });
    });

    test("returns error for missing sdkType", () => {
      const errors = validateAiConfig({
        provider: "custom",
        apiKey: "sk-xxx",
        model: "my-model",
        baseURL: "https://api.example.com",
      });
      expect(errors).toContainEqual({
        field: "sdkType",
        message: "SDK type is required for custom provider",
      });
    });

    test("returns error for missing model", () => {
      const errors = validateAiConfig({
        provider: "custom",
        apiKey: "sk-xxx",
        model: "",
        baseURL: "https://api.example.com",
        sdkType: "openai",
      });
      expect(errors).toContainEqual({
        field: "model",
        message: "Model is required for custom provider",
      });
    });

    test("returns empty array for valid custom provider config", () => {
      const errors = validateAiConfig({
        provider: "custom",
        apiKey: "sk-xxx",
        model: "my-model",
        baseURL: "https://api.example.com",
        sdkType: "openai",
      });
      expect(errors).toEqual([]);
    });
  });

  test("accepts custom registry", () => {
    const customRegistry = new AiProviderRegistry({
      myProvider: {
        id: "myProvider",
        label: "My Provider",
        baseURL: "https://my.api.com",
        sdkType: "openai",
        models: ["my-model"],
        defaultModel: "my-model",
      },
    });

    const errors = validateAiConfig(
      {
        provider: "myProvider",
        apiKey: "sk-xxx",
        model: "my-model",
      },
      customRegistry,
    );
    expect(errors).toEqual([]);
  });
});

describe("validateTestConfig", () => {
  test("does not require apiKey", () => {
    const errors = validateTestConfig({
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      // No apiKey - this is valid for test config
    });
    expect(errors).toEqual([]);
  });

  test("requires provider", () => {
    const errors = validateTestConfig({
      provider: "",
      model: "claude-sonnet-4-20250514",
    });
    expect(errors).toContainEqual({
      field: "provider",
      message: "Provider is required",
    });
  });

  test("requires model", () => {
    const errors = validateTestConfig({
      provider: "anthropic",
      model: "",
    });
    expect(errors).toContainEqual({
      field: "model",
      message: "Model is required",
    });
  });

  test("validates unknown provider", () => {
    const errors = validateTestConfig({
      provider: "unknown",
      model: "some-model",
    });
    expect(errors).toContainEqual({
      field: "provider",
      message: "Unknown provider: unknown",
    });
  });

  test("validates custom provider fields", () => {
    const errors = validateTestConfig({
      provider: "custom",
      model: "my-model",
      // Missing baseURL and sdkType
    });
    expect(errors).toContainEqual({
      field: "baseURL",
      message: "Base URL is required for custom provider",
    });
    expect(errors).toContainEqual({
      field: "sdkType",
      message: "SDK type is required for custom provider",
    });
  });

  test("returns empty array for valid custom provider config", () => {
    const errors = validateTestConfig({
      provider: "custom",
      model: "my-model",
      baseURL: "https://api.example.com",
      sdkType: "openai",
    });
    expect(errors).toEqual([]);
  });
});

describe("resolveAiConfig", () => {
  test("returns full config for builtin provider", () => {
    const config = resolveAiConfig({
      provider: "anthropic",
      apiKey: "sk-xxx",
      model: "claude-sonnet-4-20250514",
    });

    expect(config).toEqual({
      provider: "anthropic",
      baseURL: "https://api.anthropic.com/v1",
      apiKey: "sk-xxx",
      model: "claude-sonnet-4-20250514",
      sdkType: "anthropic",
    });
  });

  test("uses default model when model is empty", () => {
    const config = resolveAiConfig({
      provider: "anthropic",
      apiKey: "sk-xxx",
      model: "",
    });
    expect(config.model).toBe("claude-sonnet-4-20250514");
  });

  test("returns full config for custom provider", () => {
    const config = resolveAiConfig({
      provider: "custom",
      apiKey: "sk-xxx",
      model: "my-model",
      baseURL: "https://custom.api.com",
      sdkType: "openai",
    });

    expect(config).toEqual({
      provider: "custom",
      baseURL: "https://custom.api.com",
      apiKey: "sk-xxx",
      model: "my-model",
      sdkType: "openai",
    });
  });

  test("throws combined error message for invalid config", () => {
    expect(() =>
      resolveAiConfig({
        provider: "",
        apiKey: "",
        model: "",
      }),
    ).toThrow("provider: Provider is required; apiKey: API key is required");
  });

  test("throws for unknown provider", () => {
    expect(() =>
      resolveAiConfig({
        provider: "unknown",
        apiKey: "sk-xxx",
        model: "model",
      }),
    ).toThrow("Unknown provider: unknown");
  });

  test("accepts custom registry", () => {
    const customRegistry = new AiProviderRegistry({
      myProvider: {
        id: "myProvider",
        label: "My Provider",
        baseURL: "https://my.api.com",
        sdkType: "openai",
        models: ["my-model"],
        defaultModel: "my-model",
      },
    });

    const config = resolveAiConfig(
      {
        provider: "myProvider",
        apiKey: "sk-xxx",
        model: "my-model",
      },
      customRegistry,
    );

    expect(config.baseURL).toBe("https://my.api.com");
    expect(config.sdkType).toBe("openai");
  });
});

describe("isValidProvider", () => {
  test("returns true for builtin provider", () => {
    expect(isValidProvider("anthropic")).toBe(true);
    expect(isValidProvider("minimax")).toBe(true);
    expect(isValidProvider("glm")).toBe(true);
    expect(isValidProvider("aihubmix")).toBe(true);
  });

  test("returns true for custom", () => {
    expect(isValidProvider("custom")).toBe(true);
  });

  test("returns false for unknown provider", () => {
    expect(isValidProvider("unknown")).toBe(false);
  });

  test("accepts custom registry", () => {
    const customRegistry = new AiProviderRegistry({
      myProvider: {
        id: "myProvider",
        label: "My Provider",
        baseURL: "https://my.api.com",
        sdkType: "openai",
        models: ["my-model"],
        defaultModel: "my-model",
      },
    });

    expect(isValidProvider("myProvider", customRegistry)).toBe(true);
    expect(isValidProvider("unknown", customRegistry)).toBe(false);
  });
});
