# 同频 Campus：启动包说明

本包只包含**背景和产品规划文件**，不是成品代码，更不表示团队已批准比赛 MVP。

## 使用
1. 将本文件夹内容解压到你选择的独立 Windows 工作目录（例如 E:\Projects\CampusTongpin；这只是建议，避免与已有项目混用）。
2. 打开 Codex 时选择该文件夹作为工作目录。
3. 复制 `docs/04_CODEX_START_PROMPT.md` 的正文到 Codex 进行只读核对；若继续在 ChatGPT 一问一答，暂时不需要安装 grill-me。
4. 若要在 Codex 使用 grill-me，先审阅第三方 SKILL.md，再在当前目录执行 `npx skills@latest add satya-janghu/agent-skills/skills/grill-me`；交互中选择 Codex 与项目本地安装。Codex 官方支持 `.agents/skills` 项目路径；安装后核对实际位置，必要时重启 Codex。
5. 每 3–5 个关键问答回写 `docs/01_DECISION_LEDGER.md` 与 `docs/03_HANDOFF_STATUS.md`；新的 ChatGPT 对话以这两个文件 + 原始 JSON 恢复即可。

## 文件用途
- `00_CONTEXT_SOURCE.json`：未经修改的用户恢复文件（不要用摘要覆盖）。
- `references/official/*.md`：从原 JSON 内原文抽出的两份赛题及材料说明。
- `AGENTS.md`：项目共识与约束，Codex/Agent 入口文件。
- `docs/01_DECISION_LEDGER.md`：唯一正式决策增量日志。
- `docs/02_OPEN_QUESTIONS.md`：高优先级问题队列。
- `docs/03_HANDOFF_STATUS.md`：跨会话轻量接力状态。
- `docs/04_CODEX_START_PROMPT.md`：Codex 审查模式启动提示词。
- `references/ui/`：可补入原始 UI 图片。

**注意**：这些模板中的“已确定”来源于恢复 JSON；如团队后来更改，请明确记录新决定的时间与理由。第三方 Skill 需要自主核查安全风险；不要盲目授予执行权限。
