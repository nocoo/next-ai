import { defineConfig } from "tsup";

export default defineConfig([
  // Main entry (types, utils, constants) - no banner needed
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom", "server-only"],
  },
  // Server entry - no banner needed
  {
    entry: { server: "src/server.ts" },
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ["react", "react-dom", "server-only"],
  },
  // React entry - needs "use client" banner
  {
    entry: { react: "src/react.ts" },
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ["react", "react-dom", "server-only"],
    banner: {
      js: '"use client";',
    },
  },
]);
