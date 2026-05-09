# 博客全站 UI 重设计规格

**日期**：2026-05-10  
**状态**：待实施

---

## 核心理念

打破传统博客"容器居中"思维，改用**全宽网格切割**。每个区域都是屏幕的一个分区，没有卡片、没有阴影、没有圆角，只有线条、色块和排版。视觉语言来自印刷杂志，不是 SaaS 产品。

---

## 风格定义

- **风格**：杂志编辑风（Editorial Magazine）
- **布局**：对角切割双版，全宽铺满，左右无留白，无居中容器
- **配色**：暖沙/深夜棕，支持深色/浅色切换
- **排版**：衬线标题 + 无衬线正文，标签全大写字间距拉开
- **装饰语言**：细线分隔、大数字编号、斜切 clip-path，无圆角无阴影无卡片

---

## 配色系统

### 深色模式（默认）

| 用途 | 色值 |
|------|------|
| 主背景 | `#120a02` |
| 次级背景 | `#0e0802` |
| 底部横条背景 | `#0a0602` |
| 主文字 | `#f0e0c0` |
| 次级文字 | `#8a6030` |
| 弱文字/元信息 | `#4a2a08` |
| 强调色 | `#c8860a`（琥珀金）|
| 分割线 | `#2a1a08` |
| 大数字装饰色 | `#2a1a08` |

### 浅色模式

| 用途 | 色值 |
|------|------|
| 主背景 | `#f5f0e8` |
| 次级背景 | `#faf7f2` |
| 底部横条背景 | `#f0e8d8` |
| 主文字 | `#1a0e04` |
| 次级文字 | `#8a6840` |
| 弱文字/元信息 | `#b09060` |
| 强调色 | `#a06010`（烤焦橙）|
| 分割线 | `#e0d0b8` |
| 大数字装饰色 | `#e0d0b8` |

### 强调色使用规则

强调色**只用于**：标签文字（LATEST、POPULAR 等）、标题中的强调词、细线装饰。不做背景色块，不做按钮填充色。

---

## 字体系统

| 用途 | 字体 |
|------|------|
| 大标题（Hero） | Georgia, 'Noto Serif SC', serif |
| 导航/标签 | monospace，全大写，letter-spacing: 3-4px |
| 正文 | -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif |
| 大数字编号 | Georgia, serif，28-64px，装饰色弱化 |

---

## 页面布局规格

### 全站通用：导航栏

- 全宽，`padding: 20px 32px`，底部 `1px` 细线
- 左：LOGO 衬线大字（`font-size: 20px`, `letter-spacing: 3px`, `font-weight: 900`）
- 右：导航链接（`font-size: 11px`, `letter-spacing: 2px`）+ 深浅切换按钮

### 首页

主区域 `grid-template-columns: 55% 45%`，高度 `460px`：

- **左侧**：`clip-path: polygon(0 0, 100% 0, 88% 100%, 0 100%)`，期号 + 大标题 + 强调色细线 + 摘要
- **右侧**：三个文章区块，`1px` 细线横向分隔，分别展示 LATEST / POPULAR / TAGS
- **底部四列**：`grid-template-columns: repeat(4, 1fr)`，大数字编号 + 标题 + 日期，列间细线分隔

### 文章列表页

全宽网格，无侧边栏：

- 第一行：`grid-template-columns: 2fr 1fr`，置顶文章左大右小
- 后续行：`grid-template-columns: repeat(3, 1fr)`，三列等宽
- 格子间用细线分隔，无卡片边框

### 文章详情页

- **头部（全宽）**：大标题 + 副标题 + 日期 + 分类，次级背景色
- **正文（收窄居中）**：`max-width: 720px`，`margin: 0 auto`，行高 `1.8`
- **底部（全宽）**：上一篇/下一篇，复用对角切割布局语言

### 分类/标签页

全宽横条列表，每行一个分类/标签，左侧大字名称，右侧文章数，`1px` 细线分隔行。

### 关于/友链页

`grid-template-columns: 1fr 1fr`，左文右内容，细线分隔。

### 说说/留言页

全宽时间轴：左侧竖线，节点圆点，最新节点强调色高亮，内容向右展开。

---

## 深浅模式切换实现

- CSS 变量定义在 `[data-theme="dark"]` / `[data-theme="light"]`（与现有 `theme.ts` store 一致）
- 切换修改 `<html>` 的 `data-theme` 属性
- 过渡：`transition: background-color 0.3s, color 0.3s, border-color 0.3s`

---

## 不改动的部分

- `src/api/` — API 层完全不动
- `src/router/` — 路由结构完全不动
- `src/stores/` — Pinia stores 完全不动
- 最新文章接口逻辑不动
- Element Plus 保留，覆盖默认样式以匹配新设计

---

## 实施文件清单

1. `src/styles/global.scss` — CSS 变量、全局排版、深浅主题
2. `src/components/Header.vue` — 导航栏重写
3. `src/components/Footer.vue` — 页脚重写
4. `src/views/Home.vue` — 首页对角切割布局
5. `src/views/ArticleList.vue` — 文章列表全宽网格
6. `src/views/ArticleDetail.vue` — 详情页混合布局
7. `src/views/Category.vue` — 分类页横条列表
8. `src/views/Tag.vue` + `src/views/TagArticles.vue` — 标签页横条列表
9. `src/views/About.vue` — 关于页双栏
10. `src/views/Link.vue` — 友链页双栏
11. `src/views/Talk.vue` — 说说时间轴
12. `src/views/Guestbook.vue` — 留言时间轴
13. `src/views/Favorites.vue` — 收藏页（横条列表）
14. `src/views/Profile.vue` — 个人资料页
