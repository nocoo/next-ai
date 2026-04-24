import { AiConfigProvider, AiSettingsPanel } from "@nocoo/next-ai/react";
import { useState } from "react";
import { aiAdapter } from "./ai-adapter";

export default function App() {
  const [saveCount, setSaveCount] = useState(0);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">AI Settings</h1>
        <AiConfigProvider adapter={aiAdapter}>
          <AiSettingsPanel onSaveSuccess={() => setSaveCount((c) => c + 1)} />
        </AiConfigProvider>
        <div data-testid="save-success-count" hidden>
          {saveCount}
        </div>
      </div>
    </div>
  );
}
