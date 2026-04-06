"use client";

import { useCallback, useState } from "react";
import type { AiTestConfig, AiTestResult } from "../core/types";
import { useAiConfig } from "./context";

/** 获取和管理 AI 设置 */
export function useAiSettings() {
  const { settings, loading, saving, save, reload } = useAiConfig();
  return { settings, loading, saving, save, reload };
}

/** AI 连接测试 hook */
export function useAiTest() {
  const { testConnection } = useAiConfig();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<AiTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const test = useCallback(
    async (config: AiTestConfig) => {
      setTesting(true);
      setResult(null);
      setError(null);
      try {
        const res = await testConnection(config);
        setResult(res);
        return res;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Connection test failed";
        setError(message);
        // Return a failed result so callers can still handle it
        const failedResult: AiTestResult = { success: false, error: message };
        setResult(failedResult);
        return failedResult;
      } finally {
        setTesting(false);
      }
    },
    [testConnection],
  );

  return { test, testing, result, error };
}

/** 获取 Provider 注册表 */
export function useProviderRegistry() {
  const { registry } = useAiConfig();
  return registry;
}
