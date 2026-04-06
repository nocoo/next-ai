import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
    react: "src/react.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "server-only"],
  banner: {
    js: `"use client";`,
  },
  esbuildOptions(options, context) {
    // Only add "use client" banner to react entry
    if (context.entryPoints.includes("src/react.ts")) {
      options.banner = { js: '"use client";' };
    } else {
      options.banner = {};
    }
  },
});
