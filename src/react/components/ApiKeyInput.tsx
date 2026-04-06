"use client";

import { useState } from "react";
import { cn } from "../styles";

export interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  hasStoredKey?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * API Key 输入框，支持显示/隐藏切换，已保存状态提示
 *
 * 状态：
 * 1. 未设置：显示空输入框
 * 2. 已设置（hasStoredKey=true）：显示 "●●●●●●●●" 占位
 * 3. 输入中：显示实际输入（可切换显示/隐藏）
 *
 * 交互：
 * - 右侧眼睛图标切换显示/隐藏
 * - 已设置时，点击输入框清空占位开始输入
 */
export function ApiKeyInput({
  value,
  onChange,
  hasStoredKey,
  disabled,
  className,
  id,
}: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  const showPlaceholder = hasStoredKey && !editing && !value;

  const handleFocus = () => {
    if (showPlaceholder) {
      setEditing(true);
    }
  };

  const handleBlur = () => {
    if (!value) {
      setEditing(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={showPlaceholder ? "●●●●●●●●●●●●" : value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter API key..."
        disabled={disabled}
        readOnly={showPlaceholder}
        className={cn(
          "flex h-10 w-full rounded-lg px-3 py-2 pr-10",
          "text-sm font-mono",
          "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]",
          "placeholder:text-[hsl(var(--muted-foreground))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          showPlaceholder &&
            "cursor-pointer text-[hsl(var(--muted-foreground))]",
        )}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        disabled={disabled || showPlaceholder}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "p-1 rounded",
          "text-[hsl(var(--muted-foreground))]",
          "hover:text-[hsl(var(--foreground))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label={visible ? "Hide API key" : "Show API key"}
      >
        {visible ? (
          // Eye-off icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          // Eye icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
