"use client";

import { useProviderRegistry } from "../hooks";
import { cn } from "../styles";

export interface ProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Provider 选择器，支持内置和自定义 Provider
 *
 * 下拉选项：
 * - Anthropic
 * - MiniMax
 * - GLM (Zhipu)
 * - AIHubMix
 * - ────────────
 * - Custom
 */
export function ProviderSelect({
  value,
  onChange,
  disabled,
  className,
  id,
}: ProviderSelectProps) {
  const registry = useProviderRegistry();
  const providers = registry.getAll();

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
      <option value="">Select provider...</option>
      {providers.map((provider) => (
        <option key={provider.id} value={provider.id}>
          {provider.label}
        </option>
      ))}
      <option disabled>──────────</option>
      <option value="custom">Custom</option>
    </select>
  );
}
