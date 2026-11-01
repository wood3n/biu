---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'bbda53df-732e-4e82-8db1-8c0e0501b894'
  PropagateID: 'bbda53df-732e-4e82-8db1-8c0e0501b894'
  ReservedCode1: 'e0b4e395-8f00-423e-92e7-1f12a0e76b19'
  ReservedCode2: 'e0b4e395-8f00-423e-92e7-1f12a0e76b19'
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
- **跑马灯光带**: `src/components/marquee-lights/index.tsx` — 一块 canvas 贴边跑灯带，`renderer.ts` 画、`trail-path.ts` 算走线，BPM 联动 + EMA 平滑
- **迷你播放器**: `src/pages/mini-player/index.tsx` 中有独立的 MarqueeText 实现

### 迷你播放器

- 通过 `BroadcastChannel("play-list-store-sync-channel")` 与主窗口同步状态
- 不直接操作 audio 元素，所有播放控制通过 BroadcastChannel 转发给主窗口

### 桌面歌词

- 窗口：`electron/desktop-lyrics.ts`，1024×132 无边框置顶透明窗，默认整体鼠标穿透
- 状态：走独立通道 `BroadcastChannel("desktop-lyrics-sync-channel")`，不与小窗共用，避免同一状态被推送两次
- 归属：主窗口是设置的唯一写入方（多窗口各持一份内存 settings，歌词条直接写盘会互相覆盖）；歌词条只发命令 + 乐观更新本地 UI
- 控制器：`startDesktopLyricsController()`（`src/common/utils/desktop-lyrics.ts`）在主窗口按 `desktopLyricsEnabled/Locked` 驱动窗口创建、销毁与穿透切换

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

#### 4. 禁用态按钮 tooltip 不显示 (`src/components/icon-button/index.tsx`)

**问题**: IconButton 禁用后 `pointer-events: none` 导致 tooltip 无法 hover 触发。

**修复**: 用 `<span>` 包裹按钮承载 tooltip，span 不设 `pointer-events: none`，使 tooltip 在禁用态也可正常显示。

#### 5. 音量滑块百分比文本宽度跳动 (`src/components/lyrics/font-size-control.tsx`)

**问题**: 音量百分比文本宽度随数字位数变化（如 "100%" vs "5%"），导致滑块布局抖动。

**修复**: 百分比文本添加固定宽度 `w-8` + `tabular-nums`，数字等宽且固定容器宽度。

#### 6. 按钮组 tooltip 缺失 (`src/components/lyrics/font-size-control.tsx`, `src/components/lyrics/offset-control.tsx`, `src/components/lyrics/utility-controls.tsx`)

**问题**: 字体大小、歌词偏移、歌词搜索按钮缺少 tooltip，用户无法了解按钮功能。

**修复**: 为上述按钮补全 tooltip 内容，统一 `placement="left"`。

### 2026-09-26: 全屏播放器布局与频谱颜色调整

#### 1. 歌词区右侧间距与按钮位置 (`src/components/full-screen-player/index.tsx`, `src/components/lyrics/index.tsx`)

**问题**: 全屏播放器歌词区右侧内边距不足，歌词文本与右下角控制按钮重叠。

**修复**:
- 歌词容器右侧内边距从 `px-12` 改为 `pl-12 pr-[130px]`，为按钮组预留空间
- 歌词模式右下角按钮从 `right-5 bottom-5` 调整到 `right-[50px] bottom-[50px]`
- 无歌词模式按钮从 `mr-6 mb-6` 调整到 `mr-[2px] mb-[50px]`，保持与歌词模式一致

#### 2. 频谱条颜色默认值 (`src/store/full-screen-player-settings.ts`, `src/components/full-screen-player/settings-panel.tsx`)

**问题**: 频谱条颜色默认值 `"currentColor"` 继承父元素文字色，在深色背景或无显式文字色时不可见。

**修复**:
- `defaultSettings.spectrumColor` 从 `"currentColor"` 改为 `"#ffffff"`
- 设置面板 `sanitizeSpectrumColor` 校验逻辑同步更新：非法值回退为 `"#ffffff"`，清理旧的 `"currentColor"` 持久化值
- 仅改默认值，用户自定义选择不受影响

### 2026-09-27: 全屏播放器按钮位置、小窗歌词偏移、偏移控件优化

#### 1. 全屏播放器右下角按钮上移 (`src/components/lyrics/index.tsx`, `src/components/full-screen-player/index.tsx`)

**问题**: 全屏播放器右下角按钮组过于贴近底部，与进度条/频谱条视觉重叠。

**修复**:
- 歌词模式按钮组从 `bottom-[50px]` 上移至 `bottom-[75px]`
- 歌词隐藏/本地歌曲时常驻工具组从 `mb-[50px]` 同步上移至 `mb-[75px]`

#### 2. 小窗模式歌词偏移不生效 (`src/pages/mini-player/index.tsx`, `src/common/utils/mini-player.ts`, `src/components/lyrics/index.tsx`)

**问题**: 全屏播放器调整歌词偏移后，切换到小窗模式歌词行未应用偏移，歌词与音频不同步。

**根因**: 小窗 `loadLyrics` 只读取缓存中的歌词文本，忽略了 `offset` 字段；计算当前歌词行时也未加偏移。

**修复**:
- 小窗 `loadLyrics` 读取缓存的 `offset` 字段并存储到 `lyricOffset` state
- `activeLyricIndex` 计算时加上 `lyricOffset`（`currentMs = displayTime * 1000 + lyricOffset`）
- 新增 `postLyricsOffset()` 广播函数，主窗口调整偏移时通过 BroadcastChannel 实时同步给小窗
- 小窗 `bcRef.onmessage` 新增 `lyricsOffset` 消息类型处理

#### 3. 歌词偏移控件固定宽度 + 滚轮调节 (`src/components/lyrics/offset-control.tsx`)

**问题**: 偏移数值标签宽度随位数变化（如 `+5000 ms` vs `0 ms`），导致弹窗布局抖动；不支持鼠标滚轮快捷调节。

**修复**:
- 标签添加固定宽度 `w-16`（64px）+ `tabular-nums` 等宽数字
- 外层包裹 `wrapperRef`，监听 `wheel` 事件以 50ms 步进调节偏移，阻止页面滚动
- 行为与音量控件（`utility-controls.tsx` 中的 `VolumeControl`）完全一致

### 2026-11-01: 悬浮窗胶囊化重设计 + 桌面歌词

#### 1. 悬浮窗播放器改为纯 CSS 胶囊 (`electron/mini-player.ts`, `src/pages/mini-player/index.tsx`, `src/app.css`)

**需求**: 悬浮窗重做成「胶囊」，参考 macOS 液态玻璃质感。

**踩过的坑**: 初版用 `backgroundMaterial: "acrylic"` 当玻璃底板 + CSS 画胶囊。Win11 的系统材质只能按窗口矩形**整块**绘制，裁不进胶囊轮廓，四角会残留一块材质和投影，桌面上看就是一圈脏影。

**最终实现**:
- 彻底不用系统亚克力：`transparent: true` 逐像素透明，窗口 340×80，胶囊外接矩形 = 窗口矩形，四角完全透明
- 立体感全部由**内阴影**承担（`.capsule-glass`）：上缘高光 + 下缘厚度暗部 + 内圈亮边 + 最外 1px 暗 rim；**禁止任何外投影**，外投影必然落在四角透明区
- 当时没有真实桌面模糊，底色不透明度相应提高（浅色 68%、深色 74%）保证歌词可读（后续阶段用一次性桌面快照补上模糊，见「悬浮窗假模糊」）
- 布局沿用原版上下结构：左侧封面 48，右列上行歌词、下行控件（播放模式 / 上一首·播放·下一首 / 返回主界面），底部 `inset-x-5` 贴边进度条避开圆弧
- `.capsule-btn`：主控播放键用与底板同材质的浅色磨砂圆片（而非实心强调色）；刻意不复用 `glassBtn`，其 `bg-transparent!` 会盖掉磨砂底

