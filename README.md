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
