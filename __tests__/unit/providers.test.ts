import { describe, expect, test } from "vitest";
import {
  BUILTIN_PROVIDERS,
  CUSTOM_PROVIDER_INFO,
} from "../../src/core/providers";
import type { BuiltinProvider } from "../../src/core/types";

describe("BUILTIN_PROVIDERS", () => {
  const providerIds: BuiltinProvider[] = [
    "anthropic",
    "minimax",
    "glm",
    "aihubmix",
  ];

  test("contains all expected providers", () => {
    for (const id of providerIds) {
      expect(BUILTIN_PROVIDERS[id]).toBeDefined();
    }
  });

  test("each provider has required fields", () => {
    for (const id of providerIds) {
      const provider = BUILTIN_PROVIDERS[id];
      expect(provider.id).toBe(id);
      expect(provider.label).toBeTruthy();
      expect(provider.baseURL).toMatch(/^https?:\/\//);
      expect(["anthropic", "openai"]).toContain(provider.sdkType);
      expect(Array.isArray(provider.models)).toBe(true);
      expect(provider.models.length).toBeGreaterThan(0);
      expect(provider.defaultModel).toBeTruthy();
      expect(provider.models).toContain(provider.defaultModel);
    }
  });

  test("anthropic provider has correct configuration", () => {
    const anthropic = BUILTIN_PROVIDERS.anthropic;
    expect(anthropic.sdkType).toBe("anthropic");
    expect(anthropic.baseURL).toBe("https://api.anthropic.com/v1");
    expect(anthropic.models).toContain("claude-sonnet-4-20250514");
  });

  test("aihubmix provider uses openai sdk", () => {
    const aihubmix = BUILTIN_PROVIDERS.aihubmix;
    expect(aihubmix.sdkType).toBe("openai");
  });
});

describe("CUSTOM_PROVIDER_INFO", () => {
  test("has correct id", () => {
    expect(CUSTOM_PROVIDER_INFO.id).toBe("custom");
  });

  test("has empty models array", () => {
    expect(CUSTOM_PROVIDER_INFO.models).toEqual([]);
  });

  test("has empty default model", () => {
    expect(CUSTOM_PROVIDER_INFO.defaultModel).toBe("");
  });

  test("does not have baseURL or sdkType", () => {
    expect("baseURL" in CUSTOM_PROVIDER_INFO).toBe(false);
    expect("sdkType" in CUSTOM_PROVIDER_INFO).toBe(false);
  });
});
