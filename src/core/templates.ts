import { type TemplateVariables, expandTemplate } from "./utils";

/** 模板变量定义 */
export interface TemplateVariable {
  /** 变量名，如 "date" */
  key: string;
  /** 显示名称，如 "日期" */
  label: string;
  /** 描述 */
  description?: string;
  /** 示例值 */
  example?: string;
  /** 是否必填，默认 true */
  required?: boolean;
}

/** Prompt 段落 */
export interface PromptSection {
  /** 段落 ID，如 "section1" */
  id: string;
  /** 显示名称，如 "角色设定" */
  label: string;
  /** 模板内容，含 {{variable}} */
  content: string;
  /** 用户是否可编辑，默认 true */
  editable?: boolean;
}

/** Prompt 模板定义 */
export interface PromptTemplate {
  /** 唯一标识，如 "daily-analysis" */
  id: string;
  /** 显示名称，如 "每日分析" */
  name: string;
  /** 模板描述 */
  description?: string;
  /** 多段式 prompt */
  sections: PromptSection[];
  /** 变量定义 */
  variables: TemplateVariable[];
}

/** 模板注册表 */
export class PromptTemplateRegistry {
  private templates: Map<string, PromptTemplate> = new Map();

  /** 注册模板 */
  register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /** 获取模板 */
  get(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /** 获取所有模板 */
  getAll(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /** 获取所有模板 ID */
  getAllIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /** 检查模板是否存在 */
  has(id: string): boolean {
    return this.templates.has(id);
  }

  /** 构建完整 prompt（展开变量，合并段落） */
  build(
    templateId: string,
    variables: TemplateVariables,
    customSections?: Record<string, string>,
  ): string {
    const template = this.get(templateId);
    if (!template) throw new Error(`Unknown template: ${templateId}`);

    return template.sections
      .map((section) => {
        const content = customSections?.[section.id] ?? section.content;
        return expandTemplate(content, variables);
      })
      .join("\n\n");
  }
}
