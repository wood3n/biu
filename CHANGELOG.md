---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '8aec60f5-1f43-4e9e-b10a-2bb8207563ac'
  PropagateID: '8aec60f5-1f43-4e9e-b10a-2bb8207563ac'
  ReservedCode1: 'f3a33bdb-a39d-43aa-ae52-981647d619a2'
  ReservedCode2: 'f3a33bdb-a39d-43aa-ae52-981647d619a2'
---

# Changelog

## v2.2.0-xretia

[compare changes](https://github.com/xRetia/biu/compare/v2.1.0-xretia...v2.2.0-xretia)

### 🚀 新功能

- 全屏播放器新增评论面板，支持虚拟滚动、表情展示与自动加载更多 ([c8012d2](https://github.com/xRetia/biu/commit/c8012d2))
- 评论图片支持点击放大预览，独立于评论面板不影响其状态 ([f5fcad9](https://github.com/xRetia/biu/commit/f5fcad9))
- 评论面板新增「在 B 站打开」按钮与收起标签回复数显示 ([4821050](https://github.com/xRetia/biu/commit/4821050))
- 歌词控制按钮按功能分为三组，评论与音量按钮常驻显示 ([b792b02](https://github.com/xRetia/biu/commit/b792b02))
- BBPlayer 收藏夹操作栏新增「…」菜单，提供下载全部音频/视频 ([115c595](https://github.com/xRetia/biu/commit/115c595))
- BBPlayer 收藏夹后台同步时刷新图标最少旋转 1 秒 ([0213f21](https://github.com/xRetia/biu/commit/0213f21))
- 迷你播放器支持直角边框、亚克力模糊与更大范围的拖拽区域 ([b2e5768](https://github.com/xRetia/biu/commit/b2e5768))

### 🩹 修复问题

- 修复楼中楼「加载更多」误关评论面板的问题 ([98bb5cd](https://github.com/xRetia/biu/commit/98bb5cd))
- 修复评论图片预览滚轮缩放导致页面异常滚动与点击穿透的问题，预览交互整体简化 ([98bb5cd](https://github.com/xRetia/biu/commit/98bb5cd))
- 统一筛选标签栏与按钮高度为 40px，补充阴影对齐视觉高度 ([c896457](https://github.com/xRetia/biu/commit/c896457))
- BBPlayer 收藏夹封面缩略图宽度调整为 168px ([44eede4](https://github.com/xRetia/biu/commit/44eede4))
- 修复迷你播放器进度条滑块样式问题 ([562f76b](https://github.com/xRetia/biu/commit/562f76b))

### 🎨 UI 调整

- 评论面板毛玻璃背景与楼中楼默认展开 ([3df6c51](https://github.com/xRetia/biu/commit/3df6c51))
- 筛选标签栏添加阴影保持与并排控件视觉高度一致 ([5eed54c](https://github.com/xRetia/biu/commit/5eed54c))

## v2.1.0-xretia

[compare changes](https://github.com/xRetia/biu/compare/v2.0.0-xretia...v2.1.0-xretia)

### 🚀 新功能

- 迷你播放器双行布局，歌词支持条件跑马灯滚动 ([479c99a](https://github.com/xRetia/biu/commit/479c99a))
- 迷你播放器亚克力模糊效果，悬停时显示歌名 ([bda9fd5](https://github.com/xRetia/biu/commit/bda9fd5))

### 🩹 修复问题

- 搜索输入下拉面板改用 createPortal 实现，避免 Popover 劫持焦点 ([8aa1492](https://github.com/xRetia/biu/commit/8aa1492))
- 调整迷你播放器进度条滑块样式 ([562f76b](https://github.com/xRetia/biu/commit/562f76b))

## v2.0.0-xretia

[compare changes](https://github.com/xRetia/biu/compare/v1.16.0...v2.0.0-xretia)

### 🚀 新功能

- 新增 BBPlayer 共享歌单：登录、歌单列表、缓存与过期自动刷新、播放栏收藏状态共享、修改与成员管理、下载全部音频/视频等完整功能 ([7f9f1f4](https://github.com/xRetia/biu/commit/7f9f1f4) → [115c595](https://github.com/xRetia/biu/commit/115c595))
- 播放栏折叠功能与折叠态横向小卡片 ([8dffe04](https://github.com/xRetia/biu/commit/8dffe04), [69651a7](https://github.com/xRetia/biu/commit/69651a7))
- 歌词翻译开关与假名注音功能 ([679309a](https://github.com/xRetia/biu/commit/679309a))
- 全屏播放器布局与播放列表重构 ([efb44ef](https://github.com/xRetia/biu/commit/efb44ef))
- 播放列表与分集列表改用整行右键菜单 ([7721ead](https://github.com/xRetia/biu/commit/7721ead))
- 导航栏毛玻璃悬浮，内容可滚动穿过 ([f0d6e49](https://github.com/xRetia/biu/commit/f0d6e49))
- 搜索建议面板改为毛玻璃效果 ([7132fe5](https://github.com/xRetia/biu/commit/7132fe5))
- 全屏播放器设置面板改为 Modal 居中弹窗 + 深色毛玻璃 ([cbfebaf](https://github.com/xRetia/biu/commit/cbfebaf))
- 全弹出菜单统一毛玻璃背景 ([15d3f62](https://github.com/xRetia/biu/commit/15d3f62))
- 主界面播放列表参考全屏播放器改造 ([cd80b3b](https://github.com/xRetia/biu/commit/cd80b3b))
- 收藏弹窗支持 B 站收藏夹与 BBPlayer 歌单同屏多选互移 ([ee50000](https://github.com/xRetia/biu/commit/ee50000))
- BBPlayer 歌单支持删除（owner）([91b157f](https://github.com/xRetia/biu/commit/91b157f))
- BBPlayer 收藏夹本地搜索与排序 ([62c5102](https://github.com/xRetia/biu/commit/62c5102))
- 收藏夹编辑弹窗与取消收藏危险项菜单样式 ([a2b6df8](https://github.com/xRetia/biu/commit/a2b6df8), [4f29b23](https://github.com/xRetia/biu/commit/4f29b23))
- 歌单本地缓存并启动时优先渲染缓存 ([2858169](https://github.com/xRetia/biu/commit/2858169))
- 折叠侧边栏支持垂直居中显示选项 ([2f66424](https://github.com/xRetia/biu/commit/2f66424))
- 图片上传组件支持自定义裁剪比例 ([04fa391](https://github.com/xRetia/biu/commit/04fa391))
- 侧边栏收起态 BBPlayer 歌单图标随机色背景 ([7e3cfe4](https://github.com/xRetia/biu/commit/7e3cfe4))
- BBPlayer 歌单页显示 ID 与复制分享链接按钮 ([84885d3](https://github.com/xRetia/biu/commit/84885d3))
- 未登录默认头像改为 B 站默认头像 ([90e5af1](https://github.com/xRetia/biu/commit/90e5af1))
- 动态入口图标替换为铃铛通知样式 ([999decd](https://github.com/xRetia/biu/commit/999decd))

### 🩹 修复问题

- BBPlayer unique_key 双冒号格式与 sort_key fractional-indexing 对齐 BBPlayer 手机端 ([4cc4d4b](https://github.com/xRetia/biu/commit/4cc4d4b))
- 收藏弹窗 BBP 与 B 站 API 并行执行，异步同步不覆盖用户手动勾选 ([beea4d5](https://github.com/xRetia/biu/commit/beea4d5), [5e81133](https://github.com/xRetia/biu/commit/5e81133))
- 修复播放栏折叠/展开影响播放进度的问题 ([69651a7](https://github.com/xRetia/biu/commit/69651a7))
- 修复 marquee 无缝循环与播放栏常驻滚动 ([79d1b07](https://github.com/xRetia/biu/commit/79d1b07))
- 修复播放按钮居中、频谱辉光截断并支持自动搜索歌词 ([bd5752b](https://github.com/xRetia/biu/commit/bd5752b))
- 修复返回顶部按钮样式并加入出场动画 ([b69b889](https://github.com/xRetia/biu/commit/b69b889))
- 修复播放栏折叠展开改为水平拉伸弹回动画 ([6de3865](https://github.com/xRetia/biu/commit/6de3865))
- 修复菜单设置勾选无效问题 ([6d5af14](https://github.com/xRetia/biu/commit/6d5af14))
- 修复导航栏 BBPlayer 和播放栏分集按钮灰色背景 ([dcc8892](https://github.com/xRetia/biu/commit/dcc8892))
- 修复 BBP 歌单详情页列错位和播放量不显示 ([7d45112](https://github.com/xRetia/biu/commit/7d45112))
- 修复添加歌曲到 BBPlayer 歌单失败的问题 ([e198f8e](https://github.com/xRetia/biu/commit/e198f8e), [513fb56](https://github.com/xRetia/biu/commit/513fb56))
- 修复 B 站收藏夹不显示的问题 ([b9c4709](https://github.com/xRetia/biu/commit/b9c4709))
- 修复侧边栏图标尺寸和彩色 badge 统一 ([efeb723](https://github.com/xRetia/biu/commit/efeb723))
- 修复分集列表搜索框圆角跟随设置 ([032eb3f](https://github.com/xRetia/biu/commit/032eb3f))
- 搜索框 trigger 圆角跟随设置并禁用点击缩放 ([afe9ac7](https://github.com/xRetia/biu/commit/afe9ac7))
- 毛玻璃样式应用到页面列表搜索输入框 ([f398741](https://github.com/xRetia/biu/commit/f398741))
- 毛玻璃菜单 hover 高亮只作用于菜单项 ([8e3510c](https://github.com/xRetia/biu/commit/8e3510c))
- 修复 user-profile 收藏夹 GridCard 缺失 type 属性 ([6d74fcc](https://github.com/xRetia/biu/commit/6d74fcc))

### 💅 Refactors

- 登录从用户菜单剥离为导航栏独立 BBPlayer 按钮 ([2e2cafd](https://github.com/xRetia/biu/commit/2e2cafd))
- 下载记录页改为平铺列表样式并使用 Tabs 筛选 ([89d6d27](https://github.com/xRetia/biu/commit/89d6d27))
- 滚动占位改为 JS spacer 并支持自定义顶部高度 ([95fc8ff](https://github.com/xRetia/biu/commit/95fc8ff))
- bbplayer 提示改为背景卡片 + 感叹号图标 ([1969556](https://github.com/xRetia/biu/commit/1969556))
- 精简共享歌单提示并缩小封面尺寸 ([e000549](https://github.com/xRetia/biu/commit/e000549))

### 🎨 UI 调整

- 登录弹窗毛玻璃化，手机号与国家码输入框并排布局 ([fe9bc7d](https://github.com/xRetia/biu/commit/fe9bc7d))
- Toast 毛玻璃化并移至右上角导航栏下方 ([721c2c2](https://github.com/xRetia/biu/commit/721c2c2))
- 右键菜单危险操作项选中时白字红底，未选中红字 ([7ca0d08](https://github.com/xRetia/biu/commit/7ca0d08))
- 全局统一输入控件背景为半透明灰 ([6d5c33a](https://github.com/xRetia/biu/commit/6d5c33a))
- 时间筛选 Tabs 改为 solid 变体并统一背景 ([cee6a35](https://github.com/xRetia/biu/commit/cee6a35))
- 播放条展开时滚动容器底部增加占位避免内容遮挡 ([f4faa70](https://github.com/xRetia/biu/commit/f4faa70))
- 调整导航栏右侧排版：头像前置、图标尺寸统一、分组间距优化 ([f023a65](https://github.com/xRetia/biu/commit/f023a65))
- 播放栏折叠态封面跟随全局圆角 ([35fa22b](https://github.com/xRetia/biu/commit/35fa22b))

## v1.16.0

[compare changes](https://github.com/wood3n/biu/compare/v1.15.0...v1.16.0)

### 🚀 新功能

- 为用户投稿页面添加全部播放按钮 ([0c25e07](https://github.com/wood3n/biu/commit/0c25e07))
- 新增点赞按钮和一键三连功能 ([8515a5f](https://github.com/wood3n/biu/commit/8515a5f))

### 🩹 修复问题

- Review problem ([c5360dd](https://github.com/wood3n/biu/commit/c5360dd))

### 🎨 UI 调整

- 调整音乐推荐页面样式以及投稿播放全部的逻辑 ([60cc885](https://github.com/wood3n/biu/commit/60cc885))

### ❤️ Contributors

- Wood3n
- ShellMonster

## v1.15.0

[compare changes](https://github.com/wood3n/biu/compare/v1.14.0...v1.15.0)

### 🚀 新功能

- 为侧边栏收藏夹添加折叠功能 ([6498bdc](https://github.com/wood3n/biu/commit/6498bdc))
- 推荐音乐增加音乐、鬼畜分区显示 ([ca4617f](https://github.com/wood3n/biu/commit/ca4617f))

### 🩹 修复问题

- 修复一些UI显示问题 ([845466d](https://github.com/wood3n/biu/commit/845466d))
- 修复一些UI显示问题 ([992aa6b](https://github.com/wood3n/biu/commit/992aa6b))
- 修复收藏夹分组标题换行问题 ([81a13cc](https://github.com/wood3n/biu/commit/81a13cc))
- Use dev icon ([af9cd7a](https://github.com/wood3n/biu/commit/af9cd7a))
- 修复筛选排序点击问题 ([7f71c05](https://github.com/wood3n/biu/commit/7f71c05))
- 移除无用的文件和依赖 ([133f1f8](https://github.com/wood3n/biu/commit/133f1f8))
- Update pnpm lock ([d78cfc2](https://github.com/wood3n/biu/commit/d78cfc2))
- Review problem ([0f20b58](https://github.com/wood3n/biu/commit/0f20b58))
- 优化数据请求 ([4a866ea](https://github.com/wood3n/biu/commit/4a866ea))

### 💅 Refactors

- 重构收藏夹分组渲染逻辑 ([6cdef07](https://github.com/wood3n/biu/commit/6cdef07))

### 🎨 UI 调整

- 优化顶部用户动态页面显示 ([5190753](https://github.com/wood3n/biu/commit/5190753))
- 优化推荐音乐页面显示 ([edeb874](https://github.com/wood3n/biu/commit/edeb874))

### ❤️ Contributors

- Wood3n
- ShellMonster

## v1.14.0

[compare changes](https://github.com/wood3n/biu/compare/v1.13.0...v1.14.0)

### 🚀 新功能

- Add toggle to stop reporting playback history ([f6dd39e](https://github.com/wood3n/biu/commit/f6dd39e))
- Add a button to enable/disable reporting playback history in history page ([4142a8a](https://github.com/wood3n/biu/commit/4142a8a))
- 新增本地音乐页面 ([147f9cd](https://github.com/wood3n/biu/commit/147f9cd))

### 🩹 修复问题

- 修复视频系列数据显示问题 ([5ad3f8e](https://github.com/wood3n/biu/commit/5ad3f8e))
- 移除无用的代码 ([b66e374](https://github.com/wood3n/biu/commit/b66e374))
- Review problem ([1b54010](https://github.com/wood3n/biu/commit/1b54010))
- Review problem ([1376532](https://github.com/wood3n/biu/commit/1376532))

### ❤️ Contributors

- Wood3n
- UtopiaXC

## v1.13.0

[compare changes](https://github.com/wood3n/biu/compare/v1.12.0...v1.13.0)

### 🚀 新功能

- Add play all button to music recommend and search pages ([ba87e45](https://github.com/wood3n/biu/commit/ba87e45))
- 全屏播放增加样式设置 ([e0b9607](https://github.com/wood3n/biu/commit/e0b9607))

### 🩹 修复问题

- Sanitize HTML tags from playlist song titles ([5932d53](https://github.com/wood3n/biu/commit/5932d53))
- 修复全屏播放颜色选择问题 ([51eda4b](https://github.com/wood3n/biu/commit/51eda4b))
- 修复全屏播放颜色选择问题 ([dc811dc](https://github.com/wood3n/biu/commit/dc811dc))

### 💅 Refactors

- Optimize play all button behavior ([da9b8b8](https://github.com/wood3n/biu/commit/da9b8b8))

### ❤️ Contributors

- Wood3n
- ShellMonster

## v1.12.0

[compare changes](https://github.com/wood3n/biu/compare/v1.11.0...v1.12.0)

### 🚀 新功能

- 全屏播放器新增歌词显示功能 ([7314f36](https://github.com/wood3n/biu/commit/7314f36))

### 🩹 修复问题

- 移除无用的文件 ([e87b941](https://github.com/wood3n/biu/commit/e87b941))
- Revie problem ([435159a](https://github.com/wood3n/biu/commit/435159a))
- Translate lyrics not show ([5520c7b](https://github.com/wood3n/biu/commit/5520c7b))
- Review problem ([8f34d11](https://github.com/wood3n/biu/commit/8f34d11))
- Review problem ([b8cc76a](https://github.com/wood3n/biu/commit/b8cc76a))

### ❤️ Contributors

- Wood3n

## v1.11.0

[compare changes](https://github.com/wood3n/biu/compare/v1.10.0...v1.11.0)

### 🚀 新功能

- 侧边收藏夹菜单支持右键菜单 ([444cbbc](https://github.com/wood3n/biu/commit/444cbbc))

### 🔥 功能优化

- 侧边菜单蓝宽度支持拖拽修改 ([bde813d](https://github.com/wood3n/biu/commit/bde813d))

### 🩹 修复问题

- **deps:** Update ui libraries ([f7ea206](https://github.com/wood3n/biu/commit/f7ea206))
- 优化主题切换组件代码，移除主题色配置功能 ([8cde702](https://github.com/wood3n/biu/commit/8cde702))
- 解决播放异步报错问题 ([2d90b71](https://github.com/wood3n/biu/commit/2d90b71))
- **deps:** Update dependency got to ^14.6.6 ([a9b24fa](https://github.com/wood3n/biu/commit/a9b24fa))
- 修复之前重构导致失效收藏夹仍然显示的问题 ([5e99c6b](https://github.com/wood3n/biu/commit/5e99c6b))
- 恢复主题设置 ([a9f5f75](https://github.com/wood3n/biu/commit/a9f5f75))
- Review problem ([b00a986](https://github.com/wood3n/biu/commit/b00a986))
- Review problem ([6b6a317](https://github.com/wood3n/biu/commit/6b6a317))
- Review problem ([9bfe6a9](https://github.com/wood3n/biu/commit/9bfe6a9))
- 修复播放时链接资源无法获取导致无法播放的问题 ([a41af9c](https://github.com/wood3n/biu/commit/a41af9c))
- Review problem ([c1f927c](https://github.com/wood3n/biu/commit/c1f927c))
- 修复收藏夹排序问题（#198） ([#198](https://github.com/wood3n/biu/issues/198))

### ❤️ Contributors

- Wood3n

## v1.10.0

[compare changes](https://github.com/wood3n/biu/compare/v1.9.0...v1.10.0)

### 🚀 新功能

- 侧边菜单支持拖拽排序 ([6a90615](https://github.com/wood3n/biu/commit/6a90615))

### 🩹 修复问题

- 修复一些问题 ([f5e1cbf](https://github.com/wood3n/biu/commit/f5e1cbf))
- 修复mac顶部logo在折叠菜单状态下的样式问题 ([1950741](https://github.com/wood3n/biu/commit/1950741))
- 修改随机播放选项样式 ([1270dd4](https://github.com/wood3n/biu/commit/1270dd4))
- 修复在部分滚动区域意外显示返回顶部按钮的问题 ([43a42ae](https://github.com/wood3n/biu/commit/43a42ae))
- 修复侧边栏拖拽问题 ([eb64b6d](https://github.com/wood3n/biu/commit/eb64b6d))
- 修复播放历史记录上报问题 ([5c2e32a](https://github.com/wood3n/biu/commit/5c2e32a))
- 修复播放历史记录上报问题 ([1ccd3ed](https://github.com/wood3n/biu/commit/1ccd3ed))
- 优化交互 ([9c035e4](https://github.com/wood3n/biu/commit/9c035e4))

### 🏡 Chore

- Add chrome-devtools-mcp config ([9414730](https://github.com/wood3n/biu/commit/9414730))

### ❤️ Contributors

- Wood3n
- Oxyg3n

## v1.9.0

[compare changes](https://github.com/wood3n/biu/compare/v1.8.0...v1.9.0)

### 🚀 新功能

- 支持收藏夹封面图设置 ([0f875ae](https://github.com/wood3n/biu/commit/0f875ae))
- 顶部动态补充动态更新提示 ([984f0e0](https://github.com/wood3n/biu/commit/984f0e0))
- 新增侧边菜单收缩功能 ([07484ba](https://github.com/wood3n/biu/commit/07484ba))

### 🩹 修复问题

- 修改播放列表菜单显示 ([b63d0cd](https://github.com/wood3n/biu/commit/b63d0cd))
- 修改review问题 ([b2adec7](https://github.com/wood3n/biu/commit/b2adec7))
- 补充更新侧边栏收藏夹逻辑 ([3eaf7bd](https://github.com/wood3n/biu/commit/3eaf7bd))
- 优化交互 ([2713bfc](https://github.com/wood3n/biu/commit/2713bfc))
- 优化搜索样式 ([77ecfef](https://github.com/wood3n/biu/commit/77ecfef))
- 优化收藏按钮样式，修改review问题 ([d53f791](https://github.com/wood3n/biu/commit/d53f791))
- 移除无用的文件 ([791c715](https://github.com/wood3n/biu/commit/791c715))
- Solve review problem ([360814a](https://github.com/wood3n/biu/commit/360814a))

### ❤️ Contributors

- Wood3n

## v1.8.0

[compare changes](https://github.com/wood3n/biu/compare/v1.7.1...v1.8.0)

### 🚀 新功能

- 新增全屏播放组件 ([fe8bf2e](https://github.com/wood3n/biu/commit/fe8bf2e))
- 优化页面列表UI显示，支持compact紧凑模式UI ([a4df42e](https://github.com/wood3n/biu/commit/a4df42e))
- 优化页面列表显示，补充图片请求参数 ([d2c9fd3](https://github.com/wood3n/biu/commit/d2c9fd3))
- 优化主题切换 ([2ba248f](https://github.com/wood3n/biu/commit/2ba248f))
- 新增代理设置功能 ([541aa81](https://github.com/wood3n/biu/commit/541aa81))

### 🔥 功能优化

- 优化播放列表等组件 ([ed358aa](https://github.com/wood3n/biu/commit/ed358aa))

### 🩹 修复问题

- 完善全屏播放弹窗功能 ([2b72a14](https://github.com/wood3n/biu/commit/2b72a14))
- 移除无用的组件代码 ([e5b0e22](https://github.com/wood3n/biu/commit/e5b0e22))
- 移除无用的console ([1ad43bf](https://github.com/wood3n/biu/commit/1ad43bf))
- 搜索记录顺序调整&截取 ([a98419a](https://github.com/wood3n/biu/commit/a98419a))
- 修复UI一致性 ([38c3201](https://github.com/wood3n/biu/commit/38c3201))
- 修复UI一致性 ([ae7d802](https://github.com/wood3n/biu/commit/ae7d802))
- 修复review问题 ([d57515f](https://github.com/wood3n/biu/commit/d57515f))
- 修复关闭应用后没有按钮点击继续下载的问题 ([3123d48](https://github.com/wood3n/biu/commit/3123d48))
- 修复恢复下载和收藏夹播放按钮显示问题 ([eeea362](https://github.com/wood3n/biu/commit/eeea362))
- 修复tray icon显示和首页右键菜单显示 ([e962e4a](https://github.com/wood3n/biu/commit/e962e4a))
- 统一收藏夹点击播放事件 ([e45c6c7](https://github.com/wood3n/biu/commit/e45c6c7))

### ❤️ Contributors

- Wood3n
- Oxyg3n

## v1.7.1

[compare changes](https://github.com/wood3n/biu/compare/v1.7.1-beta.1...v1.7.1)

### 🩹 修复问题

- Update by gemini & remove wave setting ([2ba5735](https://github.com/wood3n/biu/commit/2ba5735))
- Update theme code ([0d98de3](https://github.com/wood3n/biu/commit/0d98de3))
- Update theme code ([8590dda](https://github.com/wood3n/biu/commit/8590dda))

### 🎨 UI 调整

- Normalize the settings page ([da2aea4](https://github.com/wood3n/biu/commit/da2aea4))

### ❤️ Contributors

- Xfly
- Fly ([@flystar233](https://github.com/flystar233))

## v1.7.1-beta.1

[compare changes](https://github.com/wood3n/biu/compare/v1.7.1-beta.0...v1.7.1-beta.1)

### 🩹 修复问题

- 修复内置ffmpeg缺少运行库导致下载失败的问题 ([055f042](https://github.com/wood3n/biu/commit/055f042))

### ❤️ Contributors

- Oxyg3n

## v1.7.1-beta.0

[compare changes](https://github.com/wood3n/biu/compare/v1.7.0...v1.7.1-beta.0)

### 🔥 功能优化

- 补充内置精简版ffmpeg ([5ec29e8](https://github.com/wood3n/biu/commit/5ec29e8))

### 🩹 修复问题

- **deps:** Update tailwindcss ecosystem ([0829134](https://github.com/wood3n/biu/commit/0829134))
- 修复review问题 ([33f4d2a](https://github.com/wood3n/biu/commit/33f4d2a))
- 修改ffmpeg执行权限 ([04773cb](https://github.com/wood3n/biu/commit/04773cb))
- Review problem ([f8d9805](https://github.com/wood3n/biu/commit/f8d9805))

### 💅 Refactors

- 优化收藏等modal状态管理 ([f2d6079](https://github.com/wood3n/biu/commit/f2d6079))

### 📖 Documentation

- 更新README ([702c511](https://github.com/wood3n/biu/commit/702c511))

### ❤️ Contributors

- Wood3n

## v1.7.0

[compare changes](https://github.com/wood3n/biu/compare/v1.6.1...v1.7.0)

### 🚀 新功能

- 新增查看视频动态功能 ([99730d8](https://github.com/wood3n/biu/commit/99730d8))
- 全局接口接入极验风控校验 ([6e30b86](https://github.com/wood3n/biu/commit/6e30b86))

### 🩹 修复问题

- 获取播放链接被风控时接入极验 ([b9c7264](https://github.com/wood3n/biu/commit/b9c7264))
- Import path ([cda71e8](https://github.com/wood3n/biu/commit/cda71e8))
- 优化geetest代码 ([1f8c0fd](https://github.com/wood3n/biu/commit/1f8c0fd))
- 优化查看动态review问题 ([0f56a3b](https://github.com/wood3n/biu/commit/0f56a3b))
- 移除无用的提示 ([9ae8c88](https://github.com/wood3n/biu/commit/9ae8c88))
- 完善用户空间动态功能 ([2599206](https://github.com/wood3n/biu/commit/2599206))

### 🏡 Chore

- Change renovate update privacy ([d43d17b](https://github.com/wood3n/biu/commit/d43d17b))

### ❤️ Contributors

- Wood3n

## v1.6.1

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0...v1.6.1)

### 🩹 修复问题

- 补充播放报错时日志采集 ([bcacfdb](https://github.com/wood3n/biu/commit/bcacfdb))
- 修复mini播放器进度同步问题 ([5873216](https://github.com/wood3n/biu/commit/5873216))
- Fix release script ([5176616](https://github.com/wood3n/biu/commit/5176616))

### ❤️ Contributors

- Wood3n

## v1.6.0

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.11...v1.6.0)

### 🚀 新功能

- 新增系统快捷键功能 ([0f0e15c](https://github.com/wood3n/biu/commit/0f0e15c))

### 🩹 修复问题

- Mac dock icon ([3c7617a](https://github.com/wood3n/biu/commit/3c7617a))
- 修复快捷键设置和注册问题 ([a3e379c](https://github.com/wood3n/biu/commit/a3e379c))
- 完善快捷键设置功能 ([0c177a8](https://github.com/wood3n/biu/commit/0c177a8))
- 修改快捷键映射在不同系统的显示 ([e3ede64](https://github.com/wood3n/biu/commit/e3ede64))
- 修改下载文件名命名规则，避免过长文件名和覆盖本地同名文件 ([efca4ca](https://github.com/wood3n/biu/commit/efca4ca))
- 修改review问题 ([ae91fc9](https://github.com/wood3n/biu/commit/ae91fc9))
- Progress bar optimization ([fb82a97](https://github.com/wood3n/biu/commit/fb82a97))
- 修复文件名非法字符导致下载失败的问题 ([c8cc1ef](https://github.com/wood3n/biu/commit/c8cc1ef))
- 修复模块导入路径 ([3d2b840](https://github.com/wood3n/biu/commit/3d2b840))
- 修复review问题 ([6356548](https://github.com/wood3n/biu/commit/6356548))
- 修复文件夹不存在导致下载失败的问题 ([2a32ac9](https://github.com/wood3n/biu/commit/2a32ac9))
- 将移除和创建文件夹修改为异步实现 ([80668d8](https://github.com/wood3n/biu/commit/80668d8))
- 修复review问题 ([5b43d34](https://github.com/wood3n/biu/commit/5b43d34))

### 💅 Refactors

- 优化切换mini播放器实现，以响应快捷键设置 ([4de3d23](https://github.com/wood3n/biu/commit/4de3d23))

### 📖 Documentation

- Perf readme ([347402e](https://github.com/wood3n/biu/commit/347402e))

### 🏡 Chore

- **release:** V1.6.0-beta.12 ([39c56a6](https://github.com/wood3n/biu/commit/39c56a6))
- **release:** V1.6.0-beta.13 ([65f9ed2](https://github.com/wood3n/biu/commit/65f9ed2))

### ❤️ Contributors

- Wood3n
- Jeremy
- Oxyg3n

## v1.6.0-beta.13

### 🩹 修复问题

- 修复非法文件名导致下载失败的问题（#145）

### ❤️ Contributors

- Wood3n

## v1.6.0-beta.12

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.6...v1.6.0-beta.12)

### 🚀 新功能

- 设置页面新增快捷键设置功能

### 🩹 修复问题

- 修复更改下载文件夹不生效的问题

## v1.6.0-beta.11

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.10...v1.6.0-beta.11)

## v1.6.0-beta.10

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.9...v1.6.0-beta.10)

### 🚀 新功能

- 下载功能支持断点续传 ([89c8b19](https://github.com/wood3n/biu/commit/89c8b19))
- 优化代码 ([0c2436a](https://github.com/wood3n/biu/commit/0c2436a))

### 🩹 修复问题

- 移除无用的ipc方法 ([dc4f4f8](https://github.com/wood3n/biu/commit/dc4f4f8))
- 修复下载记录初始化后重复下载的问题 ([dbe1e34](https://github.com/wood3n/biu/commit/dbe1e34))
- 支持断点续传和合并 ([fd8468a](https://github.com/wood3n/biu/commit/fd8468a))
- 修复review问题 ([224c87c](https://github.com/wood3n/biu/commit/224c87c))
- Mac dock icon ([0c2c3c9](https://github.com/wood3n/biu/commit/0c2c3c9))
- Action's macos version ([906db36](https://github.com/wood3n/biu/commit/906db36))

### ❤️ Contributors

- Oxyg3n
- Wood3n

## v1.6.0-beta.9

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.8...v1.6.0-beta.9)

### 🚀 新功能

- **媒体显示:** 添加卡片和列表两种显示模式 test:目前只在我创建的收藏夹中使用 添加 displayMode 设置选项，支持在卡片和列表两种显示模式间切换 创建 MediaItem 组件统一处理不同显示模式的渲染逻辑 更新收藏页面以支持新的显示模式 ([719a8b1](https://github.com/wood3n/biu/commit/719a8b1))
- **media-item:** 替换MVCard为MediaItem组件并支持显示模式切换 ([7568001](https://github.com/wood3n/biu/commit/7568001))
- **视频收藏:** 添加列表模式支持并优化数据获取逻辑 ([06310ba](https://github.com/wood3n/biu/commit/06310ba))
- **列表模式:** 优化收藏夹列表加载逻辑，支持无限下拉分页 ([04a52de](https://github.com/wood3n/biu/commit/04a52de))
- **视频收藏:** 添加全部媒体到播放列表功能并优化回调函数 ([699093e](https://github.com/wood3n/biu/commit/699093e))
- **媒体显示:** 添加卡片和列表两种显示模式 test:目前只在我创建的收藏夹中使用 添加 displayMode 设置选项，支持在卡片和列表两种显示模式间切换 创建 MediaItem 组件统一处理不同显示模式的渲染逻辑 更新收藏页面以支持新的显示模式 ([8cf52f3](https://github.com/wood3n/biu/commit/8cf52f3))
- **media-item:** 替换MVCard为MediaItem组件并支持显示模式切换 ([1a3d868](https://github.com/wood3n/biu/commit/1a3d868))
- **视频收藏:** 添加列表模式支持并优化数据获取逻辑 ([540528d](https://github.com/wood3n/biu/commit/540528d))
- **列表模式:** 优化收藏夹列表加载逻辑，支持无限下拉分页 ([bd18333](https://github.com/wood3n/biu/commit/bd18333))
- **视频收藏:** 添加全部媒体到播放列表功能并优化回调函数 ([b664d52](https://github.com/wood3n/biu/commit/b664d52))
- **用户资料:** 添加视频合集列表的列表视图模式 ([5b4da03](https://github.com/wood3n/biu/commit/5b4da03))
- **收藏夹:** 实现收藏夹资源搜索、排序和分页功能 ([02a243f](https://github.com/wood3n/biu/commit/02a243f))
- **用户资料:** 添加视频搜索和排序功能 ([8fc6a10](https://github.com/wood3n/biu/commit/8fc6a10))
- 补充检测ffmpeg提示 ([ea4ff22](https://github.com/wood3n/biu/commit/ea4ff22))
- **视频合集:** 添加搜索和排序功能 ([4f8d04e](https://github.com/wood3n/biu/commit/4f8d04e))
- 补充ffmpeg系统路径设置项 ([720a8dc](https://github.com/wood3n/biu/commit/720a8dc))

### 🩹 修复问题

- 修复大量收藏夹选择时弹窗样式问题 ([cda9bc0](https://github.com/wood3n/biu/commit/cda9bc0))
- 移除无用的ipc模块 ([e5f90b2](https://github.com/wood3n/biu/commit/e5f90b2))
- 修复列表样式问题 ([5436ec7](https://github.com/wood3n/biu/commit/5436ec7))
- 修复lint和review问题 ([3d4dea3](https://github.com/wood3n/biu/commit/3d4dea3))
- **视频合集): 收藏合集从多页码切换单页码的场景数据加载异常 feat(视频合集:** 列表模式添加分页功能以提升性能 ([94f05f0](https://github.com/wood3n/biu/commit/94f05f0))
- **video-series:** 修复切换合集时短暂显示上一个合集数据的问题 ([0748806](https://github.com/wood3n/biu/commit/0748806))
- **video-series:** 修复搜索参数变化时未重置页码的问题 ([7bb39bb](https://github.com/wood3n/biu/commit/7bb39bb))
- 修复播放进度恢复问题 ([e852ebc](https://github.com/wood3n/biu/commit/e852ebc))
- 修复下载记录按钮显示状态 ([a726b27](https://github.com/wood3n/biu/commit/a726b27))

### 💅 Refactors

- **media-item:** 简化显示模式的条件判断逻辑 ([ff373cb](https://github.com/wood3n/biu/commit/ff373cb))
- **media-item:** 简化显示模式的条件判断逻辑 ([6cbc71d](https://github.com/wood3n/biu/commit/6cbc71d))
- Download ([b70b793](https://github.com/wood3n/biu/commit/b70b793))
- Download ([3a42ef2](https://github.com/wood3n/biu/commit/3a42ef2))
- Download ([269420b](https://github.com/wood3n/biu/commit/269420b))
- Download ([f61cc99](https://github.com/wood3n/biu/commit/f61cc99))
- Download ([b7d2052](https://github.com/wood3n/biu/commit/b7d2052))
- Download ([3419cbb](https://github.com/wood3n/biu/commit/3419cbb))

### 🏡 Chore

- Update renovate config ([9f734c0](https://github.com/wood3n/biu/commit/9f734c0))

### ❤️ Contributors

- Wood3n
- Tang Wentao
- Oxyg3n

## v1.6.0-beta.8

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.7...v1.6.0-beta.8)

### 🚀 新功能

- **组件MVCard:** 为MV卡片添加播放量显示功能 close#80 在多个页面组件中添加playCount属性，并实现播放量格式化显示 新增数字格式化工具函数，支持亿/万单位转换 ([#80](https://github.com/wood3n/biu/issues/80))
- **音量控制:** 添加鼠标滚轮调整音量功能 ([dadf5df](https://github.com/wood3n/biu/commit/dadf5df))
- 补充密码和短信登录功能 ([c2a2203](https://github.com/wood3n/biu/commit/c2a2203))
- **托盘菜单:** 添加播放控制和窗口显示功能 ([f37a29b](https://github.com/wood3n/biu/commit/f37a29b))
- **托盘菜单:** 添加播放控制和窗口显示功能 ([e9ee09e](https://github.com/wood3n/biu/commit/e9ee09e))
- 分集视频支持搜索 ([025cd52](https://github.com/wood3n/biu/commit/025cd52))

### 🩹 修复问题

- **mv-card:** 仅在 playCount 存在时显示播放计数 ([1253827](https://github.com/wood3n/biu/commit/1253827))
- **mv-card:** 修复播放次数为null时显示异常的问题 ([98f9e3e](https://github.com/wood3n/biu/commit/98f9e3e))
- 修复mini播放器空状态显示问题 ([e5e3ae0](https://github.com/wood3n/biu/commit/e5e3ae0))
- 修复mini播放器状态同步问题 ([142e45b](https://github.com/wood3n/biu/commit/142e45b))
- 完善密码登录和短信登录功能 ([a3d96dd](https://github.com/wood3n/biu/commit/a3d96dd))
- 鼠标滚轮调节音量功能增强 ([009946d](https://github.com/wood3n/biu/commit/009946d))
- 修复搜索切换tab没有重置数据导致key重复的问题 ([d7303f3](https://github.com/wood3n/biu/commit/d7303f3))

### 💅 Refactors

- **视频卡片:** 统一播放次数属性为playCount ([6672fb7](https://github.com/wood3n/biu/commit/6672fb7))
- 移除设置鼠标滚轮调整音量的功能，改为默认支持 ([3fd7107](https://github.com/wood3n/biu/commit/3fd7107))
- **utils:** 使用 Intl.NumberFormat 替换数字格式化函数 ([658aaaf](https://github.com/wood3n/biu/commit/658aaaf))

### ❤️ Contributors

- Wood3n
- Hope
- Oxyg3n
- Tang Wentao

## v1.6.0-beta.7

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.6...v1.6.0-beta.7)

### 🚀 新功能

- 设置页面新增菜单设置功能 ([3da7d1e](https://github.com/wood3n/biu/commit/3da7d1e))
- **组件:** 添加全选复选框组组件并应用于菜单设置 ([5455a05](https://github.com/wood3n/biu/commit/5455a05))

### 🩹 修复问题

- 回滚1.6.0-beta.6发版错误 ([55a8d5c](https://github.com/wood3n/biu/commit/55a8d5c))
- 修复windows打包问题 ([853a3e9](https://github.com/wood3n/biu/commit/853a3e9))
- **我收藏的收藏夹:** 修复我收藏的收藏夹显示已失效的bug，将getFavFolderCollectedList的pn从999改为50，并实现我收藏的收藏夹列表加载更多数据的功能 ([1dad2f9](https://github.com/wood3n/biu/commit/1dad2f9))
- Fix review problem ([ffae6e1](https://github.com/wood3n/biu/commit/ffae6e1))
- **layout:** 修复收藏夹列表显示问题并添加加载更多功能 Closes #100 - 修复收藏夹列表无法显示完整的问题 - 添加分页状态管理 - 实现数据追加功能 - 根据has_more状态显示"显示剩余X个"文字提示 ([#100](https://github.com/wood3n/biu/issues/100))
- 移除trace自动生成的文件 ([0fa5bd9](https://github.com/wood3n/biu/commit/0fa5bd9))
- 补充merge丢失的样式 ([4163ff6](https://github.com/wood3n/biu/commit/4163ff6))
- Mac自动安装改为打开下载目录 ([09c0d32](https://github.com/wood3n/biu/commit/09c0d32))
- Fix system default font value ([cff5770](https://github.com/wood3n/biu/commit/cff5770))
- Fix review problem ([dc660c2](https://github.com/wood3n/biu/commit/dc660c2))

### 💅 Refactors

- 重构播放列表功能 ([690a10b](https://github.com/wood3n/biu/commit/690a10b))
- Add virtual list component ([4903cc9](https://github.com/wood3n/biu/commit/4903cc9))
- **组件:** 移除未使用的React导入并删除废弃文档 ([6126b0d](https://github.com/wood3n/biu/commit/6126b0d))

### 📦 Build

- 修改安装包名称 ([d9b8a0c](https://github.com/wood3n/biu/commit/d9b8a0c))
- 修改windows打包配置 ([54aeb5d](https://github.com/wood3n/biu/commit/54aeb5d))

### 🏡 Chore

- **release:** V1.6.0-beta.6 ([b1ca69b](https://github.com/wood3n/biu/commit/b1ca69b))
- **release:** V1.6.0-beta.6 ([247a595](https://github.com/wood3n/biu/commit/247a595))

### 🎨 UI 调整

- 优化macos图标显示 ([10e92d5](https://github.com/wood3n/biu/commit/10e92d5))
- 优化播放列表显示，区分当前播放和其他列表歌曲 ([e6682cd](https://github.com/wood3n/biu/commit/e6682cd))

### 🤖 CI

- 修改打包镜像 ([942fcc4](https://github.com/wood3n/biu/commit/942fcc4))
- 修改打包镜像配置和release提交latest问题修复 ([d8d5b2c](https://github.com/wood3n/biu/commit/d8d5b2c))
- 修改打包镜像配置 ([1808df7](https://github.com/wood3n/biu/commit/1808df7))
- Fix steps name ([a6ea9ce](https://github.com/wood3n/biu/commit/a6ea9ce))
- Fix release edit problem ([25ed792](https://github.com/wood3n/biu/commit/25ed792))

### ❤️ Contributors

- Tang Wentao
- Wood3n
- Oxyg3n

## v1.6.0-beta.6

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.5...v1.6.0-beta.6)

### 🚀 新功能

- 设置页面新增菜单设置功能 ([3da7d1e](https://github.com/wood3n/biu/commit/3da7d1e))

### 🩹 修复问题

- 回滚1.6.0-beta.6发版错误 ([55a8d5c](https://github.com/wood3n/biu/commit/55a8d5c))
- 修复windows打包问题 ([853a3e9](https://github.com/wood3n/biu/commit/853a3e9))
- Fix review problem ([ffae6e1](https://github.com/wood3n/biu/commit/ffae6e1))
- **layout:** 修复收藏夹列表显示问题并添加加载更多功能 Closes #100 - 修复收藏夹列表无法显示完整的问题 - 添加分页状态管理 - 实现数据追加功能 - 根据has_more状态显示"显示剩余X个"文字提示 ([#100](https://github.com/wood3n/biu/issues/100))
- 移除trace自动生成的文件 ([0fa5bd9](https://github.com/wood3n/biu/commit/0fa5bd9))
- 补充merge丢失的样式 ([4163ff6](https://github.com/wood3n/biu/commit/4163ff6))

### 💅 Refactors

- 重构播放列表功能 ([690a10b](https://github.com/wood3n/biu/commit/690a10b))
- Add virtual list component ([4903cc9](https://github.com/wood3n/biu/commit/4903cc9))

### 📦 Build

- 修改构建发包错误的问题 ([ee2b7e8](https://github.com/wood3n/biu/commit/ee2b7e8))
- 修改electron针对不同平台的打包配置和release流程 ([8403da0](https://github.com/wood3n/biu/commit/8403da0))
- 修改pr-test-build镜像配置 ([1f2f643](https://github.com/wood3n/biu/commit/1f2f643))
- 修改ci镜像配置 ([95587c4](https://github.com/wood3n/biu/commit/95587c4))
- 修改knip ci配置 ([736d8de](https://github.com/wood3n/biu/commit/736d8de))
- 修改安装包名称 ([d9b8a0c](https://github.com/wood3n/biu/commit/d9b8a0c))
- 修改windows打包配置 ([54aeb5d](https://github.com/wood3n/biu/commit/54aeb5d))

### 🏡 Chore

- **release:** V1.6.0-beta.6 ([45dd137](https://github.com/wood3n/biu/commit/45dd137))
- **release:** V1.6.0-beta.6 ([b1ca69b](https://github.com/wood3n/biu/commit/b1ca69b))

### 🎨 UI 调整

- 优化macos图标显示 ([10e92d5](https://github.com/wood3n/biu/commit/10e92d5))
- 优化播放列表显示，区分当前播放和其他列表歌曲 ([e6682cd](https://github.com/wood3n/biu/commit/e6682cd))

### 🤖 CI

- 增加knip输出信息 ([24ca7e8](https://github.com/wood3n/biu/commit/24ca7e8))
- Add ubuntu arm64 config ([d83fcc3](https://github.com/wood3n/biu/commit/d83fcc3))
- Add ubuntu arm64 config ([5071c4a](https://github.com/wood3n/biu/commit/5071c4a))
- Remove useless note ([b48e312](https://github.com/wood3n/biu/commit/b48e312))
- 修改打包镜像 ([942fcc4](https://github.com/wood3n/biu/commit/942fcc4))
- 修改打包镜像配置和release提交latest问题修复 ([d8d5b2c](https://github.com/wood3n/biu/commit/d8d5b2c))
- 修改打包镜像配置 ([1808df7](https://github.com/wood3n/biu/commit/1808df7))
- Fix steps name ([a6ea9ce](https://github.com/wood3n/biu/commit/a6ea9ce))
- Fix release edit problem ([25ed792](https://github.com/wood3n/biu/commit/25ed792))

### ❤️ Contributors

- Wood3n
- Tang Wentao
- Oxyg3n

## v1.6.0-beta.5

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.4...v1.6.0-beta.5)

### 🚀 新功能

- Add audio quality preference settings ([52b06f3](https://github.com/wood3n/biu/commit/52b06f3))

### 🔥 功能优化

- 优化检查更新功能, 增加手动检查更新按钮 ([#63](https://github.com/wood3n/biu/pull/63))

### 🩹 修复问题

- Handle next track navigation for single item playlist ([22ee09b](https://github.com/wood3n/biu/commit/22ee09b))
- Release script ([ecfc510](https://github.com/wood3n/biu/commit/ecfc510))
- Handle next track navigation for single item playlist" ([2ca8842](https://github.com/wood3n/biu/commit/2ca8842))
- Correct audio quality sort order for unknown IDs ([42f8b30](https://github.com/wood3n/biu/commit/42f8b30))
- Prefer higher quality track when selecting medium quality ([fa0f90c](https://github.com/wood3n/biu/commit/fa0f90c))
- Apply audio quality preference when URL expires in togglePlay ([504bde8](https://github.com/wood3n/biu/commit/504bde8))
- Review problem ([f4e7c1c](https://github.com/wood3n/biu/commit/f4e7c1c))
- Fix startDownload check ([1279830](https://github.com/wood3n/biu/commit/1279830))

### ✅ Tests

- Fix test version ([c17a345](https://github.com/wood3n/biu/commit/c17a345))

### 🎨 UI 调整

- Improve audio quality settings UI display ([06eb971](https://github.com/wood3n/biu/commit/06eb971))

### ❤️ Contributors

- Oxyg3n
- Wood3n
- Xfly

## v1.6.0-beta.4

[compare changes](https://github.com/wood3n/biu/compare/v1.6.0-beta.3...v1.6.0-beta.4)

### 🚀 新功能

- 补充macos dock右键菜单 ([1d54ef9](https://github.com/wood3n/biu/commit/1d54ef9))

### 🩹 修复问题

- 优化cookie注入的逻辑和user store的使用 ([5e713af](https://github.com/wood3n/biu/commit/5e713af))
- Knip ci config ([a8e2d38](https://github.com/wood3n/biu/commit/a8e2d38))
- Review problem ([bc96515](https://github.com/wood3n/biu/commit/bc96515))
- 修复csrf token校验问题 ([c900d45](https://github.com/wood3n/biu/commit/c900d45))
- 补充cookie刷新检测频率 ([e778708](https://github.com/wood3n/biu/commit/e778708))
- 补充点击视频切换播放检测 ([d3497e9](https://github.com/wood3n/biu/commit/d3497e9))
- 补充切换播放url可用检测 ([f5fcd46](https://github.com/wood3n/biu/commit/f5fcd46))
- 修改macos窗口按钮和icon显示 ([d20f0d2](https://github.com/wood3n/biu/commit/d20f0d2))
- Knip version ([3c1f8fb](https://github.com/wood3n/biu/commit/3c1f8fb))
- Remove useless file ([ade08c0](https://github.com/wood3n/biu/commit/ade08c0))

### 📖 Documentation

- Readme perf ([6fd2ab3](https://github.com/wood3n/biu/commit/6fd2ab3))

### 🎨 UI 调整

- 调整windows和linux右上角窗口按钮 ([8292041](https://github.com/wood3n/biu/commit/8292041))

### ❤️ Contributors

- Wood3n <wangkka1@163.com>

## v1.6.0-beta.3

[compare changes](https://github.com/wood3n/biu/compare/v1.5.3-beta.1...v1.6.0-beta.3)

### 🚀 Enhancements

- 补充自动检测应用版本更新功能 ([f0652d8](https://github.com/wood3n/biu/commit/f0652d8))
- 添加 mini 播放器功能 ([8643934](https://github.com/wood3n/biu/commit/8643934))
- Add history page and optimize playback logic ([50fd57f](https://github.com/wood3n/biu/commit/50fd57f))
- 添加 mini-player 播放模式按钮并重命名同步模块 ([0f220ed](https://github.com/wood3n/biu/commit/0f220ed))
- Add audio waveform visualization feature ([d244e18](https://github.com/wood3n/biu/commit/d244e18))

### 🩹 Fixes

- 修改打包配置，修复音频跳转问题 ([3c74a0e](https://github.com/wood3n/biu/commit/3c74a0e))
- Remove useless exports ([9be3a18](https://github.com/wood3n/biu/commit/9be3a18))
- **layout:** 修改分辨率兼容问题 ([#13](https://github.com/wood3n/biu/pull/13))
- **layout:** 修改分辨率兼容问题 ([#13](https://github.com/wood3n/biu/pull/13))
- 移除无用的样式,修复搜索用户点击跳转问题 ([7abbd84](https://github.com/wood3n/biu/commit/7abbd84))
- 修改linux tray图标 ([eed09fe](https://github.com/wood3n/biu/commit/eed09fe))
- Fix favorites play all feature and optimize experience ([dea650d](https://github.com/wood3n/biu/commit/dea650d))
- 修复tray右键点击事件 ([ed6e258](https://github.com/wood3n/biu/commit/ed6e258))
- Add issues write permission to knip workflow ([07ab409](https://github.com/wood3n/biu/commit/07ab409))

### 💅 Refactors

- 删除不必要的注释 ([ae728fd](https://github.com/wood3n/biu/commit/ae728fd))
- Improve favorites play all robustness and code quality ([a9dea8b](https://github.com/wood3n/biu/commit/a9dea8b))
- Optimize history page and play queue code ([3c751d3](https://github.com/wood3n/biu/commit/3c751d3))
- 重命名 mini-player-sync 中的 channel 变量和通道名称 ([2876c7a](https://github.com/wood3n/biu/commit/2876c7a))
- Extract magic number and improve error handling ([8d29f4b](https://github.com/wood3n/biu/commit/8d29f4b))
- Optimize mini player performance and UI ([628148b](https://github.com/wood3n/biu/commit/628148b))
- Improve code quality based on code review suggestions ([04eea2a](https://github.com/wood3n/biu/commit/04eea2a))
- Improve type safety in mini-player communication ([15fb360](https://github.com/wood3n/biu/commit/15fb360))

### 📖 Documentation

- Fix changelog ([db566f7](https://github.com/wood3n/biu/commit/db566f7))
- Add changelog ([536ba1a](https://github.com/wood3n/biu/commit/536ba1a))
- Fix issue_template labels ([c029b8b](https://github.com/wood3n/biu/commit/c029b8b))
- Add star history chart to README ([cb8d72c](https://github.com/wood3n/biu/commit/cb8d72c))

### 🏡 Chore

- 补充commitlint以生成更好的changelog和release-note ([b288dfb](https://github.com/wood3n/biu/commit/b288dfb))
- 补充issue和feature模板 ([7d2d487](https://github.com/wood3n/biu/commit/7d2d487))
- Fix release config ([0daae72](https://github.com/wood3n/biu/commit/0daae72))
- Fix release-it config ([2f69c1a](https://github.com/wood3n/biu/commit/2f69c1a))
- Add package tools restriction ([6fa0a0b](https://github.com/wood3n/biu/commit/6fa0a0b))
- Fix package tools restriction ([a468962](https://github.com/wood3n/biu/commit/a468962))
- Fix dependencies lock ([3933415](https://github.com/wood3n/biu/commit/3933415))
- Fix rcdoctor config ([177eecc](https://github.com/wood3n/biu/commit/177eecc))
- Fix rcdoctor config ([8d16302](https://github.com/wood3n/biu/commit/8d16302))
- Fix release-it bump problem ([8f962f5](https://github.com/wood3n/biu/commit/8f962f5))
- Add conventionalcommits deps ([2138880](https://github.com/wood3n/biu/commit/2138880))
- Fix conventionalcommits version ([2845130](https://github.com/wood3n/biu/commit/2845130))
- Release v1.6.0-beta.0 ([bc5301e](https://github.com/wood3n/biu/commit/bc5301e))
- Release v1.6.0-beta.1 ([0c1f08c](https://github.com/wood3n/biu/commit/0c1f08c))
- Release v1.6.0-beta.2 ([d875672](https://github.com/wood3n/biu/commit/d875672))
- 使用changelogen替换release-it ([1cb1c89](https://github.com/wood3n/biu/commit/1cb1c89))
- **release:** V1.6.0-beta.3 ([febd640](https://github.com/wood3n/biu/commit/febd640))
- 使用changelogen替换release-it ([c8055eb](https://github.com/wood3n/biu/commit/c8055eb))
- Remove test tag ([dd3ac1f](https://github.com/wood3n/biu/commit/dd3ac1f))
- Remove test changelog ([70e8ce9](https://github.com/wood3n/biu/commit/70e8ce9))
- Remove conventional-commits version overrides ([4a51326](https://github.com/wood3n/biu/commit/4a51326))
- Fix lock file ([529b562](https://github.com/wood3n/biu/commit/529b562))

### 🎨 Styles

- 一些细节调整 ([c84623b](https://github.com/wood3n/biu/commit/c84623b))

### 🤖 CI

- Add pr test check ([8565ed6](https://github.com/wood3n/biu/commit/8565ed6))
- Add CODEOWNERS ([329c51c](https://github.com/wood3n/biu/commit/329c51c))
- Fix pr test build config ([0fbd189](https://github.com/wood3n/biu/commit/0fbd189))
- Add rsdoctor check ([cde514c](https://github.com/wood3n/biu/commit/cde514c))
- Fix pr test build config ([0bdc11e](https://github.com/wood3n/biu/commit/0bdc11e))
- Fix knip cli ([f9c0ddb](https://github.com/wood3n/biu/commit/f9c0ddb))
- Add knip check reporter ([264c1f8](https://github.com/wood3n/biu/commit/264c1f8))
- Add pr build gate check ([c81615b](https://github.com/wood3n/biu/commit/c81615b))
- Remove knip githubactions reporter ([61e2328](https://github.com/wood3n/biu/commit/61e2328))
- Fix knip ci deps install problem ([0ec9bb7](https://github.com/wood3n/biu/commit/0ec9bb7))
- Fix knip ci deps install problem ([c74cd8c](https://github.com/wood3n/biu/commit/c74cd8c))
- Use Codex/knip-reporter ([beec5ca](https://github.com/wood3n/biu/commit/beec5ca))
- Update knip config ([107d331](https://github.com/wood3n/biu/commit/107d331))
- Add eslint review and fix web analysis ([bfcc37b](https://github.com/wood3n/biu/commit/bfcc37b))
- Add file change filter in pr-test-build ([2b6c5bc](https://github.com/wood3n/biu/commit/2b6c5bc))
- Fix problem ([f7532e4](https://github.com/wood3n/biu/commit/f7532e4))
- Add web analysis run condition ([be48630](https://github.com/wood3n/biu/commit/be48630))
- Config renovate ([d5b6f78](https://github.com/wood3n/biu/commit/d5b6f78))
- Config renovate add ignore package ([19bcf39](https://github.com/wood3n/biu/commit/19bcf39))
- Fix build-gate be skiped ([370d468](https://github.com/wood3n/biu/commit/370d468))
- 修改knip实现 ([aff36ee](https://github.com/wood3n/biu/commit/aff36ee))
- 修改knip comment配置 ([fe25e7d](https://github.com/wood3n/biu/commit/fe25e7d))
- 补充knip权限 ([7edcfb8](https://github.com/wood3n/biu/commit/7edcfb8))

### ❤️ Contributors

- Xfly <18374858141@163.com>
- Wood3n <wangkka1@163.com>
- Fly ([@flystar233](https://github.com/flystar233))

## [1.6.0-beta.2](///compare/v1.6.0-beta.1...v1.6.0-beta.2) (2025-11-30)

### Features

* 添加视频播放历史记录页面 @flystar233
* 修复播放问题(#52)

### Contributors

Thanks to [@flystar233](https://github.com/flystar233)

## [1.6.0-beta.1](///compare/v1.6.0-beta.0...v1.6.0-beta.1) (2025-11-29)

### Bug Fixes

* 修复无法全部播放收藏夹的问题 @flystar233
* 对收藏夹无效视频进行过滤 @flystar233
* 修复tray右键点击事件
* 修改linux tray图标
* 移除无用的样式,修复搜索用户点击跳转问题
* 修复分辨率兼容问题

### Contributors

Thanks to [@flystar233](https://github.com/flystar233)

## [1.6.0-beta.0](///compare/v1.5.3-beta.1...v1.6.0-beta.0) (2025-11-28)

### Features

* 补充自动检测应用版本更新功能 f0652d8

### Bug Fixes

* 修改打包配置，修复音频跳转问题 3c74a0e
* remove useless exports 9be3a18

## [1.5.3-beta.1](https://github.com/wood3n/biu/compare/v1.5.3-beta.0...v1.5.3-beta.1) (2025-11-26)

### 🩹 Fixes
* fix search and login function by @flystar233 in https://github.com/wood3n/biu/pull/10

### ♥️ New Contributors
* @flystar233 made their first contribution in https://github.com/wood3n/biu/pull/10

## [1.5.3-beta.0](https://github.com/wood3n/biu/compare/v1.5.2...v1.5.3-beta.0) (2025-11-26)

### 🩹 Fixes

* 修复登录按钮显示问题 ([b75e775](https://github.com/wood3n/biu/commit/b75e775e62596e8f042c6d0b6e35b852f8c2e5f6))

### ⚒️ Chore

* 修改版本号错误 ([3a4c9f0](https://github.com/wood3n/biu/commit/3a4c9f0d08acbafbe1065de669b694488815cbd4))

### 🤖 CI

* 修改打包CI配置 ([78e520e](https://github.com/wood3n/biu/commit/78e520eec410ae8cb4a05ae4244568d185723ebd))

## [1.5.2](https://github.com/wood3n/biu/compare/v1.5.1...v1.5.2) (2025-11-22)

### 🔥 Performance

* 优化播放列表 ([f244246](https://github.com/wood3n/biu/commit/f244246ede1346c753c32dd4ceb3caa6e490c2b4))

### 🩹 Fixes

* 修复下载文件进度显示问题 ([06b4363](https://github.com/wood3n/biu/commit/06b4363fbe44b4286d2431ef675594e4b54fe5c9))
* 修复白屏问题,移除electron main中调试代码([#3](https://github.com/wood3n/biu/issues/3)) ([fe1f3ae](https://github.com/wood3n/biu/commit/fe1f3aeca6bdac1cc5411f8cd4b6f79f211f9aad))
* 修复部分样式问题 ([c6ef3ee](https://github.com/wood3n/biu/commit/c6ef3ee2b68f383c9276a0d99571b97cc98e88ce))

## [1.5.1](https://github.com/wood3n/biu/compare/v1.5.0...v1.5.1) (2025-11-17)

### 🩹 Fixes

* 修复部分样式问题 ([3263f81](https://github.com/wood3n/biu/commit/3263f811e9451d1ee9ca95c9cc16de122f56ed66))

## [1.5.0](https://github.com/wood3n/biu/compare/v1.4.1...v1.5.0) (2025-11-17)

### 🚀 Enhancements

* 收藏夹支持播放全部功能，修复个人资料页面显示问题 ([0ce59bf](https://github.com/wood3n/biu/commit/0ce59bfc998160880d8b3e84a4be403504e6ad98))

### 🩹 Fixes

* 修复播放列表显示问题 ([b240d24](https://github.com/wood3n/biu/commit/b240d24a3775642c15a08addb5f28a9e0be677cd))

### 🎨 Styles

* 优化播放队列显示 ([9530c1d](https://github.com/wood3n/biu/commit/9530c1d4ed40f02c4b7efa03607bf2ba9ed76de9))

## [1.4.1](https://github.com/wood3n/biu/compare/v1.4.0...v1.4.1) (2025-11-14)

### 🩹 Fixes

* video card actions ([750ed04](https://github.com/wood3n/biu/commit/750ed04cd7919fbf2bef3331ecc4e58ae64590cd))

## [1.4.0](https://github.com/wood3n/biu/compare/v1.3.0...v1.4.0) (2025-11-13)

### 🚀 Enhancements

* change layout style ([20c9927](https://github.com/wood3n/biu/commit/20c99272e027348797b812a5b49d84f9bc1b0773))
* improve the download feature ([709d137](https://github.com/wood3n/biu/commit/709d1372ba331886b322d9846a00a74fe3b2e646))

### 🩹 Fixes

* download problem ([74eea60](https://github.com/wood3n/biu/commit/74eea60e3aac2359266643648a38c4c7e33cffb7))
* download problem ([0a8ea9c](https://github.com/wood3n/biu/commit/0a8ea9c83e2596ea6e6553828e88ceae2c18f5ca))
* page style ([e8dfb6f](https://github.com/wood3n/biu/commit/e8dfb6fd11d2e4da1b29465809e7b70ab7b49ec1))
* page style and dev reload ([5aa9e28](https://github.com/wood3n/biu/commit/5aa9e280a37dd83ab9f7f8f6c32ffb1b5d742c1c))
* play component lag issue ([c144a91](https://github.com/wood3n/biu/commit/c144a919e95bb9607f53ddb917650f9c2fb005cf))
* pnpm lock verion ([e06d5ae](https://github.com/wood3n/biu/commit/e06d5ae12fa8aa6e164d2a54ebcada1b803e0a74))
* request interceptor ([bde3a82](https://github.com/wood3n/biu/commit/bde3a822b277d39a7cb8366431a3bf088c746e93))
* search style problem ([3a17ce6](https://github.com/wood3n/biu/commit/3a17ce65c1efad36e1b6be9af856bfa5c9e8e77c))
* some image url ([2617511](https://github.com/wood3n/biu/commit/2617511184f40272f82c9104ee4059e57853c450))
* some page style problem ([80c8b32](https://github.com/wood3n/biu/commit/80c8b324e474d16b7208c0081cc847393dbde9a2))
* ui ([e772dc6](https://github.com/wood3n/biu/commit/e772dc6f38122d53f4ba5953eb3b4d7ddb9eea49))
* ui style ([c1c7a84](https://github.com/wood3n/biu/commit/c1c7a846fcb9ab42e8bfd1f45bc90e291a280edb))
* ui style and directory name ([09ecd5e](https://github.com/wood3n/biu/commit/09ecd5e473d4c49ee54a14ab691a8fdb5ef076f5))

### 📖 Documentation

* prettify readme ([04e08d3](https://github.com/wood3n/biu/commit/04e08d36d9763e0dafdf16a07ba343103c9e0e69))
* prettify readme ([5664267](https://github.com/wood3n/biu/commit/5664267d28adf752fb0abc9d7d9f7036c32d8df8))
* remove readme useless introduction ([2ccb700](https://github.com/wood3n/biu/commit/2ccb700599711f7060fed21e47ead80c636e7445))

## [1.3.0](https://github.com/wood3n/biu/compare/v1.2.1...v1.3.0) (2025-11-07)

### 🚀 Enhancements

* improve the download function ([72c4cc6](https://github.com/wood3n/biu/commit/72c4cc6af425355d88c868f2dda792683760f33a))

### 🩹 Fixes

* theme problem ([8436419](https://github.com/wood3n/biu/commit/84364193b92eca206eb0f46fc854bf8ac12a2337))

## [1.2.1](https://github.com/wood3n/biu/compare/v1.2.0...v1.2.1) (2025-10-22)

### 🩹 Fixes

* nav search focus problem ([dc89c86](https://github.com/wood3n/biu/commit/dc89c86cefa4e3ba93d999f932cab5dfce720295))
* theme change problem ([35d92a9](https://github.com/wood3n/biu/commit/35d92a915eae18ec6fbfd413c27f4f52d9b69f2d))

## [1.2.0](https://github.com/wood3n/biu/compare/v1.1.7...v1.2.0) (2025-10-22)

### 🚀 Enhancements

* add error boundary and feedback ([a21bfb4](https://github.com/wood3n/biu/commit/a21bfb4c0000452ffe6276c57c3e54a8d5ce6a9f))
* add theme change ([3f64f5e](https://github.com/wood3n/biu/commit/3f64f5e84a621252e7c02ea7e718d9b9b47a035f))
* electron config use typescript ([1534702](https://github.com/wood3n/biu/commit/1534702ce43f8680fe0ecd67eb318fad57cbe827))

### 🩹 Fixes

* ci problem ([b8231cb](https://github.com/wood3n/biu/commit/b8231cba131e64f80b8157fa76a3f41b15c9e66b))
* ci problem ([4ae57cf](https://github.com/wood3n/biu/commit/4ae57cf1674fa3c14cb8122bb04adbdad2265872))
* ci problem ([7a15ad9](https://github.com/wood3n/biu/commit/7a15ad9562e55c66d180b915442e46ed33e37f63))
* settings change problem ([f8ea9bd](https://github.com/wood3n/biu/commit/f8ea9bdf0bbc6d80163c98c22e1a22eeb55cd818))

## [1.1.7](https://github.com/wood3n/biu/compare/v1.1.6...v1.1.7) (2025-10-17)

### 🩹 Fixes

* fix module import problem ([ad569eb](https://github.com/wood3n/biu/commit/ad569eb0d23295c3ad79826db9b9fef492b7647b))

## [1.1.6](https://github.com/wood3n/biu/compare/v1.1.5...v1.1.6) (2025-10-17)

### ⚒️ Chore

* rename name ([20b37d4](https://github.com/wood3n/biu/commit/20b37d4510e27ab207f1a2ebb3bb184196b1b485))

## [1.1.5](https://github.com/wood3n/tune/compare/v1.1.4...v1.1.5) (2025-10-17)

### 📖 Documentation

* add readme ([ee56780](https://github.com/wood3n/tune/commit/ee56780d56d30a672fe322f88240ec410df30d35))

## [1.1.4](https://github.com/wood3n/tune/compare/v1.1.3...v1.1.4) (2025-10-17)

### 🤖 CI

* fix release ci ([c4a5e82](https://github.com/wood3n/tune/commit/c4a5e82f21a27cff158eee4ba652a10015ec710b))

## [1.1.3](https://github.com/wood3n/tune/compare/v1.1.2...v1.1.3) (2025-10-17)

### 🤖 CI

* fix release ci ([4b01252](https://github.com/wood3n/tune/commit/4b0125268883608294aa08d2b620299cca698754))

## [1.1.2](https://github.com/wood3n/tune/compare/v1.1.1...v1.1.2) (2025-10-17)

### ⚒️ Chore

* remove useless deps ([791e8d7](https://github.com/wood3n/tune/commit/791e8d7be380f5b858e8d12d8771854e871bb1bb))
* remove useless file ([45dfe08](https://github.com/wood3n/tune/commit/45dfe08425dae4e63762372ad52f745bc48318c0))

### 🤖 CI

* fix ci config ([b89a45a](https://github.com/wood3n/tune/commit/b89a45a19eccefa7762a0e112cfbdc99befbc46c))
* fix release ci ([2095f63](https://github.com/wood3n/tune/commit/2095f6364422f91b1ac8a8355ad09107c07ba536))
* fix release ci ([116510d](https://github.com/wood3n/tune/commit/116510d7db47b77dca28012881cbda3f06537488))
* fix release ci ([de91ca1](https://github.com/wood3n/tune/commit/de91ca1de4a31a882f05932675db15db93c83ccd))
* fix release ci ([91f5165](https://github.com/wood3n/tune/commit/91f516599c0202fde6230b427024b3763c73a13d))
* fix release ci ([75e9d69](https://github.com/wood3n/tune/commit/75e9d69abf110a0173f331e6b512a26c4a9f3e54))

> AI生成