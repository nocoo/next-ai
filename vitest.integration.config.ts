import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    setupFiles: ["./__tests__/preload.ts"],
    include: ["__tests__/integration/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
