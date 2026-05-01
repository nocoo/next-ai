import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["__tests__/integration/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
