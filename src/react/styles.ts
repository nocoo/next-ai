/** Basalt 设计系统 CSS tokens */
export const basaltTokens = {
  light: {
    background: "220 14% 94%",
    foreground: "0 0% 12%",
    card: "220 14% 97%",
    cardForeground: "0 0% 12%",
    secondary: "0 0% 100%",
    secondaryForeground: "0 0% 12%",
    input: "220 13% 88%",
    border: "220 13% 88%",
    primary: "220 90% 56%",
    primaryForeground: "0 0% 100%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 100%",
    muted: "220 14% 96%",
    mutedForeground: "0 0% 45%",
  },
  dark: {
    background: "0 0% 9%",
    foreground: "0 0% 93%",
    card: "0 0% 10.6%",
    cardForeground: "0 0% 93%",
    secondary: "0 0% 12.2%",
    secondaryForeground: "0 0% 93%",
    input: "0 0% 18%",
    border: "0 0% 16%",
    primary: "220 90% 56%",
    primaryForeground: "0 0% 100%",
    destructive: "0 62% 50%",
    destructiveForeground: "0 0% 100%",
    muted: "0 0% 15%",
    mutedForeground: "0 0% 64%",
  },
} as const;

/** camelCase → kebab-case 转换 */
function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/** 生成 CSS 变量字符串 */
export function generateCssVariables(mode: "light" | "dark"): string {
  const tokens = basaltTokens[mode];
  return Object.entries(tokens)
    .map(([key, value]) => `--${kebabCase(key)}: ${value};`)
    .join("\n");
}

/** 类名合并工具（替代 clsx/tailwind-merge） */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
