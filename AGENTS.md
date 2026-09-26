---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '0d71508d-46a7-43f9-b204-cb8dd6f165bd'
  PropagateID: '0d71508d-46a7-43f9-b204-cb8dd6f165bd'
  ReservedCode1: '6355c139-6149-4a4d-b1db-3073c7dc844f'
  ReservedCode2: '6355c139-6149-4a4d-b1db-3073c7dc844f'
---

# AGENTS.md

Biu 音乐播放器 — AI Agent 工作指南

## 项目概述

Biu 是基于哔哩哔哩（B 站）公开接口的跨平台桌面音乐播放器，使用 Electron + React + TypeScript 构建。

- **仓库**: `https://github.com/xRetia/biu`
- **许可**: PolyForm Noncommercial 1.0.0
- **包管理器**: pnpm 10.24.0
- **Node 要求**: 22.17.1

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron 38 + React 19 |
| 语言 | TypeScript 5.9 (strict) |
| 构建 | Rsbuild 1.7 |
| 样式 | Tailwind CSS 4 + tailwind-merge |
| UI 库 | HeroUI (Heroui React) 2.8 |
| 图标 | @remixicon/react |
| 状态管理 | Zustand 5 + immer 中间件 |
| 路由 | React Router 7 |
| 动画 | Framer Motion 12 |
| 虚拟列表 | @tanstack/react-virtual |
| 工具库 | es-toolkit, ahooks, classnames |
| 测试 | Vitest 4 + Testing Library |
| 代码规范 | ESLint 9 + Prettier + Stylelint |
| 提交规范 | commitlint (conventional commits) |

## 目录结构

```
biu/
├── src/                    # 渲染进程（React 前端）
│   ├── components/         # UI 组件
│   ├── pages/              # 页面组件
│   ├── layout/             # 布局组件（playbar, sidebar 等）
│   ├── store/              # Zustand stores
│   ├── service/           # B 站 API 调用层
│   ├── common/            # 常量、工具函数、hooks
│   │   ├── audio/          # 音频分析（频谱、节拍检测）
│   │   ├── constants/      # 枚举与常量
│   │   ├── hooks/          # 自定义 hooks
│   │   └── utils/          # 工具函数
│   ├── types/             # 类型定义
│   └── app.css            # 全局 CSS（含 @keyframes）
├── electron/              # 主进程
│   ├── ipc/               # IPC 通道定义与处理器
│   ├── windows/           # 窗口管理
│   ├── network/           # 网络层
│   ├── store.ts           # Electron Store 持久化
│   ├── preload.ts         # 预加载脚本（暴露 IPC API）
│   ├── main.ts            # 主进程入口
│   └── mini-player.ts     # 迷你播放器窗口
├── shared/                # 主进程与渲染进程共享
│   ├── types/             # 全局类型声明（.d.ts）
│   ├── settings/          # 默认设置
│   └── store.ts           # Store 名称映射
├── tests/                 # 测试文件
└── plugins/               # Rsbuild 插件
```

## 路径别名

