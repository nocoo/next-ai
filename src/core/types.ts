/** SDK 协议类型 */
export type SdkType = "anthropic" | "openai";

/** 内置 Provider ID */
export type BuiltinProvider = "anthropic" | "minimax" | "glm" | "aihubmix";

/** 所有 Provider ID（含 custom） */
export type AiProvider = BuiltinProvider | "custom" | (string & {});

/** Provider 静态配置 */
export interface AiProviderInfo {
  id: string;
  label: string;
  baseURL: string;
  sdkType: SdkType;
  models: string[];
  defaultModel: string;
}

/** 运行时完整配置 */
export interface AiConfig {
  provider: string;
  baseURL: string;
  apiKey: string;
  model: string;
  sdkType: SdkType;
}

/** 用户输入的设置（写入存储） */
export interface AiSettingsInput {
  provider: string;
  apiKey: string;
  model: string;
  baseURL?: string;
  sdkType?: SdkType;
}

/** 从存储读取的设置（读取模型，apiKey 永不返回真实值） */
export interface AiSettingsReadonly {
  provider: string;
  model: string;
  hasApiKey: boolean;
  baseURL?: string;
  sdkType?: SdkType;
}

/** 测试连接的配置（草稿配置，无需先保存） */
export interface AiTestConfig {
  provider: string;
  /** API Key - 如果为空或未提供，服务端应使用已存储的 key */
  apiKey?: string;
  model: string;
  baseURL?: string;
  sdkType?: SdkType;
}

/** 存储适配器接口 - 消费方必须实现 */
export interface AiStorageAdapter {
  /** 获取当前设置（读取模型，不含真实 apiKey） */
  getSettings(): Promise<AiSettingsReadonly>;

  /** 保存设置（部分更新） */
  saveSettings(settings: Partial<AiSettingsInput>): Promise<AiSettingsReadonly>;

  /** 测试 AI 连接（使用草稿配置，无需先保存） */
  testConnection(config: AiTestConfig): Promise<AiTestResult>;
}

/** AI 连接测试结果 */
export interface AiTestResult {
  success: boolean;
  response?: string;
  model?: string;
  provider?: string;
  error?: string;
}

/** 配置校验错误 */
export interface AiConfigError {
  field: string;
  message: string;
}
