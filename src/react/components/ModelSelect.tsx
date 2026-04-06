"use client";

import { useState } from "react";
import { useProviderRegistry } from "../hooks";
import { cn } from "../styles";

export interface ModelSelectProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * 模型选择器，根据选中的 Provider 显示可用模型，支持自定义输入
 *
 * 行为：
 * 1. 根据 provider 显示预设模型列表
 * 2. 列表末尾有 "Custom model..." 选项
 * 3. 选择 Custom 后切换为文本输入框
 */
export function ModelSelect({
  provider,
  value,
  onChange,
  disabled,
  className,
  id,
}: ModelSelectProps) {
  const registry = useProviderRegistry();
  const [isCustom, setIsCustom] = useState(false);

  const providerInfo = registry.get(provider);
  const models = providerInfo?.models ?? [];
  const isCustomProvider = provider === "custom";

  // Check if current value is a custom model (not in preset list)
  const isValueCustomModel = value && !models.includes(value);

  // Show text input if: custom provider, user chose custom, or value is a custom model
  if (isCustomProvider || isCustom || isValueCustomModel) {
    return (
      <div className={cn("flex gap-2", className)}>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter model name..."
          disabled={disabled}
          className={cn(
            "flex h-10 flex-1 rounded-lg px-3 py-2",
            "text-sm",
            "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
            "border border-[hsl(var(--border))]",
            "placeholder:text-[hsl(var(--muted-foreground))]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        {!isCustomProvider && (
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange("");
            }}
            disabled={disabled}
            className={cn(
              "px-3 rounded-lg text-sm",
              "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
              "border border-[hsl(var(--border))]",
              "hover:bg-[hsl(var(--secondary)/0.8)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            List
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => {
        if (e.target.value === "__custom__") {
          setIsCustom(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-lg px-3 py-2",
        "text-sm",
        "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
        "border border-[hsl(var(--border))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <option value="">Select model...</option>
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
      <option disabled>──────────</option>
      <option value="__custom__">Custom model...</option>
    </select>
  );
}