- `@/*` → `./src/*`
- `@shared/*` → `./shared/*`

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm test             # 运行测试 (Vitest)
pnpm knip             # 检查未使用的代码
```

## 代码规范

### TypeScript

- `strict: true`，`verbatimModuleSyntax: true`
- 类型导入使用 `import type {}` 语法
- 全局类型声明放在 `shared/types/*.d.ts`（如 `AppSettings`、`ElectronAPI`）
- 路径别名：`@/` 指向 `src/`，`@shared/` 指向 `shared/`

### React

- 函数组件 + Hooks，无 class 组件
- 样式使用 Tailwind CSS 4 + `twMerge`/`clsx` 合并类名
- 组件目录结构：`src/components/<name>/index.tsx`
- 状态管理统一使用 Zustand + immer

### 状态管理 (Zustand)

项目使用多个独立的 Zustand store：

| Store | 文件 | 职责 |
|-------|------|------|
| `usePlayList` | `src/store/play-list.ts` | 播放器核心：audio 元素、播放控制、播放列表、切歌 |
| `usePlayProgress` | `src/store/play-progress.ts` | 播放进度（currentTime） |
| `useSettings` | `src/store/settings.ts` | 应用设置（持久化到 Electron Store） |
| `useFullScreenPlayerSettings` | `src/store/full-screen-player-settings.ts` | 全屏播放器显示设置 |

### IPC 通信

主进程与渲染进程通过 `ipcMain.handle` / `ipcRenderer.invoke` 通信：

- 通道定义：`electron/ipc/channel.ts`
- 处理器注册：`electron/ipc/*.ts`
- 渲染进程 API：`window.electron.*`（通过 `electron/preload.ts` 暴露）
- 类型声明：`shared/types/renderer.d.ts` 中的 `ElectronAPI` 接口

### CSS

- 全局动画定义在 `src/app.css`（如 `@keyframes marquee-scroll`）
- 组件级样式使用 Tailwind 工具类
- 主题色变量：`--heroui-primary` 等 HSL 变量
- 毛玻璃风格：`backdrop-blur` + 主题感知背景色

## 核心架构

### 音频播放系统

- **全局单例**: `src/store/play-list.ts` 中 `export const audio = createAudio()` 创建唯一的 `HTMLAudioElement`
- **事件绑定**: `init()` 方法中一次性绑定所有 audio 事件（`ontimeupdate`, `onended`, `onplay`, `onpause` 等）
- **切歌机制**: 通过 Zustand `subscribe` 监听 `playId` 变化，调用 `resetAudioAndPlay(url)` 重置并播放
- **播放模式**: `PlayMode` 枚举（Sequence/Loop/Random/Single），单曲循环使用 `audio.loop = true`
- **进度同步**: `audio.ontimeupdate` → `usePlayProgress.setCurrentTime()` → UI 组件订阅
- **Stall 检测**: `ontimeupdate` 中检测音频末尾卡顿，`ended` 事件未触发时自动兜底切歌

### 歌词系统

- **歌词组件**: `src/components/lyrics/index.tsx`（核心）+ 子组件（字号控制、偏移控制等）
- **歌词获取**: `src/components/lyrics/get-lyrics.ts` 自动搜索 + 缓存
- **假名注音**: 通过 IPC 调用主进程 kuroshiro + kuromoji 引擎（`electron/ipc/furigana.ts`）
- **日语检测**: 歌词假名占比 < 15% 时判定为非日语，禁用假名注音开关
- **翻译**: 独立开关，支持字号调节和时间偏移

### Marquee 滚动

- **通用组件**: `src/components/marquee-text/index.tsx` — 溢出检测 + 动态速度 + 无缝循环
- **跑马灯光带**: `src/components/marquee-lights/index.tsx` — BPM 联动 + EMA 平滑
- **迷你播放器**: `src/pages/mini-player/index.tsx` 中有独立的 MarqueeText 实现

### 迷你播放器

- 通过 `BroadcastChannel("play-list-store-sync-channel")` 与主窗口同步状态
- 不直接操作 audio 元素，所有播放控制通过 BroadcastChannel 转发给主窗口

## 修改记录

### 2026-09-26: 三项 Bug 修复

#### 1. 假名注音 - 日语检测 (`src/components/lyrics/index.tsx`)

**问题**: 假名注音开关对任何歌词都可开启，非日语歌词开启后无效且浪费 IPC 调用。

**修复**:
- 新增 `isKana()` 和 `isJapaneseLyrics()` 工具函数，通过 Unicode 码位检测平假名(U+3040-309F)、片假名(U+30A0-30FF)、半角片假名(U+FF65-FF9F)
- 假名占非空字符比例 < 15% 判定为非日语
- 非日语时按钮禁用（`isDisabled` + 灰显样式），tooltip 显示"仅日语歌词可开启"
- 非日语时自动关闭已开启的假名注音设置
- 自动注音 `useEffect` 增加 `isJapanese` 守卫

#### 2. Marquee 滚动速度异常 (`src/components/marquee-text/index.tsx`)

**问题**: 动画时长固定 8 秒，`translateX(-50%)` 的像素距离随文字长度变化，长标题滚动极快；内容切换时动画不重启导致视觉跳变。

**修复**:
- 新增 `textWidth` state，`measure()` 中同步记录文字宽度
- 动态计算动画时长：`Math.max(speed, textWidth / 40)`，基准 40px/s
- 新增 `scrollKey` state，`children` 变化时自增，作为滚动 div 的 `key` 强制重启动画
- `speed` prop 语义变更为"动画持续时间下限"

#### 3. 播放卡在最后一秒 (`src/store/play-list.ts`)

**问题**: 长时间播放（60 分钟歌曲循环 4-5 次）后 `ended` 事件可能不触发，`isPlaying` 状态仍为 `true` 但音频已停止推进。

**修复**:
- 新增模块级 stall 检测变量：`_stallLastTime`、`_stallCount`、`_stallTriggered`
- `ontimeupdate` 中添加 stall 检测：音频在末尾 1 秒内、未暂停、且 `currentTime` 连续 3 次 `timeupdate`（约 3-9 秒）变化 < 0.01s 时触发兜底
- 提取 `handleSongEnd(isStall: boolean)` 统一处理 `onended` 和 stall 兜底逻辑
- 单曲循环模式 stall 兜底：手动重置 `currentTime = 0` 并续播
- 切歌时在 `subscribe` 回调中重置 stall 检测状态

## 开发注意事项

1. **不要在渲染进程直接访问 Node API** — 通过 `window.electron.*` IPC 调用
2. **新增 IPC 通道** — 在 `electron/ipc/channel.ts` 定义，`electron/ipc/` 下注册处理器，`preload.ts` 暴露，`shared/types/renderer.d.ts` 声明类型
3. **新增设置项** — 在 `shared/types/app-setting.d.ts` 添加字段，`shared/settings/app-settings.ts` 添加默认值，`src/store/settings.ts` 的 `partialize` 中添加持久化
4. **修改 audio 相关逻辑** — 注意 `play-list.ts` 中的模块级变量和 `subscribe` 回调，切歌逻辑由 `playId` 变化驱动
5. **CSS 动画** — 全局 `@keyframes` 定义在 `src/app.css`，组件内联 `style.animation` 引用
6. **Commit 规范** — 使用 conventional commits（`feat:`, `fix:`, `refactor:` 等），husky + commitlint 自动校验

> AI生成