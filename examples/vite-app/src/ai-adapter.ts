import type {
  AiSettingsInput,
  AiSettingsReadonly,
  AiStorageAdapter,
  AiTestConfig,
  AiTestResult,
} from "@nocoo/next-ai";

export const aiAdapter: AiStorageAdapter = {
  async getSettings(): Promise<AiSettingsReadonly> {
    const res = await fetch("/api/settings/ai");
    return res.json();
  },
  async saveSettings(
    input: Partial<AiSettingsInput>,
  ): Promise<AiSettingsReadonly> {
    const res = await fetch("/api/settings/ai", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.json();
  },
  async testConnection(cfg: AiTestConfig): Promise<AiTestResult> {
    const res = await fetch("/api/settings/ai/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cfg),
    });
    return res.json();
  },
};
