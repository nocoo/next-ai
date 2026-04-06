// Server entry point - exports AI client and helpers
export { createAiClient, createAiModel } from "./server/client";
export {
  aiChat,
  aiComplete,
  aiCompleteWithRetry,
  aiStream,
} from "./server/helpers";
export { resolveAiConfig, validateAiConfig } from "./core/config";
export { expandTemplate } from "./core/utils";
export { PromptTemplateRegistry } from "./core/templates";

// Core Types
export type { AiConfig, AiConfigError } from "./core/types";

// Helper Types (from helpers.ts)
export type { AiCompletionResult, AiHelperOptions } from "./server/helpers";

// Template Types
export type { TemplateVariables } from "./core/utils";