#### 2. 桌面歌词窗口与「词」开关 (`electron/desktop-lyrics.ts`, `src/pages/desktop-lyrics/`, `src/components/desktop-lyrics-toggle/`, `src/layout/playbar/right/index.tsx`)

**需求**: 播放栏右侧按钮区、循环播放按钮的右边，加一个内容为「词」的桌面歌词开关。

**实现**:
- 新窗口 1024×132、无边框置顶、`skipTaskbar`，高度需容纳字号上限（60px×1.3 行高）+ 悬停工具条 + 内边距（双行上线后提高到 210）
- 歌词渲染：8 方向 1px 描边 + 双层柔光阴影，保证压在任意桌面上可读；已唱部分按行进度克隆裁切上色
- 鼠标穿透：默认整体 `setIgnoreMouseEvents(true, { forward: true })`，渲染层对歌词胶囊做 mousemove 命中判定，命中才 `setDesktopLyricsInteractive(true)`，避免这条横跨屏幕的窗口挡住桌面点击
- 悬停工具条支持锁定/字号 A-/A+/关闭；开机恢复的歌词条可能早于主窗口水合就 mount，错过自己发的 `init`，故同步启动时主动补推一次 state + settings
- 设置页新增桌面歌词开关、锁定开关、字号滑块三项

#### 3. 歌词偏移双通道同步 (`src/components/lyrics/index.tsx`)

**问题**: 主界面调整歌词偏移后，只有小窗跟随，桌面歌词不生效。

**修复**: 偏移更新时同时调用 `postLyricsOffset()`（小窗）与 `postDesktopLyricsOffset()`（歌词条），无对应窗口时静默忽略。

### 2026-11-01（第二阶段）: 桌面歌词设置项 + 悬浮窗假模糊

#### 1. 桌面歌词外观设置 (`src/pages/settings/system-settings.tsx`, `src/pages/desktop-lyrics/index.tsx`, `electron/desktop-lyrics.ts`)

**需求**: 字体、字号、字色、单/双行都要能改；双行不是「当前句 + 上一句」。

**实现**:
- 新增设置项 `desktopLyricsFontFamily` / `desktopLyricsColor`（未唱）/ `desktopLyricsActiveColor`（已唱）/ `desktopLyricsLineMode`，全部走「类型 → 默认值 → `partialize`」三处链路
- 设置的写入方只有主窗口：歌词条自带一份内存 settings，多窗口各写盘会互相覆盖，所以歌词条只发命令 + 乐观更新本地 UI，主窗口把视图设置镜像推回来
- 双行语义：显示**当前句 + 下一句**，两行的上下位置由当前句序号的奇偶决定 —— 换行时高亮只是从一行「跳」到另一行，下一句原地变成当前句，文字不会上下跳动
- 窗口高度 132 → 210，容纳双行字号上限（60px×1.3×2）+ 悬停工具条

#### 2. 悬浮窗假模糊：一次性桌面快照 (`electron/ipc/backdrop.ts`, `src/pages/mini-player/use-backdrop.ts`, `src/app.css`)

**为什么要自己做**: Win11 不给第三方窗口「任意形状 + 真实桌面模糊」。`backgroundMaterial`（Mica/Acrylic）只能按窗口矩形整块绘制，裁不进胶囊轮廓；`DwmEnableBlurBehindWindow` 自 Windows 8 起官方失效；DirectComposition 的高斯模糊要写 native addon。剩下的路子只有自己把桌面画面取回来画。

**实现**（关键：只抓一张，不持续抓屏）:
- 主进程 `desktopCapturer.getSources({ types: ["screen"] })` → `nativeImage.crop()` → `toJPEG(60)` → dataURL，附带 `display`/`window`/`frame`/`region`（DIP，`region` 以窗口原点为基准，贴屏幕边缘时裁到画面内）
- 渲染层 500ms 轮询 `getBackdropGeometry()`（只 getBounds，很便宜），位移 > 48px 或尺寸/显示器变了才重抓，且 320ms 去抖 —— 拖动窗口时不会每帧抓全屏
- 采样框 = 窗口 + 四周 140px，整体**缩进**画布：窗口自己只映射到画布正中一块；那块拍进来的正是我们自己，抠掉会在正中留一条没被模糊的缝，留着又等于拿自己的像素当输入，所以用**外圈均色填平**（`ringAverageColor`），底板完全不依赖自己
- `BACKDROP_INK = 0.75` 让胶囊底色叠上来，才有磨砂玻璃的奶白感并保证文字可读；模糊是 CSS `blur(30px)`，走合成器，所以没显卡的虚拟机同样生效
- 画布比窗口外扩 28px：`blur` 会在图层边缘吃掉一圈透明度，外扩那圈被父层 `overflow-hidden` 裁掉，胶囊本体边缘才不会糊出毛边
- 设置页新增 `miniPlayerBlur` 开关（第三阶段已换成 `miniPlayerBackdrop` 三态）；抓屏不可用时底板留空，静默回落到纯 CSS 玻璃
- 封面改成圆形（`.capsule-cover`）：胶囊左端本来就是半径 = 窗高/2 的半圆，方封面压在半圆里很别扭

**踩过的坑**:
- `nativeImage.crop()` **返回新图、不改原图**，漏接返回值就会把整块屏幕画进底板
- `img.decode()` 要等一次渲染时机，窗口不在前台时可能永远不 resolve，导致底板一次都不画 → 改用 `onload`/`onerror`
- canvas 是 replaced element，`position:absolute; inset:-28px` 不会把它拉伸，必须显式 `width/height: calc(100% + 56px)`
- `desktopCapturer.getSourcesSync` 在 Electron 38 不存在，handler 只能 async

#### 3. 验证方式

透明窗口的实际像素只能用 CDP 看：`%APPDATA%/biu-dev/DevToolsActivePort` 拿端口 → `/json/list` 找 `#mini-player` target → `Runtime.evaluate` 读画布（不透明覆盖率、亮度离散度、四角取样）+ `Page.captureScreenshot` 出图。GDI 截屏抓不到 Electron 的渲染面。

### 2026-11-01（第三阶段）: 悬浮窗去进度条 + 外投影 + 底板三态

#### 1. 去掉胶囊底部进度条 (`src/pages/mini-player/index.tsx`, `src/common/utils/mini-player.ts`)

**需求**: 悬浮窗用不到拖动进度，进度条白占一条还压着圆弧。

**实现**: 删掉 `Slider` 与整套 seek 机制（`seekingTimeRef`/`isSeekingRef`/`isSeeking`/`handleSeek*`），歌词行定位直接用主窗口推来的 `currentTime`；同步通道的小窗命令联合类型去掉 `seek`。

#### 2. 外投影要求窗口比胶囊大一圈 (`electron/mini-player.ts`, `src/app.css`)

**需求**: 完全没投影时，胶囊和桌面内容分不开。

**关键**: 第一阶段「禁止外投影」的原因是投影会被窗口矩形裁掉，在四角留下脏影 —— 不是投影本身不好。解法是把窗口放大：`CAPSULE_WIDTH/HEIGHT = 340/80` + `SHADOW_MARGIN = 14` → 窗口 368×108，胶囊在页面里居中，投影终于有地方铺开。
- `.capsule-glass` 追加两层很淡的外投影（`0 1px 2px / 14%`、`0 6px 16px -6px / 28%`，深色主题各加重一档），立体感仍以内阴影为主
- 渲染层根节点只留 `window-drag`（四周透明边距也能拖着走），`capsule-host` + hover 判定移到居中的胶囊本体上，`.capsule-host:hover .capsule-glass*` 这组规则要求 host 是祖先，不能把两个类合到同一元素
- `MarqueeLights` 新增 `inset` 属性：光带层 `position:fixed` 按 `inset` 内缩、周长按 `innerWidth - inset*2` 计算，小窗传 `SHADOW_MARGIN`，光带才贴着胶囊而不是窗口矩形跑
- 假模糊的几何不用改：`geo.window` 变成 368×108 后，被填平的「自己那块」变成整个窗口矩形 —— 反而更保守，画进底板的每一像素都来自窗口之外

