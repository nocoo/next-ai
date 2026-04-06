/** 变量值类型（支持嵌套对象以支持 {{user.name}} 路径） */
export interface TemplateVariables {
  [key: string]: string | number | TemplateVariables;
}

/** 模板变量展开 - Mustache 风格 {{variable}} 或 {{object.path}} */
export function expandTemplate(
  template: string,
  variables: TemplateVariables,
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key: string) => {
    const value = key
      .split(".")
      .reduce(
        (
          obj: TemplateVariables | string | number | undefined,
          k: string,
        ): TemplateVariables | string | number | undefined =>
          typeof obj === "object" ? obj[k] : undefined,
        variables as TemplateVariables | string | number | undefined,
      );
    return value !== undefined && typeof value !== "object"
      ? String(value)
      : `{{${key}}}`;
  });
}

/** 格式化秒数为可读时长 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}min` : `${hrs}h`;
}

/** 解析 AI 响应 JSON（处理 markdown 代码块） */
export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch?.[1]) {
    cleaned = fenceMatch[1];
  }
  return JSON.parse(cleaned) as T;
}
