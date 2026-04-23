"use client";

import { aiAdapter } from "@/lib/ai-adapter";
import { AiConfigProvider, AiSettingsPanel } from "@nocoo/next-ai/react";

export default function AiSettingsPage() {
  return (
    <main className="p-8">
      <AiConfigProvider adapter={aiAdapter}>
        <AiSettingsPanel />
      </AiConfigProvider>
    </main>
  );
}
