# 2048 网页版完整开发计划（含深浅主题原型）

## 1. 项目摘要与原型基准

开发一个纯前端、桌面优先的 2048 单机网页游戏。页面采用单页分区结构，依次展示：

1. 顶部导航与主题切换
2. 游戏主视觉
3. 游戏介绍
4. 玩法说明
5. 2048 游戏界面

以下两张工作区图片作为布局、组件、配色和视觉风格的开发参照：

### 深色科技主题原型

![2048 深色科技主题原型](./img/2048_dark_pic.png)

### 浅色科技主题原型

![2048 浅色科技主题原型](./img/2048_light_pic.png)

原型用于视觉参照，书面需求用于功能和交互判定；两者冲突时以本计划的书面规约为准。

## 2. 技术栈与项目结构

- React + TypeScript + Vite。
- 原生 CSS/CSS Modules，通过 CSS 自定义属性实现主题令牌。
- React `useReducer` 和自定义 Hook 管理游戏状态，不引入额外状态管理库。
- LocalStorage 保存棋局、最高分和主题偏好。
- Vitest 测试游戏引擎与状态转换。
- Playwright 测试键盘操作、主题切换、存档恢复和完整页面流程。
- ESLint、Prettier 和 TypeScript 严格模式保证代码质量。

```text
2048_web/
├─ projectPlan.md
├─ img/
│  ├─ 2048_dark_pic.png
│  └─ 2048_light_pic.png
├─ src/
│  ├─ app/App.tsx
│  ├─ components/
│  │  ├─ Header.tsx
│  │  ├─ ThemeSwitch.tsx
│  │  ├─ GameBoard.tsx
│  │  ├─ ScoreBoard.tsx
│  │  └─ GameDialog.tsx
│  ├─ sections/
│  │  ├─ HeroSection.tsx
│  │  ├─ Introduction.tsx
│  │  ├─ HowToPlay.tsx
│  │  └─ GameSection.tsx
│  ├─ game/
│  │  ├─ engine.ts
│  │  ├─ types.ts
│  │  ├─ storage.ts
│  │  └─ useGame.ts
│  ├─ theme/
│  │  ├─ theme.ts
│  │  └─ useTheme.ts
│  └─ styles/
│     ├─ tokens.css
│     ├─ themes.css
│     ├─ global.css
│     └─ animations.css
├─ e2e/
├─ index.html
└─ package.json
```

## 3. 页面与游戏需求

### 页面结构

- 顶部导航包含“游戏介绍”“玩法说明”“开始游戏”和主题切换控件。
- 点击导航项后平滑滚动到对应板块。
- 主视觉显示“2048 数字挑战”“合并数字，挑战你的最高分”和“立即开始”按钮。
- “立即开始”按钮滚动并聚焦游戏区域。

### 游戏介绍板块

- 必须作为独立板块展示在主视觉和玩法说明之间，不得只在主视觉中用一句话替代。
- 标题为“游戏介绍”。
- 介绍文案为：“2048 是一款经典数字合并游戏。移动并合并相同数字，挑战更高分数，最终达成 2048。”
- 展示“4×4 棋盘”“单步撤销”“本地保存”三个功能标签。
- 布局和图形表现分别参照深色、浅色主题原型。

### 玩法说明板块

- 使用三个卡片说明“移动方块”“合并数字”“达成 2048”。
- 显示方向键示意、`2 + 2 → 4` 合并示意和 2048 达成示意。
- 页面文案使用简体中文。

### 游戏功能

- 4×4 棋盘初始化时生成两个方块。
- 新方块中 `2` 的概率为 90%，`4` 的概率为 10%。
- 支持方向键和 `W/A/S/D`。
- 单次移动中每个方块最多合并一次。
- 只有有效移动才生成新方块、计分、更新存档和撤销快照。
- 达到 2048 后允许继续游戏或重新开始。
- 无空格且无法继续合并时显示游戏结束状态。
- 支持单步撤销、重新开始确认、当前分数和历史最高分。
- 刷新页面后恢复合法棋局；损坏存档自动忽略并初始化新棋局。

## 4. 深浅主题需求

### 主题切换控件

- 顶部导航右侧放置分段式主题控件。
- 包含太阳图标加“浅色”按钮、月亮图标加“深色”按钮。
- 当前主题按钮必须有明确的高亮、描边和 `aria-pressed="true"` 状态。
- 支持鼠标点击、Tab 聚焦以及 Enter/Space 键切换。
- 切换时页面背景、文字、卡片、棋盘、按钮、边框、阴影和装饰元素同步更新。
- 主题变化不影响游戏棋盘、分数、撤销记录或其他游戏状态。

### 主题初始化与保存

