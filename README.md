<h1 align="center">Bilibili音乐播放器</h1>
<p align="center">
  <img src="./screenshots/logo.svg" alt="Biu logo" width="120" />
</p>
<p align="center">
  基于 Bilibili API 的跨平台桌面音乐播放器 🎧🎶
</p>
<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-orange.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/Electron-38+-47848F?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript" alt="TypeScript" />
</p>

<table>
  <tr>
    <td width="50%" align="center">
      <img src="./screenshots/home.png" alt="home" width="100%" />
    </td>
    <td width="50%" align="center">
      <img src="./screenshots/main.png" alt="main" width="100%" />
    </td>
  </tr>
</table>

---

## ✨ 特色功能
- 🔎 支持 Bilibili 音乐/视频综合搜索与播放（含 DASH 与高码率选项）
- 🎼 创建与管理个性化播放列表，支持拖拽排序与快速收藏
- 🎧 高品质音频播放，优先拉取更高码率音频流（如 192K/Hi-Res）
- 📥 支持选择本地下载目录与历史列表查看
- 🧩 轻量界面，内置深色主题，细腻的滚动与动效体验
- 💿 系统托盘与最小化隐藏（Windows），便捷控制播放
- ♻️ 自动更新（electron-updater），始终保持最新体验

## 下载和使用
- 下载页面：`https://github.com/wood3n/biu/releases/latest`
- 在 Releases 中选择与你系统和架构匹配的安装包；常见文件名示例：
  - Windows 安装包：`Biu-Setup-<version>.exe`（推荐，NSIS 向导）
  - Windows 绿色版：`Biu-<version>-win-x64.exe`（portable，免安装）
  - macOS：`Biu-<version>-mac-x64.dmg` / `Biu-<version>-mac-arm64.dmg`（或对应的 `zip`）
  - Linux：`Biu-<version>-linux-*.AppImage` / `*.deb` / `*.rpm`（支持 `x64` / `arm64`）

- Windows 使用指南
  - 推荐双击安装 `Biu-Setup-<version>.exe`，按向导选择安装目录。
  - 绿色版 `Biu-<version>-win-x64.exe` 可直接运行（放置到任意目录），适合便携使用。
  - 首次启动：在设置中选择下载目录、是否启用自动更新。
  - 出现 SmartScreen 提示时：点击“更多信息” → “仍要运行”。
  - 卸载：通过“设置 → 应用 → 已安装的应用”或“控制面板 → 程序和功能”卸载；应用数据会随卸载清理。

- macOS 使用指南
  - 芯片架构：Apple Silicon 选 `arm64`，Intel 选 `x64`。
  - 安装步骤：打开 `.dmg` → 将 Biu 拖拽到“应用程序”。如选择 `zip`，解压后将 `.app` 拖入“应用程序”。
  - 第一次打开若提示“来自未知开发者”：右键点击 Biu → 选择“打开”，或在“设置 → 隐私与安全性”中允许打开。
  - 更新：支持应用内自动更新；也可下载新版本覆盖安装。

- Linux 使用指南
  - `AppImage`（通用）：
    - 赋权并运行：`chmod +x Biu-<version>-linux-*.AppImage && ./Biu-<version>-linux-*.AppImage`
  - Debian/Ubuntu（`deb`）：
    - 安装：`sudo dpkg -i Biu-<version>-linux-*.deb`
    - 若依赖缺失：`sudo apt -f install`
  - Fedora/openSUSE（`rpm`）：
    - 安装：`sudo rpm -i Biu-<version>-linux-*.rpm`
  - 启动：在应用菜单搜索 Biu，或根据发行版整合情况使用命令行启动。

- 自动更新说明
  - 应用会定期检查 GitHub Releases，下载安装更新（多数安装方式均支持）。
  - 在公司/校园网络或使用便携版时，自动更新可能受限；可前往 Releases 手动下载最新版本。

- 系统要求（建议）
  - Windows 10 / 11（`x64`）
  - macOS 12+（`x64` / `arm64`）
  - 主流 Linux 发行版（`x64` / `arm64`），`glibc ≥ 2.28` 推荐。

- 资产说明
  - `*.yml`、`*.blockmap` 为自动更新辅助文件，手动下载时无需关注。

- 使用注意
  - 部分音频清晰度与解析可能需要登录或大会员权限。
  - 请遵循 Bilibili 使用条款，合理合规使用。

## 🤝 贡献指南
非常欢迎社区贡献！你可以按以下流程参与：

1. Fork 本仓库并创建分支：`feature/your-feature` / `fix/your-fix`
2. 开发并通过本地构建与基本自测（如：`pnpm dev`、`pnpm build`）
3. 提交 PR，详述改动点与影响范围
4. 通过 CI 的构建与审查后合入主分支

建议：
- 保持代码风格一致（ESLint/Prettier 已配置）
- 提交信息简洁规范（推荐使用 `feat: ...`、`fix: ...` 等约定式格式）
- PR 中附上必要的截图或说明

## 📄 许可证
本项目以 PolyForm Noncommercial License 1.0.0（非商业许可）发布，禁止任何商业用途。详情参见 [`LICENSE`](LICENSE)（SPDX：`PolyForm-Noncommercial-1.0.0`）。

---

如果你喜欢这个项目，欢迎 ⭐️ Star 支持！也欢迎提出 Issue 交流与反馈 🙌

## ⚖️ 法律声明与使用限制
- 本项目仅供学习与研究使用，禁止任何形式的商业用途（包括但不限于销售、收费服务、广告变现、商业集成等）。
- 本项目与 Bilibili 无任何官方关联或背书，不使用其商标与标识；涉及的名称与商标归其权利人所有。
- 数据来源于用户调用的公开接口与个人账户授权；使用时需遵守 Bilibili 的《用户协议》《社区规则》及相关法律法规。
- 禁止绕过登录/会员权限、DRM/加密措施，或进行批量爬取、恶意抓取等违反平台规则的行为。
- 如需商业授权或调整许可，请联系作者；如涉及权利或合规问题，请通过 Issues 反馈以便及时处理。