#### 3. 底板三态：透明模糊 / 纯色浅 / 纯色深 (`shared/types/app-setting.d.ts`, `src/pages/mini-player/index.tsx`, `src/pages/settings/system-settings.tsx`)

**需求**: 低配机器抓屏 + 模糊太贵，要能换成纯色底板；黑色不能是纯黑。

**实现**:
- `miniPlayerBlur: boolean` 升级为 `miniPlayerBackdrop: "blur" | "light" | "dark"`，`MINI_PLAYER_BACKDROPS` 一份数组同时当「小窗按钮轮换顺序」「设置页选项」「主窗口合法值校验」用
- 小窗左侧按钮组加一个轮换按钮（水滴/太阳/月亮图标），乐观更新本地镜像 + `setBackdrop` 命令回传主窗口，主窗口才是写盘的那一方
- 纯色底板各自钉死 `--heroui-foreground`（浅底 `240 6% 12%`、深底 `240 12% 96%`）：底板颜色和全局主题无关，跟着主题走会出现「深底配深字」
- `.capsule-glass--light/--dark` 的 `.capsule-btn` 覆写要带 `.capsule-host` 前缀才压得过 `.dark .capsule-btn:hover`（stylelint 的 `no-descending-specificity` 会拦），并且「两组 base 在前、两组 hover 在后」排列
- 视图设置镜像扩到 `{ backdrop, marquee }`：小窗自己那份 `useSettings` 只在启动时读盘，主窗口改了「七彩跑马灯」小窗不会跟着开关，所以把 `marqueeEnabled` 也推过去，`MarqueeLights` 新增 `enabled` 覆写属性

**验证补充**: 改完 `electron/` 会重启 Electron、DevTools 端口每次都变，要重新读 `DevToolsActivePort`；主窗口热更新后 `startMiniPlayerMainSync` 的闭包还是旧模块（`pickMiniPlayerView` 少了 `marquee`），必须 reload 主窗口再点两次「迷你」重启同步，才能测推送。

### 2026-11-01（第四阶段）: 悬浮窗退回 DWM 系统亚克力，面板满幅

#### 1. 为什么放弃一次性快照假模糊

用户判定：拍一张静态快照「不是实时渲染」，不可接受；并授权「退回 DWM 渲染模式、改成直角、重新设计 UI」。系统材质（`backgroundMaterial: "acrylic"`）糊的是「此刻」窗口后面的真实画面，由 DWM 合成，天然实时且渲染侧零开销 —— 代价是它只能按**窗口矩形（带 Win11 默认圆角）整块**绘制。

**关键结论**: 之前「矩形材质里嵌一颗 CSS 胶囊」之所以难看，正是这个约束的直接后果。要么接受胶囊被材质垫成矩形，要么让**面板等于窗口**。第四阶段选了后者：340×80 圆角矩形面板，材质即底板。

#### 2. 实现 (`electron/mini-player.ts`, `electron/ipc/window.ts`, `src/pages/mini-player/index.tsx`, `src/app.css`)

- 窗口：`width/height = 340/80`（去掉 `SHADOW_MARGIN`）、`transparent: false`、`backgroundColor: "#00000000"`、`backgroundMaterial: "acrylic"`、`hasShadow: true`（投影交给系统，按窗口形状含圆角裁切，不会在面板里留脏边）、`roundedCorners: true`
- `applyMiniPlayerBackdrop(mode)`：`acrylic` → 材质 acrylic + 页面透明底；`light`/`dark` → `setBackgroundMaterial("none")` + 窗口实色底 `#FAFAFC` / `#1A1A1E`。创建时先读 `appSettingsStore.get("appSettings.miniPlayerBackdrop")`，避免开机闪一下亚克力
- 非 Windows 没有 DWM 材质 → `transparent: true`，底板交回 CSS 色调
- IPC `mini-player:set-backdrop`（`channel.miniPlayer.setBackdrop` → `electron/ipc/window.ts` → preload `setMiniPlayerBackdrop` → `shared/types/renderer.d.ts`）。**为什么渲染层来报**：electron-store v10 没有 `onDidChange`，主进程观察不到设置写入，所以由小窗在模式变化时 `useEffect` 报一次
- 底板模式**只由主窗口设置页决定**（用户要求去掉小窗上的切换按钮）：删掉 `setBackdrop` 广播命令、`nextMiniPlayerBackdrop` 与图标轮换，`MINI_PLAYER_BACKDROPS` 只服务设置页 Tabs
- 设置值 `"blur"` → `"acrylic"`，`normalizeMiniPlayerBackdrop()` 兼容磁盘上仍为 `blur` 的旧值（否则查不到样式类，底板会整个消失）
- CSS 整段重写：`.capsule-*` → `.mini-panel` / `.mini-cover` / `.mini-key`，去掉内阴影高光层与画布层，只留「色调叠层 + 1px 内 rim」；`color: hsl(var(--heroui-foreground))` 保留（纯色模式靠它钉文字色）
- 一次性快照链路整体删除：`electron/ipc/backdrop.ts`、`src/pages/mini-player/use-backdrop.ts`、`channel.backdrop.*`、preload `getBackdropGeometry`/`getBackdropSnapshot`、`BackdropGeometry`/`BackdropSnapshot` 类型；`MarqueeLights` 去掉 `inset` 属性（窗口即面板，光带直接贴着视口周长）

#### 3. 踩过的坑：置顶材质窗被判定「不可见」而不出帧

`transparent: false` + 系统材质时，Chromium 的原生遮挡计算会把这个无边框置顶窗判成全被遮住，`document.visibilityState === "hidden"`，渲染进程于是**停止出帧**：桌面上只剩一块纯色面板（材质/底色在，文字和按钮全无），reload 之后尤其明显。
**修法**: `app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion")`（`electron/main.ts`，仅 win32，需在 app ready 之前）。改完 `visibilityState` 回到 `visible`，GDI 截屏里歌词与按钮都正常。

#### 4. 验证方式补充：GDI 截屏能抓到 DWM 材质，CDP 不能

CDP `Page.captureScreenshot` 只有网页层，拍不到系统材质；PowerShell + `System.Drawing.Graphics.CopyFromScreen` 抓的是 DWM 合成后的桌面，**包含材质**。据此做了实时性判定：用 `user32!MoveWindow` 把面板挪到任务栏上方（任务栏实测 `rgb(195,209,227)`），面板底板从中性灰 `rgb(223,223,223)` 变成带蓝 `rgb(216,220,227)` —— 材质确实在跟着身后的画面变。局部方差只有 1.4 不代表静态：Win11 亚克力模糊半径极大、白色调又厚，糊完基本不留局部细节，判定要看色相是否跟随，不能看方差。纯色深实测底板 `rgb(26,26,30)`、方差 0。

### 2026-11-01（第五阶段）: 长歌词跑马灯 + 桌面歌词设置独立 tab + 工具条播放控制

#### 1. 两个覆盖窗的长歌词都不滚动，各自修复

**问题**: 悬浮窗和桌面歌词都是「一行装不下就直接裁掉」。悬浮窗那份有独立 `MarqueeText`，但动画时长写死 8 秒；桌面歌词根本没有滚动。