- 首次访问且没有保存偏好时，读取 `prefers-color-scheme` 选择初始主题。
- 用户点击主题按钮后，将明确选择保存到 `jy-2048:theme:v1`。
- 后续访问优先使用已保存主题，不再被系统主题覆盖。
- 页面加载阶段在 React 渲染前设置根节点 `data-theme`，避免短暂显示错误主题。
- 当前内部主题仅为 `"light"` 或 `"dark"`，界面不增加第三个“跟随系统”按钮。

### 视觉令牌

```ts
type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  source: "system" | "user";
}
```

```css
:root[data-theme="light"] {
  --color-bg: /* 冰蓝白背景 */;
  --color-surface: /* 白色玻璃面板 */;
  --color-text: /* 深蓝文字 */;
  --color-accent: /* 科技蓝 */;
  --color-accent-secondary: /* 紫色 */;
}

:root[data-theme="dark"] {
  --color-bg: /* 午夜蓝背景 */;
  --color-surface: /* 深蓝玻璃面板 */;
  --color-text: /* 冷白文字 */;
  --color-accent: /* 霓虹青 */;
  --color-accent-secondary: /* 电光紫 */;
}
```

- 所有组件只能使用语义化主题变量，不直接写死主题颜色。
- 深色主题参照午夜蓝、青色和紫色霓虹效果。
- 浅色主题参照冰蓝白、科技蓝和淡紫色效果。
- 数字块在两个主题中保持同一色阶语义，并确保数字与背景对比清晰。
- 科技感通过细网格、线路纹理、轻量辉光和玻璃面板体现，避免过度霓虹影响可读性。
- 在系统开启 `prefers-reduced-motion` 时关闭非必要发光和过渡动画。

## 5. 核心接口与数据规则

```ts
type Direction = "up" | "down" | "left" | "right";
type CellValue = 0 | number;
type Board = CellValue[][];

interface GameSnapshot {
  board: Board;
  score: number;
}

interface GameState extends GameSnapshot {
  bestScore: number;
  previous: GameSnapshot | null;
  status: "playing" | "won" | "continued" | "lost";
}

interface MoveResult {
  board: Board;
  scoreGained: number;
  moved: boolean;
}
```

- 游戏引擎提供 `createInitialBoard`、`moveBoard`、`addRandomTile`、`canMove` 和 `hasWinningTile` 等纯函数。
- 游戏存档键为 `jy-2048:game:v1`，最高分键为 `jy-2048:best-score:v1`。
- 主题偏好独立存储，不与游戏存档合并。
- 存档读取必须校验棋盘尺寸、方块值、分数和状态。
- 不实现后端、账号、排行榜、云同步、移动端触控、PWA 或多人模式。

## 6. 实施顺序

1. 初始化 Vite React TypeScript 工程，并确认两张原型图片位于工作区 `img` 目录。
2. 建立语义化设计令牌、深浅主题样式和首屏主题初始化逻辑。
3. 实现顶部导航、主题切换、主视觉和独立游戏介绍板块。
4. 实现纯函数游戏引擎及单元测试。
5. 实现玩法说明、游戏棋盘、计分、撤销、胜负和重新开始。
6. 接入游戏存档、最高分和主题偏好。
7. 完成键盘可访问性、动画降级、跨浏览器测试和生产构建。
8. 在 README 中说明原型位置、主题令牌、测试和静态部署方式。

## 7. 测试与验收

- 验证游戏介绍板块独立存在，标题、文案和三个功能标签完整。
- 验证深色和浅色按钮均可点击及键盘触发，选中状态清晰。
- 验证首次访问按系统主题初始化，手动选择后刷新仍保持选择。
- 验证加载过程中不存在明显的主题闪烁。
- 验证切换主题不会重置棋盘、分数和撤销状态。
- 分别以深色、浅色主题执行 Playwright 全页截图测试，并与对应原型核对布局、色彩语义和组件层级。
- 验证文字和控件在两种主题下均具备足够对比度及可见焦点。
- 验证左右上下移动、连续压缩、合并限制、计分、撤销、胜利和失败逻辑。
- 验证无效移动不生成方块、不计分且不覆盖撤销快照。
- 验证合法存档恢复及非法存档回退。
- Chrome、Edge、Firefox 和 Safari 桌面版核心流程通过。
- 类型检查、Lint、单元测试、端到端测试和生产构建全部通过。

## 8. 默认约定

- 当前工作区仅包含计划和原型图片，将作为全新项目初始化。
- 页面采用单页锚点导航，不引入 React Router。
- 验收桌面视口宽度不低于 1024px，主要截图基准为 1440px。
- 原型不是像素级强制复制，但页面结构、科技感方向、主题层次和组件位置应保持一致。
- 部署平台暂不限定，最终输出标准静态 `dist/` 文件。
