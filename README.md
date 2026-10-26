# Time Blog - 个人博客前端

> 基于 Vue 3 + TypeScript + Vite 构建的现代化博客系统

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg)](https://vite.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.14-409EFF.svg)](https://element-plus.org/)

## 特性

### 内容与配置维护

- 首页按置顶、创建时间展示全部已发布文章；详情地址变化时重新加载正文、目录和收藏状态。
- 首页、文章列表、文章详情区分加载失败与空数据，提供重试；同一次请求失败只提示一次。
- 网站配置缓存 60 秒，页面可见时自动刷新；后台可配置运行起始时间、小程序名称与二维码。清空图片配置使用默认资源。
- 分类、标签的前台内存缓存有效期为 60 秒。
- Element Plus 按组件导入；默认封面使用 `public/default-cover.svg`，背景使用压缩后的 `public/bg-banner.jpg`。

相册公开查询使用 `/web/album/list` 和 `/web/album/photo/list`，禁用相册不展示；后端需配套发布。个人中心展示实际账号信息并提供收藏入口。

- **主题切换** - 支持浅色/深色/自动三种主题模式，跟随系统偏好
- **表情包支持** - 评论系统集成 500+ 表情符号
- **性能优化** - 代码分割、图片懒加载、分类和标签内存缓存、网站配置 sessionStorage 缓存
- **安全防护** - 文章 HTML 经 DOMPurify 清理后渲染
- **响应式设计** - 适配 PC 和移动端
- **骨架屏** - 加载态骨架屏，提升感知性能

## 快速开始

### 环境要求

- Node.js 20.19+（20.x）或 22.12 及以上，版本范围以 `package.json` 的 `engines.node` 为准
- npm（随 Node.js 安装）

当前构建使用 Vite 7.3；浏览器构建目标为 Chrome 87、Edge 88、Firefox 78、Safari 14，依赖的实际安装版本以 `package-lock.json` 为准。

### 安装依赖

```bash
npm ci
```

### 开发环境

```bash
npm run dev
```

访问 <http://localhost:80>。开发服务器将 `/admin-api` 代理至 `localhost:48080`，并将 `/rss` 重写为 `/admin-api/rss` 后代理至同一后端。

### 生产构建

```bash
npm run build
```

该命令先执行 `vue-tsc -b` 类型检查，再生成 `dist/` 生产构建产物。

### 预览构建结果

```bash
npm run preview
```

预览前需先完成生产构建；此命令不会重新构建。本地预览沿用 `vite.config.ts` 的代理配置，正式部署时需在 Web 服务器配置对应的反向代理，或设置可访问的 API 地址。

## 技术栈

### 核心框架

| 库 | 版本 | 用途 |
|----|------|------|
| Vue | 3.5 | 渐进式 JavaScript 框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 7.3 | 构建工具 |
| Element Plus | 2.14 | UI 组件库 |
| Pinia | 3.0 | 状态管理 |
| Vue Router | 4.6 | 客户端路由 |
| Axios | 1.20 | HTTP 客户端 |
| Day.js | 1.11 | 日期处理 |
| SCSS | - | CSS 预处理器 |

## 项目结构

```text
time-blog-web/
├── public/
│   ├── logo.svg
│   ├── default-cover.svg
│   ├── default-avatar.svg
│   └── bg-banner.jpg
├── src/
│   ├── api/
│   │   ├── article.ts          # 所有 API 接口（auth、文章、评论、说说、相册等）
│   │   └── request.ts          # Axios 实例，含认证、加载状态、错误提示和 401 处理
│   ├── components/
│   │   ├── Comment.vue         # 评论组件
│   │   ├── EmojiPicker.vue     # 表情选择器
│   │   ├── ErrorBoundary.vue   # 错误边界
│   │   ├── Footer.vue
│   │   ├── Header.vue
│   │   └── Skeleton.vue        # 骨架屏
│   ├── composables/
│   │   └── useSeo.ts           # 页面标题与 SEO
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── index.ts            # Pinia 实例
│   │   ├── theme.ts            # 主题状态（light/dark/auto）
│   │   └── user.ts             # 用户状态，含 localStorage 恢复
│   ├── styles/
│   │   └── global.scss         # CSS 变量、主题定义
│   ├── utils/
│   │   ├── cache.ts            # 内存 TTL 缓存与缓存键生成
│   │   ├── format.ts           # 格式化工具
│   │   ├── loading.ts          # 全局 Loading 管理
│   │   ├── token.ts            # Token 解析（parseToken）
│   │   └── websiteConfig.ts    # 网站配置，内存与 sessionStorage 缓存
│   ├── views/
│   │   ├── Home.vue
│   │   ├── ArticleList.vue
│   │   ├── ArticleDetail.vue
│   │   ├── Category.vue
│   │   ├── Tag.vue
│   │   ├── TagArticles.vue
│   │   ├── Album.vue
│   │   ├── Guestbook.vue
│   │   ├── Link.vue
│   │   ├── About.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Profile.vue
│   │   ├── Favorites.vue
│   │   ├── Tools.vue
│   │   └── NotFound.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 核心功能

### 整站访问统计

页脚展示累计浏览、今日浏览和今日访客。内容页面成功导航或刷新计入浏览次数，同一浏览器当天只计一位访客；日期按北京时间计算，统计从功能启用后开始。

后端需要先手动执行 `F:\gitea\blog-backstage\sql\20261010_blog_visit.sql`，再部署前后端。接口为 `POST /admin-api/web/visit/report` 与 `GET /admin-api/web/visit/summary`；原文章阅读量独立保留。登录、注册、个人中心、收藏和 404 页面不计数，博主仅查询统计。开发环境也正常计数，本地验证时使用未登录窗口，并确保后端已启动且已建表；统计计入当前连接后端的数据库。统计失败不影响正常阅读。

### 文章系统

- 文章列表展示（分页、分类、标签筛选）
- 文章详情阅读
- 点赞、浏览量统计

### 评论系统

- 发表评论
- 表情包（500+ 表情）
- 图片上传（最多 9 张）
- 点赞、删除

### 用户系统

- 登录 / 注册
- 个人中心展示头像、用户名、昵称和邮箱，并提供收藏入口
- 收藏夹

### 主题系统

- 浅色 / 深色 / 自动模式
- CSS 自定义属性驱动，`data-theme` 属性切换
- 偏好持久化（localStorage）

### 其他

- 留言板
- 友情链接
- 公告栏
- 相册

## 主题定制

主题通过 `src/styles/global.scss` 中的 CSS 变量控制：

```scss
[data-theme='light'] {
  --bg-primary: #f5f7fa;
  --text-primary: #2c3e50;
}

[data-theme='dark'] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
}
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_BASE_URL` | `/admin-api` | Axios baseURL |
| `VITE_BASE_PATH` | `/` | 路由 history base 及 Vite base |
| `VITE_ADMIN_PATH` | `/admin` | 博主菜单中“管理后台”入口的跳转地址 |

开发和生产配置分别位于 `.env.development` 和 `.env.production`。`VITE_*` 会暴露到浏览器，不能存放密钥。管理后台独立维护，本项目仅配置入口地址。

开发环境代理配置（`vite.config.ts`）：

```typescript
proxy: {
  '/admin-api': {
    target: 'http://localhost:48080',
    changeOrigin: true
  },
  '/rss': {
    target: 'http://localhost:48080',
    changeOrigin: true,
    rewrite: (path) => '/admin-api' + path
  }
}
```

## 开发规范

### 代码风格

- TypeScript 严格模式
- Vue 3 Composition API + `<script setup>`
- 样式使用 SCSS + scoped

### 命名约定

- **组件**：PascalCase（`ArticleList.vue`）
- **变量/函数**：camelCase（`articleList`）
- **常量**：UPPER_SNAKE_CASE（`API_BASE_URL`）
- **CSS 类**：kebab-case（`.article-card`）

## 构建产物

生产构建输出至 `dist/`。Vite 将公共依赖拆分为 `vue-core`、`vue-router`、`pinia`、`element-plus` 和 `utils`，资源分别输出至 `js/`、`images/`、`fonts/`、`css/` 等目录。Terser 移除 `debugger` 和 `console.log`、`console.debug`、`console.info` 调用，保留 `console.warn`、`console.error`。

## 许可证

前端代码采用 [MIT License](LICENSE)。后端服务采用商业授权，不在开源范围内。

---

邮箱：<suz_zxl@126.com>

微信：Su_zxl
