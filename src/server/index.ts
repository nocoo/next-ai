export { createAiClient, createAiModel } from "./client";
export {
  aiChat,
  aiComplete,
  aiCompleteWithRetry,
  aiStream,
  type AiCompletionResult,
  type AiHelperOptions,
} from "./helpers";

// Re-export config functions for server-side use
export {
  resolveAiConfig,
  validateAiConfig,
  validateTestConfig,
} from "../core/config";
