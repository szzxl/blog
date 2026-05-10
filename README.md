# Time Blog - 个人博客前端

> 基于 Vue 3 + TypeScript + Vite 构建的现代化博客系统

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF.svg)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.14-409EFF.svg)](https://element-plus.org/)

## 特性

- **主题切换** - 支持浅色/深色/自动三种主题模式，跟随系统偏好
- **表情包支持** - 评论系统集成 500+ 表情符号
- **性能优化** - 代码分割、懒加载、三级缓存（内存/localStorage/sessionStorage）
- **安全防护** - XSS 防护、CSRF Token、输入验证、请求数据清理
- **响应式设计** - 适配 PC 和移动端
- **骨架屏** - 加载态骨架屏，提升感知性能

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 <http://localhost:80>（开发服务器代理 `/admin-api` → `localhost:48080`）

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 技术栈

### 核心框架

| 库 | 版本 | 用途 |
|----|------|------|
| Vue | 3.5 | 渐进式 JavaScript 框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 6.4 | 构建工具 |
| Element Plus | 2.14 | UI 组件库 |
| Pinia | 3.0 | 状态管理 |
| Vue Router | 4.6 | 客户端路由 |
| Axios | 1.16 | HTTP 客户端 |
| Day.js | 1.11 | 日期处理 |
| @vueuse/core | 14.3 | 组合式 API 工具集 |
| SCSS | - | CSS 预处理器 |

## 项目结构

```text
time-blog-web/
├── public/
│   └── images/
├── src/
│   ├── api/
│   │   ├── article.ts          # 所有 API 接口（auth、文章、评论、说说、相册等）
│   │   └── request.ts          # Axios 实例，含拦截器、XSS 清理、401 处理
│   ├── components/
│   │   ├── Carousel.vue        # 轮播图
│   │   ├── Comment.vue         # 评论组件
│   │   ├── EmojiPicker.vue     # 表情选择器
│   │   ├── ErrorBoundary.vue   # 错误边界
│   │   ├── Footer.vue
│   │   ├── Header.vue
│   │   └── Skeleton.vue        # 骨架屏
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── index.ts            # Pinia 实例
│   │   ├── theme.ts            # 主题状态（light/dark/auto）
│   │   └── user.ts             # 用户状态，含 localStorage 恢复
│   ├── styles/
│   │   └── global.scss         # CSS 变量、主题定义
│   ├── utils/
│   │   ├── cache.ts            # 三级缓存（内存 TTL → localStorage → sessionStorage）
│   │   ├── format.ts           # 格式化工具
│   │   ├── loading.ts          # 全局 Loading 管理
│   │   ├── security.ts         # XSS/CSRF/URL 防护工具
│   │   ├── token.ts            # Token 解析（parseToken）
│   │   └── websiteConfig.ts    # 网站配置，三级缓存读取
│   ├── views/
│   │   ├── Home.vue
│   │   ├── ArticleList.vue
│   │   ├── ArticleDetail.vue
│   │   ├── Category.vue
│   │   ├── Tag.vue
│   │   ├── TagArticles.vue
│   │   ├── Talk.vue
│   │   ├── Album.vue
│   │   ├── Guestbook.vue
│   │   ├── Link.vue
│   │   ├── About.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Profile.vue
│   │   └── Favorites.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 核心功能

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
- 个人中心（资料修改、头像上传、密码修改）
- 收藏夹、点赞记录

### 主题系统

- 浅色 / 深色 / 自动模式
- CSS 自定义属性驱动，`data-theme` 属性切换
- 偏好持久化（localStorage）

### 其他

- 说说动态
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
| `VITE_ADMIN_PATH` | - | 管理后台路径 |

开发环境代理配置（`vite.config.ts`）：

```typescript
proxy: {
  '/admin-api': {
    target: 'http://localhost:48080',
    changeOrigin: true
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

Vite 将 chunk 拆分为 `vue-vendor`、`element-plus`、`utils`，资源分别输出至 `js/`、`images/`、`fonts/`、`css/` 目录，生产环境通过 Terser 去除 `console`。

## 许可证

前端代码采用 [MIT License](LICENSE)。后端服务采用商业授权，不在开源范围内。

---

邮箱：<suz_zxl@126.com>

微信：Su_zxl
