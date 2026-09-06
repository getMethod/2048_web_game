# 2048 数字挑战

一个使用 React、TypeScript 和 Vite 构建的纯前端 2048 桌面网页游戏，支持深浅主题、键盘控制、单步撤销和本地存档。

## 原型与项目规则

- 深色原型：`img/2048_dark_pic.png`
- 浅色原型：`img/2048_light_pic.png`
- 完整需求：`projectPlan.md`
- 开发约束：`AGENTS.md`

书面需求优先于原型图；原型图用于参考布局、配色和科技感方向。

## 开发命令

```bash
npm install
npm run dev
```

开发服务器启动后，按终端提示打开本地地址。

## 质量检查

```bash
npm run typecheck
npm run lint
npm run format
npm run test
npm run test:e2e
npm run build
```

Playwright 首次运行前可能需要安装浏览器：

```bash
npx playwright install
```

## 主题令牌

- 通用尺寸、排版和动效令牌：`src/styles/tokens.css`
- 深浅主题语义颜色：`src/styles/themes.css`
- 全局基础样式：`src/styles/global.css`
- 动画与降级：`src/styles/animations.css`

主题偏好保存在 `jy-2048:theme:v1`。首次访问且没有保存偏好时，会读取系统配色偏好。

## 本地数据

- 棋局：`jy-2048:game:v1`
- 最高分：`jy-2048:best-score:v1`
- 主题：`jy-2048:theme:v1`

所有数据都只保存在当前浏览器中。损坏或不合法的棋局存档会被忽略并自动初始化新棋局。

## 静态部署

执行 `npm run build` 后会生成标准静态目录 `dist/`。可将该目录部署到任意静态站点服务。

## 首轮界面优化

按 `projectPlan.md` 第 9 节的首轮范围实施，沿用 React、TypeScript 和原生 CSS，未增加依赖。

- 棋盘展示真实移动路径、合并回弹及新方块出生；快速输入按顺序计算，动画中可以撤销或重开。
- 合并后显示真实加分增量；每局首次严格突破开始/恢复时的最高分基准，提示一次“新纪录”。
- 玩法卡片首次进入视口播放一次，可通过按钮重播；离屏停止，固定演示数据不影响真实棋局。
- 游戏介绍、玩法说明和游戏区域单次渐入；锚点及键盘焦点进入时立即显示。介绍卡片更简洁，玩法卡片突出示意与步骤。
- 减少动态效果时直接展示最终状态和静态提示；离屏/页面隐藏暂停持续装饰；对话框支持焦点循环及关闭后返回触发控件。

`game/engine.ts` 返回来源/目标坐标、合并关系和出生位置。临时 `GameSession` 信息不会写入存档；原有 v1 存储键及合法存档继续兼容。随机值在事件入口采样，Reducer 重算保持确定性。

所有动画时长、幅度及全局关键帧名称变量位于 `src/styles/tokens.css`；深浅主题的呼吸光基础与峰值在 `src/styles/themes.css`。调整滑动、合并时长时，需要同步维护 `--motion-board-total`（默认 280ms）。

## 第二阶段界面优化

- 导航根据固定导航下方的阅读参考线标记当前板块，同一时刻只保留一个 `aria-current="location"`，滚动不会移动键盘焦点。
- 方向键、W/A/S/D 与方向按钮显示一致的短暂按下反馈；无效移动不显示合并结果，窗口失焦会清除反馈。
- 成功撤销后以礼貌播报显示短暂“已撤销”，无撤销记录时按钮保持禁用。
- 深浅主题选中底板在两个选项之间滑动，同时保留描边、`aria-pressed`、键盘操作及游戏状态。
- 减少动态效果时关闭新增位移动画；首屏鼠标视差仍作为低优先级可选项保留。

## 优化验收（2026-09-06）

- TypeScript、ESLint、Prettier、Vite 生产构建通过。
- Vitest：21 项通过，覆盖引擎、四方向路径、多组合并、出生位置、连续操作、纪录边界和存档规则。
- Playwright：Chrome、Edge、WebKit 各 23 项，共 69 项通过。覆盖动画中间位置、合并/出生阶段、快速输入、导航位置、方向联动、撤销反馈、主题底板、演示隔离、焦点、减少动态效果及无观察器降级。
- 深浅主题已核对 1440px 和 1024px 截图与首屏光晕峰值；另在 600px 和 375px 验证无水平溢出、棋盘保持正方形。截图保存在 `test-results/` 的各测试目录中，采集前回到页首并将动画收束到静态状态。

可复现的已通过浏览器检查命令：

```bash
npx playwright test --project=chrome --project=edge --project=webkit --workers=3
```

未验证项：本机 Playwright Firefox 无法启动，报 `spawn UNKNOWN`；直接运行该浏览器提示“应用程序的并行配置不正确”。因此完整 `npm run test:e2e` 包含 Firefox 时仍不能全部通过，需要先修复本机 Firefox 运行环境后复测。WebKit 结果用于内核兼容检查，不能替代真实 macOS Safari 桌面版验收；本次未执行真实 Safari 验证。
