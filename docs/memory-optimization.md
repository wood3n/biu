# Biu 内存优化报告

> 日期：2026-10-03  
> 基线版本：v2.3.3-xretia (commit df46a76)  
> 测试环境：Windows Server 2022 (10.0.20348) / Node v24.18.0 / Electron 38.6.0

---

## 一、问题分析

用户反馈应用占用约 400MB 内存。经分析，Electron 应用内存由 4 个进程组成：

| 进程 | 职责 | 基线内存 (WS) |
|------|------|--------------|
| main | 主进程（Node.js + electron-log/store/updater + IPC） | 111.4 MB |
| renderer | 渲染进程（React 19 + HeroUI + 路由 + 页面） | 142.2 MB |
| gpu-process | Chromium GPU 合成 | 81.4 MB |
| utility | network service / crashpad 等 | 53.7 MB |
| **合计** | | **388.6 MB** |

### 内存热点定位

1. **kuromoji 词典（最大热点）**  
   `kuroshiro-analyzer-kuromoji` 用于日文歌词假名注音。磁盘词典 40MB（matrix.def 22MB），加载到内存后以 ArrayBuffer 形式常驻：

   | 阶段 | rss | heapUsed | external | arrayBuffers |
   |------|-----|----------|----------|--------------|
   | 加载前 | 52.6 MB | 5.5 MB | 1.9 MB | — |
   | 加载后 | 370.5 MB | 83.5 MB | 222.8 MB | 221.2 MB |
   | 置空引用+GC×3 | 157.7 MB | 5.4 MB | 1.9 MB | 0.1 MB |

   - 加载后常驻 **~190MB**（GC 后 rss 仍 158MB vs 加载前 53MB）
   - 原实现惰性加载但**永不释放**，用户用过一次假名注音后主进程永久膨胀 ~190MB

2. **拼写检查引擎（spellcheck）**  
   Electron 默认启用 Hunspell 拼写检查。音乐播放器无富文本输入需求，但输入框（搜索、歌单名）获焦输入时会加载词典常驻 10-30MB。

3. **GPU / Utility 进程**  
   Chromium 标准进程，毛玻璃（backgroundMaterial: acrylic）依赖 GPU 合成，无法裁剪。

---

## 二、优化方案

### 优化 1：kuromoji 词典移入 utilityProcess 子进程

**思路**：将词典加载和注音运算隔离到独立子进程，主进程按需 fork、空闲自动 kill，内存 100% 归还操作系统。

**改动文件**：
- `electron/furigana-worker.ts`（新增）：utility process 端，加载 kuroshiro + 处理 convert 请求
- `electron/ipc/furigana.ts`（重构）：主进程侧 worker 生命周期管理
  - 惰性 fork：首次注音请求才启动子进程
  - 空闲 10 分钟自动 kill（词典重载约数秒，无感）
  - 单次转换 30s 超时保护
  - 崩溃自愈：子进程异常退出时挂起请求按"失败返回原文"语义结清
- `plugins/electron-config-build.ts`：rollup 增加 worker 构建入口（furigana-worker.mjs）
- `electron/main.ts`：will-quit 时 destroyFuriganaWorker() 清理子进程

**保持兼容**：`addFurigana(text)` / `addFuriganaBatch(texts)` 导出签名不变，IPC handler 和渲染端零改动。

### 优化 2：关闭拼写检查

`electron/main.ts` + `electron/mini-player.ts` 的 `webPreferences` 增加 `spellcheck: false`。

---

## 三、测试验证

### 测试 1：worker 子进程隔离验证

用独立 Electron 测试脚本 fork `furigana-worker.mjs`，触发注音并测量：

| 阶段 | worker 子进程内存 |
|------|------------------|
| spawn 后 | pid 尚未分配（异步启动） |
| 词典加载 + 首次 convert | **197.7 MB WS / 202.7 MB PM** |
| 复用词典二次 convert | 197.9 MB（无增长） |
| kill 后 | **进程消失，内存 100% 归还 OS** |

- 注音功能正常：`僕は友達が少ない` → `<ruby>僕<rt>ぼく</rt></ruby>は<ruby>友達<rt>ともだち</rt></ruby>...` ✓
- kill 后 `Get-Process` 返回 GONE，worker exit code=0 ✓

### 测试 2：完整应用空闲内存（5 次采样）

| Sample | 进程数 | 总 WS (MB) | 总 PM (MB) |
|--------|--------|-----------|-----------|
| 1 | 4 | 402.9 | 181.7 |
| 2 | 4 | 402.9 | 181.7 |
| 3 | 4 | 391.2 | 169.2 |
| 4 | 4 | 390.8 | 168.6 |
| 5 | 4 | 390.5 | 168.3 |
| **平均** | | **395.7** | **173.9** |
| **稳定值(S3-5)** | | **~391** | **~168.5** |

进程明细（稳定后）：
| 进程 | WS (MB) | PM (MB) |
|------|---------|---------|
| renderer | 144.9 | 54.6 |
| main | 111.7 | 81.8 |
| gpu-process | 80.1 | 18.6 |
| utility | 53.9 | 13.3 |

### 测试 3：构建验证

`pnpm build` 成功，rollup 产出三个入口：
- `.electron/main.mjs` — 主进程（ESM）
- `.electron/preload.cjs` — 预加载（CJS）
- `.electron/furigana-worker.mjs` — 注音 worker（ESM，新增）

---

## 四、效果总结

| 场景 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 空闲（未用注音） | 388.6 MB | ~391 MB | 持平（无退化） |
| 用过注音后 | ~580 MB（主进程+190MB 常驻不释放） | ~391 MB（worker kill 后回落） | **省 ~190MB** |
| 注音功能可用性 | 正常 | 正常（首次重载词典数秒） | 无功能损失 |
| 长期运行内存趋势 | 单调递增（词典不释放） | 用完即释放，稳定回落 | 根本性改善 |

### 核心收益

- **用过假名注音后**：主进程不再永久膨胀 ~190MB，词典内存隔离在子进程，空闲 10 分钟自动 kill 归零
- **内存归还确定性**：kill 子进程内存立即归还 OS（不依赖 V8 GC 时机），优于主进程内释放
- **功能零损失**：注音结果一致，首次重载词典数秒可接受（后续复用）
- **空闲无退化**：未用注音时内存与基线持平
