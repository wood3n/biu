<h1 align="center">【WIP】Bilibili音乐播放器</h1>
<p align="center">
  <img src="./screenshots/logo.svg" alt="Biu logo" width="120" />
</p>
<p align="center">
  基于 Bilibili API 的跨平台桌面音乐播放器 🎧🎶
</p>
<p align="center">
  <a href="https://github.com/wood3n/biu/releases">
    <img src="https://img.shields.io/github/v/release/wood3n/biu?include_prereleases&label=latest&color=blueviolet" alt="Latest Version" />
  </a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-orange.svg" alt="License" /></a>
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
- 🔎 支持 Bilibili 音乐/视频综合搜索与播放
- 🎼 支持登录 Bilibili 并获取收藏夹信息
- 🎧 高品质音频播放，优先拉取更高码率音频流（如无损 Flac，192K/Hi-Res）
- 🧩 轻量界面，内置深色主题，同时可自定义部分主题样式，细腻的滚动与动效体验
- 💿 系统托盘与最小化隐藏（Windows），便捷控制播放
- ♻️ 自动检测更新，始终保持最新体验

## 下载和使用
- 下载页面：[Github Release](https://github.com/wood3n/biu/releases/latest)
- 在 Releases 中选择与你系统和架构匹配的安装包；常见文件名示例：
  - Windows 安装包：`Biu-Setup-<version>.exe`（推荐，NSIS 向导）
  - Windows 绿色版：`Biu-<version>-win-x64.exe`（portable，免安装）
  - macOS：`Biu-<version>-mac-x64.dmg` / `Biu-<version>-mac-arm64.dmg`（或对应的 `zip`）
  - Linux：`Biu-<version>-linux-*.AppImage` / `*.deb` / `*.rpm`（支持 `x64` / `arm64`）

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

## 🙏 鸣谢
- 特别感谢 [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) 对哔哩哔哩 API 的长期收集与整理，为本项目相关接口的使用提供了重要参考。
- 在引用与使用相关资料时，我们遵循其许可条款（`CC-BY-NC 4.0`），仅用于学习与研究，不涉及任何商业用途。

## ⚖️ 法律声明与使用限制
- 本项目仅供学习与研究使用，禁止任何形式的商业用途（包括但不限于销售、收费服务、广告变现、商业集成等）。
- 本项目与 Bilibili 无任何官方关联或背书，不使用其商标与标识；涉及的名称与商标归其权利人所有。
- 数据来源于用户调用的公开接口与个人账户授权；使用时需遵守 Bilibili 的《用户协议》《社区规则》及相关法律法规。
- 禁止绕过登录/会员权限、DRM/加密措施，或进行批量爬取、恶意抓取等违反平台规则的行为。
- 如需商业授权或调整许可，请联系作者；如涉及权利或合规问题，请通过 Issues 反馈以便及时处理。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=wood3n/biu&type=date&legend=top-left)](https://www.star-history.com/#wood3n/biu&type=date&legend=top-left)