**悬浮窗** (`src/pages/mini-player/index.tsx`)：
- 时长改按文字宽度换算：`Math.max(6, textWidth / 40)`，与主界面 `src/components/marquee-text` 同一套基准，滚动实测 `-42.2px/s`（旧写死 8s 时同样文字要 -70px/s）
- 轨道 `key={text}`，换句强制重启动画
- **踩过的坑**: 第一版把 `scrollKey` 自增写在滚动延迟的 effect 里，`key` 一变轨道就重挂载，`ResizeObserver` 和 `ref` 观察的那批节点脱离文档，`scrollWidth` 读到 0 → 溢出判定在 true/false 间来回翻 → 每次翻都重跑 effect、重起 1 秒延迟，动画永远不起来（表现是「轨道渲染了但 `style` 为空、位置不动」）。
  **最终做法**: 测量不依赖分支内的节点，改用一次性探针（`position:absolute;visibility:hidden;white-space:nowrap` 复制同样 className 量 `offsetWidth`），`ResizeObserver` 只盯容器；容器 div 在两个分支间保持同一元素，ref 与观察者才不会飘。

**桌面歌词** (`src/pages/desktop-lyrics/index.tsx`)：
- 溢出时同样渲染两份同内容 + `marquee-scroll`（`translateX(-50%)` 正好位移一份，含 `pr-10` 间隔所以无缝），时长 `Math.max(8, textWidth / 40)`，实测 735px 的句子 → `18.375s`、`-42.5px/s`
- 先静止 1.5 秒展示句首再起滚动，换句/换字号重新计时
- **已唱高亮的裁切从百分比改成 px**：`width: progress * textWidth px`。原来 `progress * 100%` 是相对容器宽，句子比容器宽时高亮边界会算短；滚动起来后底图在动、裁切窗口不动，只有按文字真实宽度定位，分界才一直落在正确的字上。（这层「裁切窗」后来整体换掉，见第六阶段）

#### 2. 桌面歌词设置单独开 tab (`src/pages/settings/desktop-lyrics-settings.tsx`, `src/pages/settings/index.tsx`)

原先 7 项（开关/锁定/行数/字体/字号/未唱色/已唱色）混在「常规设置」里，现在整体搬到新的「桌面歌词」Tab，分「显示」「外观」两组；`useSystemSettingsForm` 仍然统一持有这些字段，新 tab 只接 `control`，落盘链路不变。`system-settings.tsx` 里随行的 `DESKTOP_LYRICS_*`、`defaultAppSettings`、`ColorItem` 导入一起清掉。

#### 3. 文字投影被方框切掉 (`src/pages/desktop-lyrics/index.tsx`, `electron/desktop-lyrics.ts`)

**根因**: 行容器是 `overflow-hidden`（跑马灯需要它横向裁切），而 `.desktop-lyrics-text` 的 8 方向描边 + `0 2px 6px` / `0 8px 22px` 双层柔光要向外铺约 30px，于是上下被同一层方框切成一条直线。

**修法**: 单向裁切 —— `overflow-x-clip overflow-y-visible`（`clip` 与 `visible` 是允许的组合，不会像 `hidden` 那样把另一轴强制变成 `auto`），横向仍然裁切，纵向的投影完整留下来。再配 `-mx-2 px-2`：静态行宽等于文字宽，左右各留 8px 给描边，负 margin 把裁切框撑出去、padding 把文字拉回原位，视觉位置不变。
底部仍受窗口边缘裁切（透明窗画不到窗外），所以歌词条上移到 `bottom-6`（24px）并把窗口高度 210 → 230，容纳双行 60px 上限 + 悬停工具条 + 投影留白。

#### 4. 悬停工具条补播放控制与歌名

`src/pages/desktop-lyrics/index.tsx` 工具条顺序改为：歌名 ｜ 上一曲·播放/暂停·下一曲 ｜ 锁定·A-·A+·关闭。
- 歌名不缩写，复用主界面的 `MarqueeText`（`active` 常滚）+ `max-w-[220px]` 外壳，超长自动滚动
- 播放状态直接读主窗口推来的 `MiniPlayerMainStateSnapshot.isPlaying`
- 新增命令 `togglePlay/prev/next`（`src/common/utils/desktop-lyrics.ts` 的 `DesktopLyricsCommand`），主窗口侧转给 `usePlayList` —— 歌词条自己没有 audio 元素，控制必须由主窗口执行
- 主进程改动会重启 Electron、`DevToolsActivePort` 每次都变，测之前要重新读端口

#### 5. 覆盖窗的验证手法

- 歌词条默认整体鼠标穿透，工具条只在指针命中时出现：用 `window.dispatchEvent(new MouseEvent("mousemove", {clientX, clientY}))` 合成一次真实命中判定即可让工具条渲染出来，再点按钮；`button.click()` 走的就是 IPC 命令链路（实测 `播放 → 暂停 → 播放` 往返成功）
- 溢出分支用注入 CSS 规则压缩容器（`div[class~="overflow-hidden"]:not(.mini-panel):not(.mini-cover){max-width:110px!important}`），比改元素内联样式可靠：分支切换会重建节点，内联样式会丢，导致溢出判定抖动
- 小窗无播放内容时，从另一个渲染上下文（歌词条）往 `play-list-store-sync-channel` 广播一条 `from:"main"` 的 state，即可喂进长标题测跑马灯 —— BroadcastChannel 不会把消息投递回发送方自己，所以必须换上下文发
- 质量门：eslint 全仓 0 error、stylelint 干净、tsc 对改动文件干净、vitest 11/11


### 2026-11-01（第六阶段）: 已唱换色彻底去掉裁切

**问题**: 用户反馈「白色部分阴影正常，已唱绿色部分的阴影不正常」——第五阶段那个「克隆一份按进度裁切」的高亮层，本身就是一个 `overflow-hidden` 的矩形窗，字周围一圈柔光被这个窗的右边界切平，等于把第 3 节刚修掉的毛病从行容器搬到了高亮层。

**第一版改法（错的，记下以免重犯）**: 单层文字 + `background-image: linear-gradient(两段实色)` + `background-clip: text` + `-webkit-text-fill-color: transparent`。
**踩的坑**: 这样字会整个变成黑色。绘制顺序是「背景 → text-shadow → 文字填充」，填充透明后，`.desktop-lyrics-text` 那 8 方向 1px 黑描边（本质是 8 个字形副本）就糊在渐变背景上面，把渐变完全盖掉。CDP 截图实测：字身 luma 0~1，绿/白一个像素都不剩。

**最终实现** (`src/pages/desktop-lyrics/index.tsx` 的 `LyricLineCopy`、`src/app.css`)：当前句渲染**两层同样的文字**，谁都不被裁切：
- 底层 `.desktop-lyrics-text--halo`：`color: transparent`，只负责描边 + 双层柔光（`text-shadow` 的每一层都自带颜色，所以填充透明不影响投影）
- 上层 `.desktop-lyrics-text--fill`：`position:absolute; top:0; left:0` + `text-shadow:none` + `background-clip:text` + `-webkit-text-fill-color:transparent`，只负责按字形上渐变颜色，正好盖住底层的黑色字身
- 分界仍是 px：`progress * textWidth`，`textWidth` 由已有的探针量出；绝对定位层与静态层同起点同字体同字号，字形逐像素重合
- 非当前句整行一个颜色，保持单层不变

**验证**: 注入与组件同 DOM 的样例行（灰底 `rgb(120,120,120)`、44px、进度固定 50%），CDP 截图后按列统计：左半 `green=3098 dark=3927`、右半 `white=2742 dark=3054`，两半的暗色描边/柔光像素量级一致，跨接缝的逐列最暗值连续（18~45）没有跳回背景 120 的断口。真实播放态复查（`心は誰にも見えないのだから，`，735px 行、分界 200.655px）截图肉眼确认绿/白两半投影都完整。

