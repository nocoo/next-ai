import { describe, expect, test } from "vitest";
import {
  type PromptTemplate,
  PromptTemplateRegistry,
} from "../../src/core/templates";

describe("PromptTemplateRegistry", () => {
  const sampleTemplate: PromptTemplate = {
    id: "test-template",
    name: "Test Template",
    description: "A test template",
    sections: [
      { id: "intro", label: "Introduction", content: "Hello, {{name}}!" },
      { id: "body", label: "Body", content: "You have {{count}} items." },
    ],
    variables: [
      { key: "name", label: "Name", required: true },
      { key: "count", label: "Count", required: true },
    ],
  };

  describe("register and get", () => {
    test("registers and retrieves a template", () => {
      const registry = new PromptTemplateRegistry();
      registry.register(sampleTemplate);

      const retrieved = registry.get("test-template");
      expect(retrieved).toEqual(sampleTemplate);
    });

    test("returns undefined for unknown template", () => {
      const registry = new PromptTemplateRegistry();
      expect(registry.get("unknown")).toBeUndefined();
    });
  });

  describe("getAll", () => {
    test("returns all registered templates", () => {
      const registry = new PromptTemplateRegistry();
      registry.register(sampleTemplate);
      registry.register({
        ...sampleTemplate,
        id: "another-template",
        name: "Another Template",
      });

      const all = registry.getAll();
      expect(all.length).toBe(2);
      expect(all.map((t) => t.id)).toContain("test-template");
      expect(all.map((t) => t.id)).toContain("another-template");
    });

    test("returns empty array when no templates registered", () => {
      const registry = new PromptTemplateRegistry();
      expect(registry.getAll()).toEqual([]);
    });
  });

  describe("getAllIds", () => {
    test("returns all template ids", () => {
      const registry = new PromptTemplateRegistry();
      registry.register(sampleTemplate);
      registry.register({
        ...sampleTemplate,
        id: "another-template",
      });

      const ids = registry.getAllIds();
      expect(ids).toContain("test-template");
      expect(ids).toContain("another-template");
    });
  });

  describe("has", () => {
    test("returns true for registered template", () => {
      const registry = new PromptTemplateRegistry();
      registry.register(sampleTemplate);
      expect(registry.has("test-template")).toBe(true);
    });

    test("returns false for unregistered template", () => {
      const registry = new PromptTemplateRegistry();
      expect(registry.has("unknown")).toBe(false);
    });
  });

  describe("build", () => {
    test("builds prompt from template with variables", () => {
      const registry = new PromptTemplateRegistry();
      registry.register(sampleTemplate);

      const result = registry.build("test-template", {
        name: "Alice",
        count: 5,
      });

      expect(result).toBe("Hello, Alice!\n\nYou have 5 items.");
    });

    test("throws for unknown template", () => {
      const registry = new PromptTemplateRegistry();
      expect(() => registry.build("unknown", {})).toThrow(
        "Unknown template: unknown",
      );
    });

    test("supports custom section overrides", () => {
      const registry = new PromptTemplateRegistry();
      registry.register(sampleTemplate);

      const result = registry.build(
        "test-template",
        { name: "Alice", count: 5 },
        { intro: "Custom intro with {{name}}" },
      );

      expect(result).toBe("Custom intro with Alice\n\nYou have 5 items.");
    });

    test("handles nested variables", () => {
      const nestedTemplate: PromptTemplate = {
        id: "nested",
        name: "Nested",
        sections: [
          {
            id: "main",
            label: "Main",
            content: "User: {{user.name}}, City: {{user.address.city}}",
          },
        ],
        variables: [],
      };

      const registry = new PromptTemplateRegistry();
      registry.register(nestedTemplate);

      const result = registry.build("nested", {
        user: {
          name: "Bob",
          address: { city: "Tokyo" },
        },
      });

      expect(result).toBe("User: Bob, City: Tokyo");
    });

    test("handles empty sections", () => {
      const emptyTemplate: PromptTemplate = {
        id: "empty",
        name: "Empty",
        sections: [],
        variables: [],
      };

      const registry = new PromptTemplateRegistry();
      registry.register(emptyTemplate);

      const result = registry.build("empty", {});
      expect(result).toBe("");
    });
  });
});
