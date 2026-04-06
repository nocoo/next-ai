import { type ModelMessage, generateText, streamText } from "ai";
import { resolveAiConfig } from "../core/config";
import type { AiSettingsInput } from "../core/types";
import { createAiModel } from "./client";

/** AI Helper 选项 */
export interface AiHelperOptions {
  settings: AiSettingsInput;
  maxOutputTokens?: number;
  temperature?: number;
  /** 超时时间（毫秒），默认 60000 */
  timeout?: number;
}

/** AI 完成结果 */
export interface AiCompletionResult {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

/** 简单文本生成 */
export async function aiComplete(
  prompt: string,
  options: AiHelperOptions,
): Promise<AiCompletionResult> {
  const startTime = Date.now();
  const config = resolveAiConfig(options.settings);
  const model = createAiModel(config);

  const { text, usage } = await generateText({
    model,
    prompt,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    abortSignal: AbortSignal.timeout(options.timeout ?? 60000),
  });

  return {
    text,
    usage: {
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
    },
    durationMs: Date.now() - startTime,
  };
}

/** 多轮对话 */
export async function aiChat(
  messages: ModelMessage[],
  options: AiHelperOptions,
): Promise<AiCompletionResult> {
  const startTime = Date.now();
  const config = resolveAiConfig(options.settings);
  const model = createAiModel(config);

  const { text, usage } = await generateText({
    model,
    messages,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    abortSignal: AbortSignal.timeout(options.timeout ?? 60000),
  });

  return {
    text,
    usage: {
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
    },
    durationMs: Date.now() - startTime,
  };
}

/** 流式文本生成 */
export async function aiStream(
  prompt: string,
  options: AiHelperOptions,
): Promise<ReadableStream<string>> {
  const config = resolveAiConfig(options.settings);
  const model = createAiModel(config);

  const { textStream } = streamText({
    model,
    prompt,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    abortSignal: AbortSignal.timeout(options.timeout ?? 60000),
  });

  return textStream;
}

/** 带自动重试的文本生成 */
export async function aiCompleteWithRetry(
  prompt: string,
  options: AiHelperOptions & { retries?: number; retryDelay?: number },
): Promise<AiCompletionResult> {
  const { retries = 3, retryDelay = 1000, ...helperOptions } = options;

  // Validate retries parameter
  if (retries < 1) {
    throw new Error("retries must be at least 1");
  }

  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await aiComplete(prompt, helperOptions);
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (i + 1)),
        );
      }
    }
  }

  throw lastError;
}
