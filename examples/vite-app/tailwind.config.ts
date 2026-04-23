import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../dist/**/*.{js,mjs}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
