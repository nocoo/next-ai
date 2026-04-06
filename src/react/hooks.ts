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

  const test = useCallback(
    async (config: AiTestConfig) => {
      setTesting(true);
      setResult(null);
      try {
        const res = await testConnection(config);
        setResult(res);
        return res;
      } finally {
        setTesting(false);
      }
    },
    [testConnection],
  );

  return { test, testing, result };
}

/** 获取 Provider 注册表 */
export function useProviderRegistry() {
  const { registry } = useAiConfig();
  return registry;
}
