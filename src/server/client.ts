import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { AiConfig } from "../core/types";

/** 创建 AI 客户端（根据 sdkType 选择 Anthropic 或 OpenAI） */
export function createAiClient(config: AiConfig) {
  const { baseURL, apiKey, sdkType } = config;

  if (sdkType === "openai") {
    return createOpenAI({ baseURL, apiKey });
  }
  return createAnthropic({ baseURL, apiKey });
}

/** 创建 AI 模型实例（用于 Vercel AI SDK） */
export function createAiModel(config: AiConfig) {
  const client = createAiClient(config);
  return client(config.model);
}
