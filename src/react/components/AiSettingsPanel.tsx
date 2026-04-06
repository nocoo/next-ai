"use client";

import { useEffect, useState } from "react";
import type { AiTestResult, SdkType } from "../../core/types";
import { useAiSettings, useAiTest, useProviderRegistry } from "../hooks";
import { cn } from "../styles";
import { ApiKeyInput } from "./ApiKeyInput";
import { ModelSelect } from "./ModelSelect";
import { ProviderSelect } from "./ProviderSelect";

export interface AiSettingsPanelProps {
  /** 自定义类名 */
  className?: string;
  /** 保存成功回调 */
  onSaveSuccess?: () => void;
  /** 测试成功回调 */
  onTestSuccess?: (result: AiTestResult) => void;
  /** 测试失败回调 */
  onTestError?: (error: string) => void;
  /** 隐藏测试按钮 */
  hideTestButton?: boolean;
}

/**
 * 完整的 AI 设置面板，包含所有配置项
 *
 * 布局结构：
 * ┌─────────────────────────────────────────┐
 * │ AI Settings                    [Card L1] │
 * ├─────────────────────────────────────────┤
 * │ Provider        [Select ▼]              │
 * │ ─────────────────────────────────────── │
 * │ Model           [Select ▼]              │
 * │                 └─ or [Custom Input]    │
 * │ ─────────────────────────────────────── │
 * │ API Key         [●●●●●●●●] [👁]         │
 * │ ─────────────────────────────────────── │
 * │ (if custom provider)                    │
 * │ Base URL        [https://...]           │
 * │ SDK Type        [Select ▼]              │
 * │ ─────────────────────────────────────── │
 * │ [Test Connection]        [Save Settings]│
 * │ ─────────────────────────────────────── │
 * │ (Test Result Badge - success/error)     │
 * └─────────────────────────────────────────┘
 */
export function AiSettingsPanel({
  className,
  onSaveSuccess,
  onTestSuccess,
  onTestError,
  hideTestButton,
}: AiSettingsPanelProps) {
  const { settings, loading, saving, save } = useAiSettings();
  const { test, testing, result } = useAiTest();
  const registry = useProviderRegistry();

  // Form state
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [sdkType, setSdkType] = useState<SdkType | "">("");

  // Sync form state when settings load
  useEffect(() => {
    if (settings) {
      setProvider(settings.provider);
      setModel(settings.model);
      setBaseURL(settings.baseURL ?? "");
      setSdkType(settings.sdkType ?? "");
    }
  }, [settings]);

  const isCustomProvider = provider === "custom";
  const providerInfo = registry.get(provider);

  // Form validation: custom provider requires baseURL and sdkType
  const isCustomProviderValid =
    !isCustomProvider || (baseURL.trim() !== "" && sdkType !== "");
  const canSubmit = provider && model && isCustomProviderValid;

  const handleSave = async () => {
    await save({
      provider,
      model,
      apiKey: apiKey || undefined,
      baseURL: isCustomProvider ? baseURL : undefined,
      sdkType: isCustomProvider ? (sdkType as SdkType) : undefined,
    });
    setApiKey(""); // Clear apiKey field after save
    onSaveSuccess?.();
  };

  const handleTest = async () => {
    const testResult = await test({
      provider,
      apiKey: apiKey || undefined, // If empty, server should use stored key
      model,
      baseURL: isCustomProvider ? baseURL : providerInfo?.baseURL,
      sdkType: isCustomProvider ? (sdkType as SdkType) : providerInfo?.sdkType,
    });

    if (testResult.success) {
      onTestSuccess?.(testResult);
    } else {
      onTestError?.(testResult.error ?? "Test failed");
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl p-6",
          "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
          "border border-[hsl(var(--border))]",
          "animate-pulse",
          className,
        )}
      >
        <div className="h-8 bg-[hsl(var(--muted))] rounded w-1/3 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-[hsl(var(--muted))] rounded" />
          <div className="h-10 bg-[hsl(var(--muted))] rounded" />
          <div className="h-10 bg-[hsl(var(--muted))] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl p-6",
        "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
        "border border-[hsl(var(--border))]",
        className,
      )}
    >
      <h2 className="text-lg font-semibold mb-6">AI Settings</h2>

      <div className="space-y-4">
        {/* Provider */}
        <div className="space-y-2">
          <label htmlFor="ai-provider-select" className="text-sm font-medium">
            Provider
          </label>
          <ProviderSelect
            id="ai-provider-select"
            value={provider}
            onChange={(v) => {
              setProvider(v);
              setModel("");
            }}
            disabled={saving}
          />
        </div>

        {/* Model */}
        <div className="space-y-2">
          <label htmlFor="ai-model-select" className="text-sm font-medium">
            Model
          </label>
          <ModelSelect
            id="ai-model-select"
            provider={provider}
            value={model}
            onChange={setModel}
            disabled={saving || !provider}
          />
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label htmlFor="ai-api-key-input" className="text-sm font-medium">
            API Key
          </label>
          <ApiKeyInput
            id="ai-api-key-input"
            value={apiKey}
            onChange={setApiKey}
            hasStoredKey={settings?.hasApiKey}
            disabled={saving}
          />
          {settings?.hasApiKey && !apiKey && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              API key is set. Enter a new key to update it.
            </p>
          )}
        </div>

        {/* Custom Provider Fields */}
        {isCustomProvider && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="ai-base-url-input"
                className="text-sm font-medium"
              >
                Base URL
              </label>
              <input
                id="ai-base-url-input"
                type="url"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://api.example.com/v1"
                disabled={saving}
                className={cn(
                  "flex h-10 w-full rounded-lg px-3 py-2",
                  "text-sm",
                  "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
                  "border border-[hsl(var(--border))]",
                  "placeholder:text-[hsl(var(--muted-foreground))]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="ai-sdk-type-select"
                className="text-sm font-medium"
              >
                SDK Type
              </label>
              <select
                id="ai-sdk-type-select"
                value={sdkType}
                onChange={(e) => setSdkType(e.target.value as SdkType | "")}
                disabled={saving}
                className={cn(
                  "flex h-10 w-full rounded-lg px-3 py-2",
                  "text-sm",
                  "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
                  "border border-[hsl(var(--border))]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <option value="">Select SDK type...</option>
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {!hideTestButton && (
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || saving || !canSubmit}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2",
                "text-sm font-medium transition-colors",
                "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
                "border border-[hsl(var(--border))]",
                "hover:bg-[hsl(var(--secondary)/0.8)]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSubmit}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-4 py-2",
              "text-sm font-medium transition-colors",
              "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
              "hover:bg-[hsl(var(--primary)/0.9)]",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Test Result */}
        {result && (
          <div
            className={cn(
              "mt-4 p-3 rounded-lg text-sm",
              result.success
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]",
            )}
          >
            {result.success ? (
              <>
                ✓ Connection successful
                {result.model && (
                  <span className="ml-2 opacity-70">({result.model})</span>
                )}
              </>
            ) : (
              <>✗ {result.error ?? "Connection failed"}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