### 2026-11-01（第七阶段）: 桌面歌词一行最大宽度 + 横向留白

> 本阶段的「窗口铺满整屏 + 内部裁切框限宽」已被第九阶段整体替换（窗口宽度即一行上限、硬裁切改渐隐遮罩），`widthPercent` 镜像与 `clampDesktopLyricsWidth` 都已删除；设置项本身与三处链路仍然有效。以下是当时的记录。

**问题**: 长歌词一行能撑到 `max-w-[96vw]`，等于占满整屏；而且文字一直顶到裁切框边上，`0 8px 22px` 那层柔光向左右各要约 24px，只有 8px 留白 → 光被裁切框切平（纵向刚修过，横向是同一个毛病的另一半）。

**实现** (`shared/types/app-setting.d.ts`, `shared/settings/app-settings.ts`, `src/store/settings.ts`, `src/common/utils/desktop-lyrics.ts`, `src/pages/desktop-lyrics/index.tsx`, `src/pages/settings/desktop-lyrics-settings.tsx`)：
- 新设置 `desktopLyricsWidth`（占屏幕宽度百分比，`30–95` 步进 5，默认 `70`）。上限刻意不到 100%：裁切框必须整个留在窗口内，否则柔光被窗口边缘切掉（透明窗画不到窗外）
- 常量与 `clampDesktopLyricsWidth()` 放在 `desktop-lyrics.ts`，和字号一套；`widthPercent` 进 `DesktopLyricsViewSettings`，仍然只有主窗口写盘、整包镜像推给歌词条
- 行容器：`max-w-[96vw]` → `style.maxWidth = window.innerWidth * widthPercent / 100`，`-mx-2/px-2` → `-mx-8/px-8`（`SHADOW_GUTTER = 32`）
- **溢出判定要跟着改**：`clientWidth` 含左右留白，比较式改成 `width > container.clientWidth - SHADOW_GUTTER * 2 + 1`，否则文字可以先糊到留白区里才起跑马灯
- 设置页「桌面歌词」tab 新增「最大宽度」滑块（`显示` 分组，字号那行提示语不再承诺「超出屏幕」）
- 注意 `src/pages/settings/index.tsx` 的 `useSystemSettingsForm` 是逐字段列举的：新设置要在解构、`useShallow` 选择器、`defaultValues` 三处都加，只加类型不会出现在表单里

**验证**（CDP，端口每次重启都变）：
- 1600px 屏 + 默认 70% → 裁切框 `max-width: 1120px`、padding 32px、`overflow: clip/visible`，735px 的句子不滚动且整框居中（590…1010 之类的位置随句长变化）
- 注入 `.overflow-x-clip{max-width:420px!important}` 压窄（比改内联样式可靠，分支切换不丢）→ 1.5 秒后起跑马灯：`marquee-scroll 18.375s linear infinite`、实测 `-42px/s`、轨道 1550px = 两份 735 + 两份 40px 间隔
- 设置页滑块（原生 `input[type=range]`，用 `HTMLInputElement` 的 value setter + `input` 事件驱动）改到 95% → 歌词条 `max-width` 实时变 1520px，改回 70% → 1120px；`init` 命令回来的镜像包确认含 `widthPercent`
- 主窗口热更新后 `pickDesktopLyricsView` 会引用到旧 chunk 里没有的 `clampDesktopLyricsWidth`（`ReferenceError`，设置镜像整条断掉）→ 必须 reload 主窗口；`Runtime.enable` 会把重载前的历史报错重新打一遍，看日志要区分「本次连接新抛的」和「缓冲里的旧的」


### 2026-11-01（第八阶段）: 频谱与背景虚化降 GPU + 动画帧率上限

**问题**: 用户实测（GTX 1660）频谱吃 10% GPU、背景虚化吃 30%。

**根因**:
- `filter: blur()` 在 Blink 里不是「糊一次存成贴图」，而是 render pass 上的**着色器操作**，那一层每帧被画就每帧重跑一遍高斯；元素按 1.15 倍全屏尺寸光栅化，A/B 两层还同时挂着（换歌交叉淡入），直接翻倍。`transition: filter` 另加 700ms 的主线程重新光栅化，`will-change: filter` 把实时渲染面一直留着。
- 频谱的 `shadowBlur` 是**按 `fill()` 生效**的：Skia 把形状 alpha 画进离屏表面对象再跑高斯，所以逐根柱子设阴影 = 每帧约 400 遍（200 柱 × 柱体+亮点）离屏高斯。
- `requestAnimationFrame` 按显示器刷新率发帧，144Hz 屏上面这些每帧代码每秒真跑 144 遍。Chromium/Electron 没有受支持的全局最大帧率开关（`--disable-frame-rate-limit` 只能去限制），所以门控只能做在 JS 侧。

**实现**:
- `src/common/audio/frame-rate.ts`：`ANIMATION_FPS_OPTIONS`（30/60/90/120/144）、`normalizeAnimationFps()`（把磁盘上的非法值回落到最近档位，否则下拉框显示空、间隔算不出正数）、`getFrameIntervalMs()`
- 新设置 `animationFps`（默认 60），设置页放在**外观**分组末尾，提示语「限制视觉特效帧率，降低 GPU 使用率」；频谱（`audio-waveform`）与节拍循环（`beat-stream`）都在 rAF 回调里按时间门控
- 频谱 `draw()`：柱体合并进一条 `Path2D`、顶部亮点合并进另一条，每帧带阴影的 `fill()` 从 ~400 次降到 2 次；渐变 `fireGradient` 与 `freqData` 缓冲区提到帧外（原来每帧 `createLinearGradient` + `new Uint8Array`）
- 背景糊图：`BG_SHRINK = 9`，图层按 1/9 尺寸渲染再用 `transform: scale()` 放大回去——缩小本身等效大半径模糊，放大是合成器的双线性插值不花钱，着色器像素 ÷81；`blur` 半径同步除以 9，删掉 `transition: filter` 与 `will-change: filter`，交叉淡入只留 wrapper 的 `opacity`（可合成）
- `beat-detector.ts` 的能量回看窗口原本按**帧数**定义（`historySize = 45`），改帧率后检测行为会漂移 → 改成按时间（`HISTORY_MS = 700`），配 `timeHistory` 裁剪；裁剪比较 `timeHistory[1]` 而非 `[0]`，留一个越界样本窗口跨度才可能真正覆盖到 700ms

**验证**: 真 Chromium 里对高频噪点图做新旧 A/B，糊图与频谱肉眼无差别；tsc 基线 125→125（改动文件零报错）、eslint、prettier 干净；节拍检测 A/B 仿真：新实现 30~144fps 下 onset 数量与 ~700ms 窗口稳定，旧的在低帧率下首个 onset 从 1500ms 提前到 500ms。**GPU% 未测**——开发机是无显卡虚拟机，SwiftShader 软栅格把 GPU 开销记成 CPU，此处数字无意义，需在 1660 上复测。若虚化仍高，先看 DevTools → Layers 那层的纹理尺寸：若仍按全屏光栅化说明 Blink 吃进了 scale，就得换成主进程取封面 + canvas 一次性预糊（顺带绕开 hdslb 封面的 `crossOrigin` CORS 不确定性）。

**已知未动**: 跑马灯 `marquee-lights` 用 keyframes 动 `left/top/width/height`（~308 个元素、每帧全视口 layout + paint）与全屏播放器 7 个 `backdrop-blur-2xl` 底板按用户要求「暂时不动」，这是 45% 里剩下的最大一笔。（→ 第十阶段已处理：跑马灯改合成器 transform 动画，收起态面板与被盖住的导航栏/播放栏不再参与绘制；播放器内 4 个可见胶囊的模糊仍保留，等用户确认外观取舍。）

### 2026-11-01（第九阶段）: 歌词条窗口即歌词栏，断口改渐隐

