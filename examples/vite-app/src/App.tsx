import { AiConfigProvider, AiSettingsPanel } from "@nocoo/next-ai/react";
import { aiAdapter } from "./ai-adapter";

export default function App() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">AI Settings</h1>
        <AiConfigProvider adapter={aiAdapter}>
          <AiSettingsPanel />
        </AiConfigProvider>
      </div>
    </div>
  );
}
