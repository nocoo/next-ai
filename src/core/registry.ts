import { BUILTIN_PROVIDERS } from "./providers";
import type { AiProviderInfo } from "./types";

/** 可扩展 Provider 注册器 */
export class AiProviderRegistry {
  private providers: Map<string, AiProviderInfo>;

  constructor(customProviders?: Record<string, AiProviderInfo>) {
    this.providers = new Map(Object.entries(BUILTIN_PROVIDERS));
    if (customProviders) {
      for (const [id, info] of Object.entries(customProviders)) {
        this.providers.set(id, info);
      }
    }
  }

  /** 获取指定 Provider 配置 */
  get(id: string): AiProviderInfo | undefined {
    return this.providers.get(id);
  }

  /** 获取所有 Provider 配置 */
  getAll(): AiProviderInfo[] {
    return Array.from(this.providers.values());
  }

  /** 获取所有 Provider ID（含 custom） */
  getAllIds(): string[] {
    return [...this.providers.keys(), "custom"];
  }

  /** 注册新 Provider */
  register(info: AiProviderInfo): void {
    this.providers.set(info.id, info);
  }

  /** 检查 Provider 是否存在 */
  has(id: string): boolean {
    return id === "custom" || this.providers.has(id);
  }
}

/** 默认注册器实例 */
export const defaultRegistry = new AiProviderRegistry();
