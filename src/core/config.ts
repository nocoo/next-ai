import { type AiProviderRegistry, defaultRegistry } from "./registry";
import type { AiConfig, AiConfigError, AiSettingsInput } from "./types";

/** 校验配置完整性，返回错误列表（空数组表示通过） */
export function validateAiConfig(
  input: Partial<AiSettingsInput>,
  registry: AiProviderRegistry = defaultRegistry,
): AiConfigError[] {
  const errors: AiConfigError[] = [];

  // 校验 provider
  if (!input.provider) {
    errors.push({ field: "provider", message: "Provider is required" });
  } else if (input.provider !== "custom" && !registry.get(input.provider)) {
    errors.push({
      field: "provider",
      message: `Unknown provider: ${input.provider}`,
    });
  }

  // 校验 apiKey
  if (!input.apiKey) {
    errors.push({ field: "apiKey", message: "API key is required" });
  }

  // 校验 custom provider 特有字段
  if (input.provider === "custom") {
    if (!input.baseURL) {
      errors.push({
        field: "baseURL",
        message: "Base URL is required for custom provider",
      });
    }
    if (!input.sdkType) {
      errors.push({
        field: "sdkType",
        message: "SDK type is required for custom provider",
      });
    }
    if (!input.model) {
      errors.push({
        field: "model",
        message: "Model is required for custom provider",
      });
    }
  }

  return errors;
}

/** 解析配置（校验通过后调用） */
export function resolveAiConfig(
  input: AiSettingsInput,
  registry: AiProviderRegistry = defaultRegistry,
): AiConfig {
  // 先校验
  const errors = validateAiConfig(input, registry);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => `${e.field}: ${e.message}`).join("; "));
  }

  const { provider, apiKey, model, baseURL, sdkType } = input;

  if (provider === "custom") {
    // baseURL and sdkType are validated above, so they must exist
    if (!baseURL || !sdkType) {
      throw new Error("Invalid custom provider configuration");
    }
    return { provider, baseURL, apiKey, model, sdkType };
  }

  // Provider is validated above
  const providerInfo = registry.get(provider);
  if (!providerInfo) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return {
    provider,
    baseURL: providerInfo.baseURL,
    apiKey,
    model: model || providerInfo.defaultModel,
    sdkType: providerInfo.sdkType,
  };
}

/** 检查 provider 是否有效 */
export function isValidProvider(
  id: string,
  registry: AiProviderRegistry = defaultRegistry,
): boolean {
  return id === "custom" || registry.get(id) !== undefined;
}