**问题**: 第七阶段那套「窗口铺满整屏 + 内部裁切框限宽」被用户判死：「最外面的框框还是占满了屏幕宽度，而且你的裁剪会截断阴影」。确实错了两条：① 一条透明横带铺满整屏，桌面点击与鼠标命中判定都被它管着；② 裁切框无论怎么留白，滚动的字经过边界时仍是一条硬切口。

**实现**（`electron/desktop-lyrics.ts`、`electron/ipc/{channel,window}.ts`、`electron/preload.ts`、`shared/types/renderer.d.ts`、`src/common/utils/desktop-lyrics.ts`、`src/pages/desktop-lyrics/index.tsx`、`src/app.css`）：
- **窗口宽度就是那一行的上限**：`workArea.width × pct / 100 + SHADOW_GUTTER * 2`（留白 32px 与渲染层常量同值，两侧各一份），下限 `MIN_LYRICS_WINDOW_WIDTH = 520`。新 IPC `desktop-lyrics:set-width` → `setDesktopLyricsWidth(percent)`，改宽度时**水平中心不动**（用户拖到哪儿还在哪儿），x 钳回工作区，结果写回 `desktopLyricsStore.bounds`
- 主窗口控制器 `startDesktopLyricsController()` 的 `apply(enabled, locked, width)` 多带一个宽度参数，订阅里 `desktopLyricsWidth` 变化与开关/锁定同级触发。设置项 `desktopLyricsWidth` 本身沿用第七阶段那条三处链路（类型/默认值/`partialize` + `useSystemSettingsForm`）
- **`widthPercent` 从 `DesktopLyricsViewSettings` 里删掉**：窗口自己就是上限，渲染层再算一遍只会算出第二个上限。`clampDesktopLyricsWidth()` 一起删，钳制只在主进程 `clampWidthPercent()` 一处
- **断口用遮罩渐隐，不用硬切**：`.desktop-lyrics-row` 加 `mask-image: linear-gradient(to right, transparent 0, 35% 10px, black 32px, black calc(100% - 32px), 35% calc(100% - 10px), transparent)`。渐隐宽度正好等于留白，字碰不到淡区
- **遮罩只能盖住本元素的边框盒**（`mask-clip` 没有 `no-clip`），纵向超出的柔光会被它切平 → 同一规则里 `padding-top/bottom: 32px` + `margin-top/bottom: -32px`：盒子上下各撑大 32px 把柔光包进遮罩范围，负 margin 让排版位置不变。于是行容器从 `-mx-8/px-8` 改成 `w-full px-8`，`overflow-x-clip` 保留（遮罩与裁切框同一条边）
- 行容器不再需要 `maxWidthPx`：外层改成 **flex 布局而不是 `absolute left-1/2`** —— 定位元素的可用宽度按 `容器宽 - left` 算，一条 70% 宽的歌词会被挤到 50% 就起跑马灯。根节点 `flex items-end justify-center`，胶囊 `mb-10 w-fit min-w-0`（`min-w-0` 必须有，否则 `whitespace-nowrap` 的 min-content 顶住不收缩）
- 窗口高度 230 → 244、底部留白 `mb-6`(24px) → `mb-10`(40px)：`0 8px 22px` 那层柔光向下要铺约 30px，24px 会被窗口下边缘吃掉 6px（透明窗画不到窗外）

**验证**（CDP，端口随重启变化）：
- 1600 工作区 + 70% → `window.innerWidth = 1184`（=1120+64）；30% → 544 且 735px 的句子起跑马灯（`anim: marquee-scroll`、轨道 1550px = 两份 735 + 两份 40 间隔）；95% → 1584 不越界。截图确认左右两端是渐隐不是硬边
- 完整链路实测走**设置页滑块**：`#/settings` → 「桌面歌词」tab → 那个 `min=30 max=95` 的原生 `input[type=range]`（HeroUI 的 `aria-label` 不在 input 上，靠 min/max 认）用 `HTMLInputElement` value setter + `input`/`change` 事件驱动到 45 → 歌词条 `innerWidth` 实时变 784，改回 70 → 1184
- 纵向：`textBottom = 204`、窗口 244 → 字下 40px，柔光 30px 完整留在窗内
- 悬停工具条：合成一次命中 `mousemove` 让工具条出现（`108..132`，在文字上方不被遮罩区压到），再合成一次窗外移动收回穿透态 —— **这条验证是假的**：`new MouseEvent()` 只走页面内派发，绕过了操作系统的热区判定，真机上工具条从来没出现过。见第十阶段。
- 质量门：eslint 改动文件 0 error、stylelint 干净、tsc 无新增错误（仓库存量 5 条与本阶段无关）、vitest 11/11

### 2026-11-01（第十阶段）: 歌词条上色逐帧推进、工具条真实可点、跑马灯与玻璃面板降 GPU

三个用户反馈：播放界面仍有 35-38% GPU；歌词条已唱/未唱「一顿一顿像 PPT，最后跟不上」；「上面的悬浮条点不了」。

#### 1. 已唱/未唱从 3.5Hz 改成逐帧（`src/pages/desktop-lyrics/index.tsx`、`src/app.css`、`src/common/utils/mini-player.ts`）

**实测根因**：上色边界只能等主窗口推快照，而快照来自 `audio.ontimeupdate`。CDP 里用 `MutationObserver` 数歌词条 `--fill` 节点的 style 变更：**3.48 次/秒，平均间隔 276.5ms（238~303ms），每跳 31px**。人眼看就是幻灯片，而且边界恒落后半拍到一拍。

**修复**：
- 快照到达时锚定时钟 `{ baseMs, anchor: performance.now(), playing, rate, durationMs }`，歌词条本地用 `requestAnimationFrame` 按 `(now - anchor) × rate` 外推，钳到 `durationMs`。Blink 的 `timeupdate` 只有约 4Hz，两次推送之间由本窗口补全，换行/暂停/拖动都以最新一包为准（不会累积漂移，误差上限从 ~276ms 降到一帧）
- 分界不再经过 React：`.desktop-lyrics-text--fill` 的渐变写进 `app.css`，用 `calc(var(--lyric-active-frac) * var(--lyric-text-w))` 定位。rAF 每帧只 `setProperty` 一个自定义属性（不重排、不重新渲染），`--lyric-text-w` 仍由 React 在换行/换字号时写一次
- 新增 `useLayoutEffect` 在每次提交后立刻刷一次分界，避免换行那一帧闪出上一句的进度
- `rate` 进 `MiniPlayerMainStateSnapshot`（倍速 0.5~2.0 时外推要按它换算），并把 `rate` 加进主窗口 `usePlayList.subscribe` 的浅比较，改倍速立刻重推
- 帧率沿用共享设置 `animationFps`（用户已设 30）：歌词条自己不写设置，所以把 `animationFps` 加进 `DesktopLyricsViewSettings` 镜像包
- 删掉 `lineProgress` / `lyricOffset` state，改由时钟统一算

**验证**（同一首歌、同一台机器，只改实现）：更新次数 3.48/s → **46.9/s**，p50 间隔 276.5ms → **22.4ms**，每步位移 31px → **均值 0.73px / 最大 2.38px**。截图确认绿/白分界、描边柔光都正常（`frac 0.9616 × 210px = 201.936px`，computed `background-image` 里能读到解析后的 px）。

#### 2. 工具条点不了：Windows 上 `forward: true` 根本不转发（`electron/desktop-lyrics.ts`、`electron/ipc/{channel,window}.ts`、`electron/preload.ts`、`shared/types/renderer.d.ts`）

