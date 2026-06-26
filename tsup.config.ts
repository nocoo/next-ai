import { defineConfig } from "tsup";

// ai@7 dropped CJS, so the wrapper ships ESM-only as well.
export default defineConfig([
  // Main entry (types, utils, constants) - no banner needed
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom", "server-only"],
  },
  // Server entry (universal, works with Vite/vinext) - no banner needed
  {
    entry: { server: "src/server.ts" },
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ["react", "react-dom", "server-only"],
  },
  // Server entry for Next.js (with server-only protection)
  {
    entry: { "server-next": "src/server-next.ts" },
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ["react", "react-dom", "server-only"],
  },
  // React entry - needs "use client" banner
  {
    entry: { react: "src/react.ts" },
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ["react", "react-dom", "server-only"],
    banner: {
      js: '"use client";',
    },
  },
]);
