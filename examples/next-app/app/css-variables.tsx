"use client";

import { generateCssVariables } from "@nocoo/next-ai/react";

const lightVars = generateCssVariables("light");

export function CssVariables() {
  return (
    <style
      // biome-ignore lint/security/noDangerouslySetInnerHtml: emitting CSS variables from SDK tokens
      dangerouslySetInnerHTML={{ __html: `:root{${lightVars}}` }}
    />
  );
}
