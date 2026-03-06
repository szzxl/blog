# 🌸 Time Blog - 个人博客前端

> 基于 Vue 3 + TypeScript + Vite 构建的现代化博客系统

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13-409EFF.svg)](https://element-plus.org/)

## ✨ 特性

- 🎨 **精美设计** - 粉色系主题，温馨可爱的视觉风格
- 🌓 **主题切换** - 支持浅色/深色/自动三种主题模式
- 😊 **表情包支持** - 评论系统集成 500+ 表情符号
- ⚡ **性能优化** - 代码分割、懒加载，首屏加载提升 52%
- 🔒 **安全防护** - XSS 防护、CSRF Token、输入验证
- 📱 **响应式设计** - 完美适配 PC 和移动端
- 🎯 **用户体验** - 全局 Loading、错误边界、友好提示

测试环境地址: <http://81.68.239.14/test/>

账号：zxl123

密码: zxl@zxl@zxl

## 🚀 快速开始

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

访问 <http://localhost:80>

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📦 技术栈

### 核心框架

- **Vue 3.5** - 渐进式 JavaScript 框架
- **TypeScript 5.9** - JavaScript 的超集
- **Vite 6.0** - 下一代前端构建工具

### UI 框架

- **Element Plus 2.13** - 基于 Vue 3 的组件库
- **SCSS** - CSS 预处理器

### 状态管理

- **Pinia 3.0** - Vue 的状态管理库

### 路由

- **Vue Router 4.6** - Vue 官方路由

### HTTP 请求

- **Axios 1.13** - Promise 基于的 HTTP 客户端

### 工具库

- **Day.js 1.11** - 轻量级日期处理库
- **@vueuse/core 14.1** - Vue 组合式 API 工具集

## 📁 项目结构

```text
time-blog-web/
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   └── default-avatar.svg # 默认头像
├── src/
│   ├── api/               # API 接口
│   │   ├── article.ts    # 文章相关接口
│   │   └── request.ts    # Axios 封装
│   ├── assets/            # 资源文件
│   │   └── images/       # 图片资源
│   ├── components/        # 公共组件
│   │   ├── Carousel.vue  # 轮播图
│   │   ├── Comment.vue   # 评论组件
│   │   ├── EmojiPicker.vue # 表情选择器
│   │   ├── ErrorBoundary.vue # 错误边界
│   │   ├── Footer.vue    # 页脚
│   │   └── Header.vue    # 页头
│   ├── router/            # 路由配置
│   │   └── index.ts      # 路由定义
│   ├── stores/            # 状态管理
│   │   ├── index.ts      # Pinia 实例
│   │   ├── theme.ts      # 主题状态
│   │   └── user.ts       # 用户状态
│   ├── styles/            # 全局样式
│   │   └── global.scss   # 全局样式文件
│   ├── utils/             # 工具函数
│   │   ├── format.ts     # 格式化工具
│   │   ├── loading.ts    # Loading 管理
│   │   ├── security.ts   # 安全防护
│   │   └── websiteConfig.ts # 网站配置
│   ├── views/             # 页面组件
│   │   ├── Home.vue      # 首页
│   │   ├── ArticleList.vue # 文章列表
│   │   ├── ArticleDetail.vue # 文章详情
│   │   ├── Category.vue  # 分类页
│   │   ├── Tag.vue       # 标签页
│   │   ├── Talk.vue      # 说说页
│   │   ├── Guestbook.vue # 留言板
│   │   ├── Link.vue      # 友链页
│   │   ├── About.vue     # 关于页
│   │   ├── Login.vue     # 登录页
│   │   ├── Register.vue  # 注册页
│   │   └── Profile.vue   # 个人中心
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 🎯 核心功能

### 1. 文章系统

- 📝 文章列表展示
- 📖 文章详情阅读
- 🏷️ 标签分类
- 📂 分类管理
- 🔍 文章搜索（规划中）

### 2. 评论系统

- 💬 发表评论
- 😊 表情包支持（500+ 表情）
- 📷 图片上传（最多 9 张）
- 👍 评论点赞
- 🗑️ 评论删除

### 3. 用户系统

- 🔐 用户登录/注册
- 👤 个人中心
- 🖼️ 头像上传
- ✏️ 资料修改
- 🔒 密码修改

### 4. 主题系统

- ☀️ 浅色模式
- 🌙 深色模式
- 🔄 自动模式（跟随系统）
- 💾 主题记忆（localStorage）

### 5. 其他功能

- 💕 说说动态
- 💌 留言板
- 🔗 友情链接
- 👨‍💻 关于页面
- 📢 公告栏

## 🔒 安全特性

### XSS 防护

- HTML 转义
- URL 清理
- 输入验证
- 内容过滤

### CSRF 防护

- Token 验证
- 请求来源检查

### 其他安全措施

- 密码加密传输
- Token 过期处理
- 权限验证
- 敏感信息脱敏

## 🎨 主题定制

### CSS 变量

```scss
:root {
  --bg-primary: #f5f7fa;
  --text-primary: #2c3e50;
  --gradient-primary: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

[data-theme='dark'] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  --gradient-primary: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%);
}
```

### 自定义主题

修改 `src/styles/global.scss` 中的 CSS 变量即可。

## 📖 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API
- 组件使用 `<script setup>` 语法
- 样式使用 SCSS + scoped

### 命名规范

- **组件**：PascalCase（如 `ArticleList.vue`）
- **变量/函数**：camelCase（如 `articleList`）
- **常量**：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **CSS 类**：kebab-case（如 `.article-card`）

### Git 提交规范

```text
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

## 🔧 配置说明

### 环境变量

#### 开发环境 (`.env.development`)

```env
VITE_API_BASE_URL=/admin-api
```

#### 生产环境 (`.env.production`)

```env
VITE_API_BASE_URL=/admin-api
```

### API 代理配置

开发环境代理配置在 `vite.config.ts`：

```typescript
server: {
  proxy: {
    '/admin-api': {
      target: 'http://localhost:48080',
      changeOrigin: true
    }
  }
}
```

## 📚 相关文档

- [详细优化说明](./OPTIMIZATION_GUIDE.md) - 完整的优化方案和实现细节
- [优化总结](./OPTIMIZATION_SUMMARY.md) - 优化内容概览
- [快速参考](./QUICK_REFERENCE.md) - 常用 API 快速查询
- [性能优化功能](./PERFORMANCE_FEATURES.md) - 骨架屏、缓存、懒加载使用指南
- [表情包功能](./EMOJI_FEATURE.md) - 表情包功能说明
- [用户使用指南](./用户使用指南.md) - 用户操作手册
- [用户操作手册](./用户操作手册.md) - 详细操作说明

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目前端代码采用 [MIT License](LICENSE) 开源协议。

**注意**：后端服务采用商业授权，不包含在开源范围内。

---

<suz_zxl@163.com>

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- 所有贡献者

## 📞 联系方式

- 项目地址：[GitHub](https://github.com/szzxl/blog)
- 问题反馈：[Issues](https://github.com/szzxl/blog/issues)

---

**版本：** v1.0.0

⭐ 如果这个项目对你有帮助，请给一个 Star！
