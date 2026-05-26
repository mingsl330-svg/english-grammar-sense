# 高中英语语法与语感渐进式学习网页 MVP

请特别注意：这个学习系统必须是自适应的。每一个 next part 都不能只是固定下一课，而要根据学生刚才的回答、错误类型、掌握程度和近期学习记录动态生成。第一版先用 mock diagnosis 和规则引擎实现，代码结构预留 GPT 评分、GPT 诊断和 GPT 生成 next part 的接口。

## 当前实现

- React + TypeScript + Vite + Tailwind CSS
- 单页应用，包含首页、阶段选择、句子学习、句子扩展、长句拆解、段落训练、短文训练、学习记录
- `src/services/gptService.ts` 统一保留 AI 业务入口，优先调用 `src/services/minimaxService.ts`
- `src/services/progressService.ts` 使用 `localStorage` 保存学习记录
- 动态学习路径：当前任务 -> 学生回答 -> MiniMax/本地 fallback 反馈 -> 学习诊断 -> next part

## MiniMax 配置

正式上线建议使用后端代理，不要把 MiniMax API key 放在前端包里。

应用内也提供“设置”页面，可以在当前浏览器保存 MiniMax API key、模型名、直连 API URL 或代理 URL。运行时设置优先级高于 `.env` 配置。

本项目已经内置 Vercel 代理接口：

```text
/api/minimax/chat
```

公网部署时推荐只让前端调用这个代理，真实 key 放在 Vercel 环境变量里。

```bash
cp .env.example .env.local
```

推荐生产配置：

```bash
VITE_MINIMAX_PROXY_URL=/api/minimax/chat
VITE_MINIMAX_MODEL=MiniMax-M2.7
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_API_URL=https://api.minimaxi.com/v1/chat/completions
MINIMAX_MODEL=MiniMax-M2.7
```

本地临时直连测试可以使用：

```bash
VITE_MINIMAX_API_KEY=your_minimax_api_key
VITE_MINIMAX_API_URL=https://api.minimaxi.com/v1/chat/completions
VITE_MINIMAX_MODEL=MiniMax-M2.7
```

如果 MiniMax 配置不存在或接口失败，系统会继续使用本地规则反馈，保证学习流程不中断。

## Vercel 部署

1. 把项目推到 GitHub。
2. 在 Vercel 选择 Import Project。
3. Framework 选择 Vite。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```text
dist
```

6. 在 Vercel Environment Variables 配置：

```bash
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_API_URL=https://api.minimaxi.com/v1/chat/completions
MINIMAX_MODEL=MiniMax-M2.7
VITE_MINIMAX_PROXY_URL=/api/minimax/chat
```

注意：真实 MiniMax key 使用 `MINIMAX_API_KEY`，不要使用 `VITE_MINIMAX_API_KEY`，否则 key 会进入前端包。

部署后进入“设置”，Proxy URL 填 `/api/minimax/chat`，Direct API key 可以留空。

## 运行

```bash
npm install
npm run dev
```
