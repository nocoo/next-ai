import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { AiConfig } from "../core/types";

/**
 * 创建 AI 客户端（根据 sdkType 选择 Anthropic 或 OpenAI）。
 *
 * 认证头处理：
 * - `authType === "bearer"`：强制 `Authorization: Bearer <apiKey>` 请求头，
 *   不发 `x-api-key`。Anthropic SDK 默认走 `x-api-key`，部分网关
 *   （e.g. manifest.build）只认 Bearer。OpenAI SDK 本身就用 Bearer 头，
 *   这里也兼容显式注入。
 * - 缺省 / `"apiKey"`：按 SDK 默认行为（Anthropic 走 `x-api-key`，
 *   OpenAI 走 `Authorization: Bearer`）。
 */
export function createAiClient(config: AiConfig) {
  const { baseURL, apiKey, sdkType, authType } = config;
  const useBearer = authType === "bearer";

  if (sdkType === "openai") {
    if (useBearer) {
      return createOpenAI({
        baseURL,
        apiKey,
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    }
    return createOpenAI({ baseURL, apiKey });
  }

  // Anthropic SDK
  if (useBearer) {
    // The Anthropic provider requires `apiKey` to be set (it injects it into
    // the `x-api-key` header). Pass a placeholder and override with explicit
    // `Authorization: Bearer` headers so the gateway sees only the Bearer token.
    return createAnthropic({
      baseURL,
      apiKey,
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }
  return createAnthropic({ baseURL, apiKey });
}

/** 创建 AI 模型实例（用于 Vercel AI SDK） */
export function createAiModel(config: AiConfig) {
  const client = createAiClient(config);
  return client(config.model);
}
