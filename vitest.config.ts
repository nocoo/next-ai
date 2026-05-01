import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    setupFiles: ["./__tests__/preload.ts"],
    include: ["__tests__/unit/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      // Integration tests hit real APIs and are run via `test:integration` script.
      "**/__tests__/integration/**",
    ],
    coverage: {
      provider: "v8",
      // Vitest 4 ships AST-aware remapping by default; the legacy source-map
      // remap path is no longer used.
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        // Barrel files — pure re-exports, no runtime logic to cover.
        "src/index.ts",
        "src/server.ts",
        "src/server/index.ts",
        "src/react/index.ts",
        // Type-only module — TypeScript types compile away.
        "src/core/types.ts",
        // Strict server-only entry — `import "server-only"` throws outside a
        // Next.js server runtime, untestable in Node/Vitest. Logic is the
        // same `./server` re-export already covered above.
        "src/server-next.ts",
        // React entry & UI — "use client" components and hooks belong in
        // browser/E2E tests, not v8 line coverage in a Node runtime.
        "src/react.ts",
        "src/react/**",
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
