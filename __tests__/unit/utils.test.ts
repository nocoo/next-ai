import { describe, expect, test } from "vitest";
import {
  expandTemplate,
  formatDuration,
  parseJsonResponse,
} from "../../src/core/utils";

describe("expandTemplate", () => {
  test("expands simple variables", () => {
    const result = expandTemplate("Hello, {{name}}!", { name: "World" });
    expect(result).toBe("Hello, World!");
  });

  test("expands multiple variables", () => {
    const result = expandTemplate("{{greeting}}, {{name}}!", {
      greeting: "Hi",
      name: "Alice",
    });
    expect(result).toBe("Hi, Alice!");
  });

  test("expands nested object paths", () => {
    const result = expandTemplate("Hello, {{user.name}}!", {
      user: { name: "Bob" },
    });
    expect(result).toBe("Hello, Bob!");
  });

  test("expands deeply nested paths", () => {
    const result = expandTemplate("City: {{user.address.city}}", {
      user: { address: { city: "Tokyo" } },
    });
    expect(result).toBe("City: Tokyo");
  });

  test("preserves unmatched variables", () => {
    const result = expandTemplate("Hello, {{unknown}}!", { name: "World" });
    expect(result).toBe("Hello, {{unknown}}!");
  });

  test("handles number values", () => {
    const result = expandTemplate("Count: {{count}}", { count: 42 });
    expect(result).toBe("Count: 42");
  });

  test("handles empty template", () => {
    const result = expandTemplate("", { name: "World" });
    expect(result).toBe("");
  });

  test("handles template without variables", () => {
    const result = expandTemplate("No variables here", { name: "World" });
    expect(result).toBe("No variables here");
  });

  test("preserves object values as placeholder", () => {
    const result = expandTemplate("User: {{user}}", {
      user: { name: "Bob" },
    });
    expect(result).toBe("User: {{user}}");
  });

  test("handles missing nested path", () => {
    const result = expandTemplate("Name: {{user.profile.name}}", {
      user: { name: "Bob" },
    });
    expect(result).toBe("Name: {{user.profile.name}}");
  });
});

describe("formatDuration", () => {
  test("formats seconds under 60", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(30)).toBe("30s");
    expect(formatDuration(59)).toBe("59s");
  });

  test("formats minutes under 60", () => {
    expect(formatDuration(60)).toBe("1min");
    expect(formatDuration(120)).toBe("2min");
    expect(formatDuration(3599)).toBe("59min");
  });

  test("formats hours", () => {
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(7200)).toBe("2h");
  });

  test("formats hours with remaining minutes", () => {
    expect(formatDuration(3660)).toBe("1h 1min");
    expect(formatDuration(5400)).toBe("1h 30min");
    expect(formatDuration(7320)).toBe("2h 2min");
  });
});

describe("parseJsonResponse", () => {
  test("parses plain JSON", () => {
    const result = parseJsonResponse<{ name: string }>('{"name": "test"}');
    expect(result).toEqual({ name: "test" });
  });

  test("parses JSON in markdown code fence", () => {
    const text = '```json\n{"name": "test"}\n```';
    const result = parseJsonResponse<{ name: string }>(text);
    expect(result).toEqual({ name: "test" });
  });

  test("parses JSON in code fence without language", () => {
    const text = '```\n{"name": "test"}\n```';
    const result = parseJsonResponse<{ name: string }>(text);
    expect(result).toEqual({ name: "test" });
  });

  test("handles whitespace around JSON", () => {
    const text = '  \n{"name": "test"}\n  ';
    const result = parseJsonResponse<{ name: string }>(text);
    expect(result).toEqual({ name: "test" });
  });

  test("handles whitespace in code fence", () => {
    const text = '```json\n  {"name": "test"}  \n```';
    const result = parseJsonResponse<{ name: string }>(text);
    expect(result).toEqual({ name: "test" });
  });

  test("throws on invalid JSON", () => {
    expect(() => parseJsonResponse("not json")).toThrow();
  });

  test("parses complex objects", () => {
    const text = '{"items": [1, 2, 3], "nested": {"key": "value"}}';
    const result = parseJsonResponse<{
      items: number[];
      nested: { key: string };
    }>(text);
    expect(result.items).toEqual([1, 2, 3]);
    expect(result.nested.key).toBe("value");
  });
});