**实测**：用 PowerShell `SetCursorPos` 把**真实光标**扫过歌词条，渲染进程 `mousemove` 监听收到 **0 个事件**。单独写最小 Electron 复现窗（transparent + frameless + screen-saver 置顶 + `setIgnoreMouseEvents(true,{forward:true})`）同样是 0，把 `focusable` 改成 true 也是 0 —— 结论：Electron 38 / Windows 上这条路彻底不通，所以第九阶段那次「合成 mousemove 让工具条出现」的验证从来没测到真链路。
另一个隔离实验证明**点击本身没问题**：同样的窗口只要 `setIgnoreMouseEvents(false)`，`focusable:false` 状态下 4 次真实左键全部拿到 `mousedown/mouseup/click`（含 `-webkit-app-region: drag` 父层 + `no-drag` 子层的组合）。

**改成主进程轮询**：
- 渲染层按真实排版上报命中矩形（行的 `getBoundingClientRect()` + `HIT_PADDING 10`，上方再预留 `TOOLBAR_RESERVE 32` 给工具条，因为工具条只在命中时才渲染，判定必须提前算进去），新 IPC `desktop-lyrics:set-hit-rect`；矩形只覆盖那一行字，不覆盖整条窗口，桌面点击仍然穿透
- 主进程 `setInterval(pollHit, 60)`：`screen.getCursorScreenPoint() - win.getBounds()` 与上报矩形比较，命中才 `setIgnoreMouseEvents(false)`，并通过 `desktop-lyrics:hit` 事件把结果推回渲染层驱动工具条显示；锁定或窗口销毁时停表并强制穿透。CSS px 与 DIP 在缩放 100% 下 1:1，窗口无缩放控件
- 删掉 `setDesktopLyricsInteractive` 整条链路（channel/handler/preload/类型）

**第二个坑（真正的「点不了」）**：改成轮询后真实点击能到达页面，但事件 target 是 `DIV.desktop-lyrics-row` —— 第九阶段为了把柔光装进遮罩盒子给行加了 `margin-top: -32px`，于是**每一行的盒子向上盖住了工具条那一条**，行在 DOM 里更靠后所以吃下命中测试。工具条加 `relative z-10` 抬一层。

**验证**（全部真实输入）：光标移到 (800,580) → 工具条出现且 pill 带上 `window-drag`；点 (936,526) → 事件 target 变成 `svg`，主窗口 `暂停 → 播放` 标签翻转、再点回 `暂停`；光标移出到 (800,120) → 工具条消失（穿透恢复）。

#### 3. 播放界面 GPU：跑马灯改合成器动画 + 看不见的玻璃不再每帧糊

**跑马灯**（`src/components/marquee-lights/index.tsx`）：`@keyframes marquee-lit` 原来动 `left/top/width/height`，192 个块按显示器刷新率每帧触发布局 + 绘制，且每块挂 3 层 `box-shadow`（Skia 按 fill 走离屏高斯）—— 这是第八阶段记在「已知未动」里的最大一笔。改成只动 `transform: translate() rotate()`：
- 块的自然盒子钉在 `(0,0)` 的 `block×thickness`，位置全靠 translate；竖边要占 `[L, L+t]×[T, T+b]`，所以绕中心 `rotate(90deg)` 后平移量补 `(t-b)/2` 与 `(b-t)/2`。每个关键帧都写 `rotate()`（横边写 `rotate(0deg)`），保证函数列表一致、按分量插值
- 主窗口 `block=thickness=8` 是正方形，转角旋转等于无形；小窗 `8×2` 细条靠旋转就地转竖
- 闪光块的 WAAPI 从 `transform: scale()` 换成独立属性 `scale`，否则会把绕圈用的 transform 整个覆盖掉
- `will-change: left, top` → `will-change: transform`
- **几何等价验证**：在真页面里把旧关键帧再注入一层（同名后者覆盖），对同一 `animation-delay` 采样 17 个相位比 `getBoundingClientRect()` → **0 处偏差**；另写独立 340×80 页面按 `8×2` 与 `8×8` 各测 13 个相位 → 只有 `99.9%→100%` 那 0.1% 的转角间隙不同（旧的是把盒子从 2px 插值成 8px，新的是转 90°），约 4ms，属实现差异不是缺陷
- **代价验证**：CDP `Performance.getMetrics` 的累计计数，A/B 各 6 秒 —— 每动画帧 `LayoutCount` 从 **1.15 降到 0.30**（旧版基本每帧一次全文档布局），布局耗时从 100ms/6s 降到 <100ms 分辨率以下。像素级重绘与 GPU% 这台无显卡 VM 测不出意义，需在 1660 上复测

**看不见的玻璃**（`src/components/full-screen-player/index.tsx`、`src/layout/index.tsx`、`src/common/hooks/use-full-screen-covered.ts`）：全屏播放器打开时枚举 `backdrop-filter` 元素，发现每帧在糊的总面积 2.17M px（视口的 2.7 倍），其中：
- 评论面板 768k px 的 `blur(40px) saturate(1.5)`、播放列表/分集列表 134k+118k 的 `blur(12px)` —— 三者都处于 `opacity-0` 收起态，根本看不见
- 导航栏 65k + 播放栏 83k 的 `blur(40px)` —— 被不透明抽屉整个盖住
  收起态的三个面板在关闭分支加 `invisible`；`transition-all` 已经覆盖 `visibility`（离散属性在过渡末尾才翻转），所以滑出动画照旧，结束后才不绘制。导航栏/播放栏用 `useFullScreenCovered()`：打开 450ms（入场动画之后）才给布局子树加 `invisible`，关闭时立刻去掉，避免抽屉滑上来时看见底下闪一下。跑马灯在布局子树之外，不受影响
- **验证**：收起态下面板与导航栏/播放栏的 `visibility` 为 `hidden`，逐帧模糊面积 **1.21M px → 46.9k px**（只剩播放器里 4 个真正可见的小胶囊）；点左箭头开播放列表 → 该面板 `visibility: visible`、`opacity: 1`，未开的另一个仍是 `hidden`；截图确认跑马灯、歌词高亮、毛玻璃面板外观无变化
- **仍未动**：抽屉遮罩那层 `backdrop-filter: opacity(0.5)`（960k px 的渲染面，但只是 opacity 不是高斯）；播放器内 4 个可见胶囊的 `blur(40px)`（糊的对象本来就是虚化的封面，降半径或去掉几乎看不出来，属外观取舍，等用户点头）

#### 4. 本阶段验证手法（覆盖窗交互只能这么测）

- `setIgnoreMouseEvents` 的真伪只能用**操作系统级输入**测：PowerShell `Add-Type` 调 `user32!SetCursorPos` + `mouse_event`，再用 CDP 读页面里的 `__ev` 事件计数。`-File mouse.ps1` 每次启动约 1s，一次一条命令会让动作落在测试窗口退出之后 —— 要把整串 `move;click;move;click` 交给同一个 `seq.ps1 -Pairs "x,y;..."` 进程跑
- 窗口坐标换算：歌词条 `frame:false` 且无缩放，`window.screenX/screenY` 与 `BrowserWindow.getBounds()` 一致，页面 CSS px 即 DIP，`screenX + rect.left` 就是屏幕坐标
- 主窗口最小化时 `document.visibilityState === "hidden"`、rAF 完全停发（0 帧/s），任何逐帧测量前必须先用 `user32!ShowWindow(hwnd, SW_RESTORE)` 还原；`GetWindowTextW` 的 P/Invoke 必须写 `CharSet = CharSet.Unicode`，否则中文标题只回一个字符
- 质量门：eslint 改动文件 0 error（2 条 `exhaustive-deps` warning 与原文件同性质）、stylelint 干净、prettier 干净、tsc 125 → 125（改动文件零报错）、vitest 11/11

### 2026-11-01（第十一阶段）: 跑马灯改 canvas 渲染 + 贴边灯带造型

两个要求：① 降开销；② 造型老土，要像 Xbox/PS5 那样贴着边缘的光带。

