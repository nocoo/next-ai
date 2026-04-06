"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type React from "react";
import { type AiProviderRegistry, defaultRegistry } from "../core/registry";
import type {
  AiSettingsInput,
  AiSettingsReadonly,
  AiStorageAdapter,
  AiTestConfig,
  AiTestResult,
} from "../core/types";

interface AiConfigContextValue {
  settings: AiSettingsReadonly | null;
  loading: boolean;
  saving: boolean;
  registry: AiProviderRegistry;

  reload: () => Promise<void>;
  save: (updates: Partial<AiSettingsInput>) => Promise<void>;
  testConnection: (config: AiTestConfig) => Promise<AiTestResult>;
}

const AiConfigContext = createContext<AiConfigContextValue | null>(null);

interface AiConfigProviderProps {
  adapter: AiStorageAdapter;
  registry?: AiProviderRegistry;
  children: React.ReactNode;
}

export function AiConfigProvider({
  adapter,
  registry = defaultRegistry,
  children,
}: AiConfigProviderProps) {
  const [settings, setSettings] = useState<AiSettingsReadonly | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adapter.getSettings();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  const save = useCallback(
    async (updates: Partial<AiSettingsInput>) => {
      setSaving(true);
      try {
        const data = await adapter.saveSettings(updates);
        setSettings(data);
      } finally {
        setSaving(false);
      }
    },
    [adapter],
  );

  const testConnection = useCallback(
    (config: AiTestConfig) => {
      return adapter.testConnection(config);
    },
    [adapter],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <AiConfigContext.Provider
      value={{
        settings,
        loading,
        saving,
        registry,
        reload,
        save,
        testConnection,
      }}
    >
      {children}
    </AiConfigContext.Provider>
  );
}

export function useAiConfig() {
  const ctx = useContext(AiConfigContext);
  if (!ctx) throw new Error("useAiConfig must be used within AiConfigProvider");
  return ctx;
}
