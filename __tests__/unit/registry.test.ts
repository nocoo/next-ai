import { describe, expect, test } from "bun:test";
import { BUILTIN_PROVIDERS } from "../../src/core/providers";
import { AiProviderRegistry, defaultRegistry } from "../../src/core/registry";
import type { AiProviderInfo } from "../../src/core/types";

describe("AiProviderRegistry", () => {
  describe("constructor", () => {
    test("initializes with builtin providers", () => {
      const registry = new AiProviderRegistry();
      expect(registry.get("anthropic")).toEqual(BUILTIN_PROVIDERS.anthropic);
      expect(registry.get("minimax")).toEqual(BUILTIN_PROVIDERS.minimax);
      expect(registry.get("glm")).toEqual(BUILTIN_PROVIDERS.glm);
      expect(registry.get("aihubmix")).toEqual(BUILTIN_PROVIDERS.aihubmix);
    });

    test("accepts custom providers in constructor", () => {
      const customProvider: AiProviderInfo = {
        id: "deepseek",
        label: "DeepSeek",
        baseURL: "https://api.deepseek.com/v1",
        sdkType: "openai",
        models: ["deepseek-chat"],
        defaultModel: "deepseek-chat",
      };

      const registry = new AiProviderRegistry({ deepseek: customProvider });
      expect(registry.get("deepseek")).toEqual(customProvider);
      // Should still have builtins
      expect(registry.get("anthropic")).toBeDefined();
    });
  });

  describe("get", () => {
    test("returns undefined for unknown provider", () => {
      const registry = new AiProviderRegistry();
      expect(registry.get("unknown")).toBeUndefined();
    });

    test("returns provider info for known provider", () => {
      const registry = new AiProviderRegistry();
      const provider = registry.get("anthropic");
      expect(provider?.id).toBe("anthropic");
    });
  });

  describe("getAll", () => {
    test("returns all providers as array", () => {
      const registry = new AiProviderRegistry();
      const all = registry.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(4); // 4 builtins
    });

    test("includes custom providers", () => {
      const customProvider: AiProviderInfo = {
        id: "test",
        label: "Test",
        baseURL: "https://test.com",
        sdkType: "openai",
        models: ["test-model"],
        defaultModel: "test-model",
      };
      const registry = new AiProviderRegistry({ test: customProvider });
      const all = registry.getAll();
      expect(all.length).toBe(5);
      expect(all.some((p) => p.id === "test")).toBe(true);
    });
  });

  describe("getAllIds", () => {
    test("returns all provider ids including custom", () => {
      const registry = new AiProviderRegistry();
      const ids = registry.getAllIds();
      expect(ids).toContain("anthropic");
      expect(ids).toContain("minimax");
      expect(ids).toContain("glm");
      expect(ids).toContain("aihubmix");
      expect(ids).toContain("custom");
    });
  });

  describe("register", () => {
    test("adds new provider", () => {
      const registry = new AiProviderRegistry();
      const newProvider: AiProviderInfo = {
        id: "new-provider",
        label: "New Provider",
        baseURL: "https://new.com",
        sdkType: "anthropic",
        models: ["model-1"],
        defaultModel: "model-1",
      };

      registry.register(newProvider);
      expect(registry.get("new-provider")).toEqual(newProvider);
    });

    test("overwrites existing provider", () => {
      const registry = new AiProviderRegistry();
      const updated: AiProviderInfo = {
        ...BUILTIN_PROVIDERS.anthropic,
        label: "Updated Anthropic",
      };

      registry.register(updated);
      expect(registry.get("anthropic")?.label).toBe("Updated Anthropic");
    });
  });

  describe("has", () => {
    test("returns true for builtin provider", () => {
      const registry = new AiProviderRegistry();
      expect(registry.has("anthropic")).toBe(true);
    });

    test("returns true for custom provider id", () => {
      const registry = new AiProviderRegistry();
      expect(registry.has("custom")).toBe(true);
    });

    test("returns false for unknown provider", () => {
      const registry = new AiProviderRegistry();
      expect(registry.has("unknown")).toBe(false);
    });
  });
});

describe("defaultRegistry", () => {
  test("is an instance of AiProviderRegistry", () => {
    expect(defaultRegistry).toBeInstanceOf(AiProviderRegistry);
  });

  test("contains builtin providers", () => {
    expect(defaultRegistry.get("anthropic")).toBeDefined();
  });
});
