# REPORT — 同频 Campus V0.3 回归测试报告

- **测试时间**：2026-11-03 20:05–20:12 (UTC+8)
- **执行者**：WorkBuddy 主 Agent（QA 子 Agent 因额度限制未能启动，由主 Agent 按既定 B 范围执行）
- **基准 commit**：`1a580a19d13b9719c134c6f367ff09d49ce2d483` + 33 项未提交工作区修改（GLM V0.2 + 本轮 V0.3 修改）
- **BASE_URL**：http://localhost:5173/（Vite dev server）
- **环境**：Node v22 / npm 10.9.7 / Playwright 1.64.1（Chromium，桌面默认 UA）
- **视口清单**：375×844、390×844、1280×900、1440×900

> 声明：本次为单浏览器模拟测试，非真实多设备联机；线上部署未执行（平台/账号待确认）。

---

## 一、工程健康检查（构建类）

| 项目 | 命令 | 退出码 | 结果 |
| --- | --- | --- | --- |
| TypeScript | `npx tsc -b` | 0 | PASS |
| Lint | `npm run lint`（oxlint） | 0 | PASS |
| 生产构建 | `npm run build`（tsc -b && vite build） | 0 | PASS |

原始日志：`logs/build-checks.log`、`logs/lint.log`、`logs/build.log`。

## 二、路由 × 视口回归（regression-v03.mjs）

12 条路由 × 4 视口 = 48 项 + 底栏遮挡抽查 1 项，**49/49 PASS**。
每项检查：页面加载、关键文本渲染、横向溢出（scrollWidth ≤ clientWidth+1）、console error / pageerror。
截图 49 张：`screenshots/P01..P12@{375,390,1280,1440}.png` + `bottom-nav-check@390.png`。

| 路由 | 375 | 390 | 1280 | 1440 |
| --- | --- | --- | --- | --- |
| /discover | PASS | PASS | PASS | PASS |
| /discover/people | PASS | PASS | PASS | PASS |
| /people/p-lin | PASS | PASS | PASS | PASS |
| /discover/activities | PASS | PASS | PASS | PASS |
| /activities/a-badminton | PASS | PASS | PASS | PASS |
| /nebula | PASS | PASS | PASS | PASS |
| /square | PASS | PASS | PASS | PASS |
| /messages | PASS | PASS | PASS | PASS |
| /messages/conv-1 | PASS | PASS | PASS | PASS |
| /me | PASS | PASS | PASS | PASS |
| /me/portrait/edit | PASS | PASS | PASS | PASS |
| /me/portrait/preview | PASS | PASS | PASS | PASS |

底栏遮挡抽查（390px，/discover 滚到底部）：PASS——视口底部中心点命中底部导航，主内容容器底部留白 ≥48px。

## 三、核心流程冒烟（smoke-v03.mjs，独立上下文 + localStorage 重置）

**15/15 PASS**。截图 12 张：`flows/`。

| 用例 | 断言 | 结果 |
| --- | --- | --- |
| A1 | 填昵称+1 兴趣+1 意图后进入预览页 | PASS |
| A2 | 预览页显示草稿昵称（预览≠公开） | PASS |
| A3 | 确认公开后出现在「找同频的人」列表 | PASS |
| B1 | 千屿详情页存在「打招呼」入口 | PASS |
| B2 | 打招呼后出现「等待对方回应」提示 | PASS |
| B3 | 刷新后不再出现可重复发送的打招呼按钮（不重复发邀请） | PASS |
| B4 | 切换身份到千屿，信息中心出现该待处理邀请 | PASS |
| B5 | 点击「接受」后跳转进入会话页 | PASS |
| C1 | 活动详情存在「申请报名」入口 | PASS |
| C2 | 报名后状态显示「待组织者确认」 | PASS |
| C3 | 切换身份到组织者阿柚，面板可见待确认申请 | PASS |
| C4 | 组织者确认后，申请者视角显示「已确认」 | PASS |
| A4/A5 | 撤回公开后从找人列表消失（已有互动保留） | PASS |
| N1 | 未公开 Portrait（/people/p-yizhou）直达显示未公开提示 | PASS |

## 四、受控失败演练

- 方法：`BASE_URL=http://localhost:5999`（不存在的服务）运行 regression-v03.mjs
- 结果：49/49 FAIL，进程退出码 1（`logs/controlled-failure-drill.log`）
- 结论：脚本失败语义有效，PASS 结果可信。

## 五、发现的真实缺陷

无。本轮回归未发现新缺陷。（lint 存在 1 条历史 warning 级提示，不阻塞，见 lint.log。）

## 六、遗留问题（不阻塞本轮验收，均已在文档登记）

1. 线上部署未执行：平台/域名/账号权限待确认（OPEN_QUESTIONS）。
2. 邀请「拒绝」操作、重复邀请的产品规则、身份切换的正式产品形态仍待确认——当前实现为演示模式，Q1~Q5 选择系朋友代操作，未经项目负责人独立确认。
3. 星云拖拽/缩放/搜索未实现（未批准范围）；广场四模块为蓝图占位。
4. 会话内真实收发消息未实现（会话入口即终点）。
5. localStorage 仅当前浏览器上下文有效，非跨设备同步；线上若需联机须另行架构决策。

## 七、证据清单

- `screenshots/`：49 张路由视口截图
- `flows/`：12 张流程步骤截图
- `logs/build-checks.log` / `lint.log` / `build.log` / `controlled-failure-drill.log`
- 测试脚本：`app/scripts/regression-v03.mjs`、`app/scripts/smoke-v03.mjs`（可重复执行）
