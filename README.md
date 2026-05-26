# 高中英语语法与语感渐进式学习网页 MVP

请特别注意：这个学习系统必须是自适应的。每一个 next part 都不能只是固定下一课，而要根据学生刚才的回答、错误类型、掌握程度和近期学习记录动态生成。第一版先用 mock diagnosis 和规则引擎实现，代码结构预留 GPT 评分、GPT 诊断和 GPT 生成 next part 的接口。

## 当前实现

- React + TypeScript + Vite + Tailwind CSS
- 单页应用，包含首页、阶段选择、句子学习、句子扩展、长句拆解、段落训练、短文训练、学习记录
- `src/services/gptService.ts` 统一保留 AI 业务入口，优先调用 `src/services/minimaxService.ts`
- `src/services/learnerProfileService.ts` 使用本地学习者档案区分不同学生
- `src/services/progressService.ts` 按学习者和学段版本保存学习记录，当前仍以 `localStorage` 为主
- 动态学习路径：当前任务 -> 学生回答 -> MiniMax/本地 fallback 反馈 -> 学习诊断 -> next part

## 学习者档案与账号路线

当前版本已经支持在同一浏览器中创建、切换多个学习者档案。每个学习者都有独立的学段版本、学习节奏、每日任务记录、生词累计、阶段报告和自适应路径，避免不同学生的学习记录互相覆盖。

新学习者首次进入时会先完成 3 个轻量定位任务：

- 场景理解：判断说话人真正想表达什么。
- 表达改写：把不自然的中式英语改成更真实的英语。
- 迁移表达：在相似真实场景中写出自己的句子。

定位结果会设置学习起点、学段版本、每日任务重量、第一周方向和主要薄弱项。第一版使用本地规则评分，后续可以把同一接口接到 MiniMax/GPT 诊断。

这还不是完整云端账号体系。公开测试初期建议先保持最小数据采集：只记录学习者昵称和学习数据，不收集学校、手机号、真实姓名等敏感信息。进入跨设备使用或正式内测时，应接入：

- Auth：学生/家长登录、匿名测试账号或一次性邀请码。
- Database：按 `learnerId` 保存 `ProgressState`、学习反馈、阶段报告和调参记录。
- Sync API：把当前 `progressService` 的本地读写替换为“本地缓存 + 云端同步”。
- Privacy：未成年人数据最小化、家长可删除、发布前说明数据用途。

## 学习小组路线

学习小组需要建立在云端账号体系之上。建议的小组原则：

- 主动加入：通过邀请码或申请加入，成员可随时退出。
- 分层公开：默认公开进度摘要、难点标签和求助卡，不公开完整个人答案。
- 竞合机制：鼓励连续参与、帮助同伴、表达改进和小组共同目标，避免单纯分数排行。
- 互动任务：难点求助卡、表达接力、错句诊所、词语救援和小组周任务。

更完整的 Copilot、异步学习小组和反馈升级机制见 [`docs/PRODUCT_LOOPS.md`](docs/PRODUCT_LOOPS.md)。

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