#### 1. 从「几百个 span」改成一块 canvas（`src/components/marquee-lights/{index,renderer,trail-path}.ts`）

**旧实现的账**：第十阶段把关键帧从 `left/top/width/height` 换成 transform，布局抖动没了，但每条光带仍是 ~200 个 span，各自 `will-change: transform` 一个合成图层、每块挂三层 `box-shadow`（Skia 按 fill 走离屏高斯），而且**每帧一次全文档 style recalc**。A/B 实测（同一台机器、同一 1600×900 视口、各 8 秒）：旧 501 次 recalc / 样式耗时 880ms / 主线程 task 2310ms；新 **0 次 recalc / task 1110ms** —— 主线程忙时砍掉一半，逐帧样式重算整条消失，rAF 帧率 62.6 → 64。

**新架构**：
- `trail-path.ts`：圆角矩形走线的**弧长参数化**（四直边 + 四圆弧，`pointAt(distance, out)`）。按弧长取点，过弯才是连续转弯而不是四段直角硬折；纯函数，`tests/marquee-trail-path.test.ts` 8 条测闭合、负距取模、折线逼近弧长、点不越内缩框
- `renderer.ts`：一条 canvas。辉光用**预糊贴图**（64 个色相分桶的径向渐变小 canvas）`drawImage`，绝不用 `shadowBlur`（频谱那次的教训：按 fill 生效 = 每帧几百遍高斯）；全程 `globalCompositeOperation = "lighter"`，交叠处自然过曝成白
- 每帧只擦光带碰得到的四条边（`clearStrips`），画面中央既不绘制也不 memset；`devicePixelRatio` 上限 1.5；采样点按 `dist = trail·(i/n)^1.3` 幂律分布，头密尾疏，同样视觉长度只要几十个采样
- 帧率走共享设置 `animationFps`（`getFrameIntervalMs()`）；暂停 / `prefers-reduced-motion` / `document.hidden` 直接停 rAF，只留一圈暗底环 —— 不发帧就是真零开销
- 节拍不再碰 DOM：`handleBeat` 只写 ref（pulse 抬到能量值，帧间按 `exp(-dt / (beatMs·0.45))` 连续衰减），旧实现每拍要 `querySelectorAll` 再给 60 多个元素各挂一条 WAAPI 动画 —— 那是阶跃，不是呼吸

**踩过的三个坑**：
- **画成一串珠子**：芯线按 alpha 切成十几段分别 stroke，段与段共用端点，`lineCap: "round"` 让每个分段点被叠画两次，相加模式下变成亮疙瘩。沿最外一行量「本点 − 左右 8px 均值」的凸起列数：圆头 59 列，改 `butt` 后 43 列（残余是分段折线本身的斜率拐点，3px 线上肉眼看不出；峰值 +83 是光带头部，本来就该亮）。**段内一次 stroke 才是连续线**
- **擦除带比光还窄 → 攒出一条透明环**（用户截图指出「光影内部还是有个透明的环」）。每帧只擦四条边各 `inset + glow` ≈ 12px，可外层浅光贴图实际画到 `glow·2.85` ≈ 29px —— 擦不到的那一圈逐帧相加，攒成一圈亮环，环的内边界正好是一条圆角硬线，环和芯线之间反而是干净的透明带。量法：沿顶边往下取一列 alpha，修复前每列都在第 12 行从 0 跳到 187~248（正台阶），修复后 `clearBand = inset + glow·3.6` 单调衰减到 0、全程没有正台阶。**凡是「只擦一部分」的画布，擦除范围必须 ≥ 最外层图元的实际铺展半径**
- **`canvas.width = 同值` 也会清位图**：改圆角只走 `resize()`，若每次都给 width/height 赋值，拖圆角滑块时每帧闪一次空白。加「尺寸真变了才写」的判断

#### 2. 造型：贴边的灯缝，不是浮在中间的光带

第一版按 `inset = thickness/2 + glow·0.5` 内缩，光带离边有一截，被判「不贴边」。改成 **`inset = thickness / 2`**：芯线正好铺满最外一圈像素，辉光向外那半被窗口边界吃掉、向内那半散进画面 —— 和手柄灯缝一样亮在最外沿。走线圆角取 `radius - inset`，与窗口同心。芯线再分两层：外层彩色（`hsla(h,100%,54~78%)`，头部偏白）+ 头部 30% 再压一条近白细线，才是「灯珠点亮」的白芯彩晕；大半径浅光只在头部 55% 铺，尾部铺了就是看得见的雾。
props 换掉 `block/gap/armBlocks` 这套像素块参数，改成 `thickness / bandCount / trailRatio`。第一轮给了主窗口 3px·3 条·0.18 圈、小窗 2.5px·2 条·0.32 圈，用户判「太小没氛围感，但也别整太大」→ 现值 **主窗口 4px·3 条·0.2 圈、小窗 3px·2 条·0.34 圈**，同时把外层浅光的贴图半径系数 3.4→4、铺展 1.9→2.1、底环 alpha 0.13→0.17：向内透光从约 17px 提到约 40px，芯线只粗 1px，仍是贴在最外沿的一条线。

**验证**（这台 VM 没网，B 站播放拉不起来，所以分两层测）：
- 渲染层：`esbuild` 把 `renderer.ts` 原样打成 ESM，在真 Chromium 里跑同一个模块 —— 1600×900 冻结帧：最外一圈设备像素 **99.2% 有光**、峰值 alpha 255、色相 12 个桶全命中、画面中央 0 像素被画；3 倍放大截图确认是连续亮线不是珠子
- 集成层：`pnpm dev` 起真应用（**HMR 在这个环境是坏的**：`ws://localhost/rsbuild-hmr` 连不上，改完代码必须 `Page.reload` 才生效）。主窗口 1200×800 → canvas 1200×800、旧 DOM 节点 0、残留 `<style>` 0；暂停态最外圈 99% 亮 / 峰值 alpha 41（就是那条暗底环）
- 播放链路：`audio` 是 detached 的 `new Audio()`，DOM 里抓不到 → 用 `Page.addScriptToEvaluateOnNewDocument` 劫持 `window.Audio` 拿到实例，再 `dispatchEvent(new Event('play'))`（`play-list.ts` 里 `audio.onplay = () => set({ isPlaying: true })`）→ 合成播放态下 litPx 11948 → 38080、edgeMaxAlpha 41 → 255。小窗 `mode="listen"` 单独开起来量：340×80、最外圈 92.9%（圆角外那几个点本就不该亮）
- 质量门：eslint 0 error、prettier 干净、tsc 125 → 125（改动文件零报错）、vitest 11 → 19（新增 8 条走线几何测试）
- **待用户实测**：GPU% 在这台无显卡 VM 上没意义。旧版另有一笔本处测不到的开销 —— 200 多个合成图层 + 每块三层阴影的光栅化，在真 GPU 上才是大头


1. **不要在渲染进程直接访问 Node API** — 通过 `window.electron.*` IPC 调用
2. **新增 IPC 通道** — 在 `electron/ipc/channel.ts` 定义，`electron/ipc/` 下注册处理器，`preload.ts` 暴露，`shared/types/renderer.d.ts` 声明类型
3. **新增设置项** — 在 `shared/types/app-setting.d.ts` 添加字段，`shared/settings/app-settings.ts` 添加默认值，`src/store/settings.ts` 的 `partialize` 中添加持久化
4. **修改 audio 相关逻辑** — 注意 `play-list.ts` 中的模块级变量和 `subscribe` 回调，切歌逻辑由 `playId` 变化驱动
5. **CSS 动画** — 全局 `@keyframes` 定义在 `src/app.css`，组件内联 `style.animation` 引用
6. **Commit 规范** — 使用 conventional commits（`feat:`, `fix:`, `refactor:` 等），husky + commitlint 自动校验

> AI生成