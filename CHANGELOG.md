# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-04-06

### Added

- **Vite/vinext Compatibility** — New `/server` entry without `server-only` for Vite-based projects
- **Next.js Strict Mode** — New `/server-next` entry with `server-only` guard for Next.js App Router

### Changed

- `server-only` is now an optional peer dependency (only needed for `/server-next`)
- `/server` no longer imports `server-only`, making it compatible with Vite SSR

## [0.1.0] - 2026-04-06

### Added

- **Core Types** — Full TypeScript definitions for AI configuration, providers, and storage adapters
- **Multi-Provider Support** — Built-in support for Anthropic, MiniMax, GLM (Zhipu), AIHubMix
- **Custom Provider Registration** — `AiProviderRegistry` for adding custom providers with URL-based endpoints
- **Prompt Template System** — `PromptTemplateRegistry` for multi-section prompts with Mustache-style variable substitution
- **Server Helpers** — High-level functions: `aiComplete`, `aiChat`, `aiStream`, `aiCompleteWithRetry`
- **React Components**
  - `AiConfigProvider` — Context provider for settings management
  - `AiSettingsPanel` — Complete settings UI with provider, model, and API key configuration
  - `ProviderSelect`, `ModelSelect`, `ApiKeyInput` — Individual form components
  - `PromptTemplateSelector` — Template selection component
- **React Hooks** — `useAiSettings`, `useAiTest`, `useProviderRegistry`
- **Configuration Validation** — `validateAiConfig`, `validateTestConfig` for input validation
- **Server/Client Separation** — `server-only` protection for sensitive server modules
- **Basalt Design System** — CSS variable-based styling with light/dark mode support

### Security

- API keys stored server-side only (never in client localStorage)
- `server-only` package prevents accidental client-side imports of server modules
- Test connection supports using stored API key without re-entering

### Developer Experience

- 98.81% line coverage, 96.88% function coverage
- Biome for linting and formatting
- Husky pre-commit hooks for quality gates
- ESM and CJS dual format build
- Full TypeScript strict mode support
