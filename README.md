<h1 align="center">next-ai</h1>
<p align="center">为 Next.js、Vite 和 React 项目提供多模型服务接入与配置界面。</p>
<p align="center"><a href="docs/README.en.md">English</a></p>

## 这是什么

`@nocoo/next-ai` 基于 Vercel AI SDK 统一模型服务配置、调用辅助与 React 设置界面。支持 Next.js、Vite、vinext 等框架；消费项目通过存储适配器提供自己的后端与数据库。

## 功能

- 内置 Anthropic、MiniMax、GLM、AIHubMix，以及自定义 URL 服务配置。
- 提供服务选择、模型选择、API Key 输入和连接测试界面。
- 统一文本生成、对话、流式输出与重试辅助。
- 多段提示词模板、变量替换和自定义服务注册。
- 分离浏览器与服务器入口，支持 Next.js `server-only` 保护。

## 使用

需要 Node.js 22+。使用 React 设置界面时安装相应 peer dependencies：

```sh
npm install @nocoo/next-ai
npm install react react-dom tailwindcss
```

仅在服务器端创建模型：

```typescript
import { resolveAiConfig, createAiModel } from "@nocoo/next-ai/server";

const apiKey = process.env.AI_API_KEY;
if (!apiKey) throw new Error("AI_API_KEY is required");
const config = resolveAiConfig({ provider: "anthropic", apiKey });
const model = createAiModel(config);
```

Next.js App Router 可改用 `@nocoo/next-ai/server-next` 并安装 `server-only`，防止服务器代码误入客户端。React 组件从 `@nocoo/next-ai/react` 导入，通过 `AiStorageAdapter` 读写应用后端。API Key 保存在服务器；客户端只处理新输入或脱敏显示。适配器、路由、UI 与样式示例见[集成说明](docs/integration.md)。

## 开发

用 Bun 安装依赖，构建由 tsup 输出 `dist/`。

```sh
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run build
```

`src/core/` 保存类型、服务与模板，`src/server/` 保存调用辅助，`src/react/` 保存界面。示例在 `examples/next-app/` 与 `examples/vite-app/`，需先构建库，再安装各自依赖。

## 测试

```sh
bun run test
bun run test:coverage
```

Vitest 检查核心库逻辑；React 界面通过示例项目的 Playwright 流程验证。可选 `bun run test:integration` 仅在提供 `TEST_ANTHROPIC_API_KEY` 时调用真实模型服务，常规本地测试不需要该凭据。示例的启动和测试命令见各自 `package.json` 与 Playwright 配置。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| TypeScript、tsup | 类型与包构建 |
| Vercel AI SDK | 模型服务适配与调用 |
| React、Tailwind CSS | 设置界面 |
| Bun、Biome | 依赖与静态检查 |
| Vitest、Playwright | 核心逻辑与示例界面测试 |

## 文档

- [完整集成与 API 说明](docs/integration.md)。
- [Next.js 示例](examples/next-app/)与[Vite 示例](examples/vite-app/)。
- [公共类型](src/core/types.ts)与[内置服务配置](src/core/providers.ts)。

## 许可证

[MIT](LICENSE)
