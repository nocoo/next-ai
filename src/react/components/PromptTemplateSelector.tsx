"use client";

import type { PromptTemplateRegistry } from "../../core/templates";
import { cn } from "../styles";

export interface PromptTemplateSelectorProps {
  registry: PromptTemplateRegistry;
  value: string;
  onChange: (templateId: string) => void;
  /** 是否显示模板详情 */
  showDetails?: boolean;
  className?: string;
}

/**
 * 模板选择器，用于多模板场景
 *
 * 布局：
 * ┌─────────────────────────────────────────┐
 * │ Select template: [每日分析 ▼]           │
 * ├─────────────────────────────────────────┤
 * │ (if showDetails)                        │
 * │ 描述：分析用户一天的屏幕使用数据         │
 * │ 变量：date, totalDuration, topApps...   │
 * └─────────────────────────────────────────┘
 */
export function PromptTemplateSelector({
  registry,
  value,
  onChange,
  showDetails = false,
  className,
}: PromptTemplateSelectorProps) {
  const templates = registry.getAll();
  const selectedTemplate = value ? registry.get(value) : undefined;

  return (
    <div className={cn("space-y-3", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex h-10 w-full rounded-lg px-3 py-2",
          "text-sm",
          "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
        )}
      >
        <option value="">Select template...</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>

      {showDetails && selectedTemplate && (
        <div
          className={cn(
            "rounded-lg p-4",
            "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
            "border border-[hsl(var(--border))]",
            "text-sm space-y-2",
          )}
        >
          {selectedTemplate.description && (
            <p>
              <span className="font-medium">Description: </span>
              {selectedTemplate.description}
            </p>
          )}
          {selectedTemplate.variables.length > 0 && (
            <p>
              <span className="font-medium">Variables: </span>
              {selectedTemplate.variables.map((v) => v.key).join(", ")}
            </p>
          )}
          <p>
            <span className="font-medium">Sections: </span>
            {selectedTemplate.sections.length}
          </p>
        </div>
      )}
    </div>
  );
}
