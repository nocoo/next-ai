"use client";

import { aiAdapter } from "@/lib/ai-adapter";
import { AiConfigProvider, AiSettingsPanel } from "@nocoo/next-ai/react";
import { useState } from "react";

export default function AiSettingsPage() {
  const [saveCount, setSaveCount] = useState(0);

  return (
    <main className="p-8">
      <AiConfigProvider adapter={aiAdapter}>
        <AiSettingsPanel onSaveSuccess={() => setSaveCount((c) => c + 1)} />
      </AiConfigProvider>
      <div data-testid="save-success-count" hidden>
        {saveCount}
      </div>
    </main>
  );
}
