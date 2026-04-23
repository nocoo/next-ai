import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../dist/**/*.{js,mjs}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
