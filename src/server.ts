// Server entry point - exports AI client and helpers

export {
  resolveAiConfig,
  validateAiConfig,
  validateTestConfig,
} from "./core/config";
export { PromptTemplateRegistry } from "./core/templates";
// Core Types
export type { AiConfig, AiConfigError } from "./core/types";
// Template Types
export type { TemplateVariables } from "./core/utils";
export { expandTemplate } from "./core/utils";
export { createAiClient, createAiModel } from "./server/client";

// Helper Types (from helpers.ts)
export type { AiCompletionResult, AiHelperOptions } from "./server/helpers";
export {
  aiChat,
  aiComplete,
  aiCompleteWithRetry,
  aiStream,
} from "./server/helpers";
