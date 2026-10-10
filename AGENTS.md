# Repository Guidelines

## 项目结构与模块组织

本仓库是基于 Vue 3、TypeScript、Vite、Pinia 和 Element Plus 的博客前端，后端服务独立维护。

博客前端目录为 `F:\gitea\time-blog-web`，后端目录为 `F:\gitea\blog-backstage`，管理后台目录为 `F:\gitea\time-blog-admin-web`。三者位于独立目录；跨项目开发时分别进入对应目录执行命令，并先读取该目录适用的 `AGENTS.md`。

- `src/views/` 存放路由页面，`src/components/` 存放复用组件。
- `src/api/article.ts` 集中定义各业务接口，`src/api/request.ts` 管理 Axios 实例、认证和错误处理。
- `src/router/` 管理路由与登录守卫，`src/stores/` 管理用户和主题状态。
- `src/composables/`、`src/directives/`、`src/utils/` 存放组合式函数、指令和工具。
- `src/styles/global.scss` 定义全局样式与主题变量；`public/` 存放图片和 SVG。`dist/` 是生成目录。

## 安装、开发与构建命令

在仓库根目录执行：

- `npm ci`：根据 `package-lock.json` 安装依赖。
- `npm run dev`：启动开发服务器，配置端口为 `80`；`/admin-api` 和 `/rss` 代理至 `localhost:48080`。
- `npm run build`：执行 `vue-tsc -b` 类型检查并生成生产构建。
- `npm run preview`：本地预览已有构建产物，需要先完成构建。

## 代码风格与命名

使用两空格缩进；TypeScript 使用单引号，通常省略分号。遵循严格类型检查，组件采用 `<script setup lang="ts">`，局部样式采用 scoped SCSS。组件文件使用 PascalCase（`ArticleDetail.vue`），函数和变量使用 camelCase，常量使用 UPPER_SNAKE_CASE，CSS 类使用 kebab-case。通过 `@/` 引用 `src/` 下的模块，主题样式优先复用 CSS 变量。目前没有配置 ESLint 或 Prettier，修改时保持相邻代码风格。

## 架构与维护要点

以下约定结合原 `CLAUDE.md` 与当前实现核对整理；历史说明与代码不一致时，以当前实现为准。

- **请求处理**：所有业务接口复用 `request.ts`。新增接口时检查 `PUBLIC_APIS`、`SILENT_APIS` 和 `NO_LOADING_APIS`；非公开接口返回 401 会清除登录存储并跳转 `/login`，公开接口不能误触发该流程。
- **认证与路由**：`ACCESS_TOKEN` 使用 `{ c, e, v }` 格式，`v` 是 JSON 编码的 token。请求、用户 store 和路由统一使用 `src/utils/token.ts` 的 `parseToken()`。用户 store 在创建时同步恢复本地状态，路由守卫补取缺失的用户信息；受保护页面标记 `meta.requiresAuth: true`。调整存储格式时同步检查这些入口。
- **主题与组件**：`theme.ts` 支持 light/dark/auto，通过 `<html data-theme>` 配合 `global.scss` 的 CSS 变量生效。Element Plus 按需组件及 API 由 Vite 插件自动导入，样式使用 Sass。
- **缓存**：`cache.ts` 提供内存、localStorage 和 sessionStorage 缓存工具；分类、标签接口当前内存 TTL 为 1 小时。`websiteConfig.ts` 独立使用模块内存与原始 sessionStorage，无 TTL，并合并并发请求。刷新网站配置使用 `clearWebsiteConfigCache()`，不要混用两种缓存格式。
- **内容与 SEO**：文章 HTML 在 `ArticleDetail.vue` 经 DOMPurify 清理后交给 `v-html`；请求拦截器目前不清理请求正文。新增 HTML 渲染应保留清理步骤。静态页面通过路由 `meta.title` 更新 SEO，动态页面调用 `useSeo()`。
- **构建产物**：当前分包为 `vue-core`、`vue-router`、`pinia`、`element-plus` 和 `utils`，资源按类型输出。Terser 在生产环境移除 `console` 和 `debugger`，排查问题时注意该行为。

## 验证与测试

目前没有测试目录、测试框架、`npm test` 脚本或覆盖率要求。修改后按影响范围手动验证文章浏览、登录恢复、评论、收藏和主题切换；界面变更同时检查桌面与移动端。记录复现步骤、验证结果和未验证项。需要构建验证时使用 `npm run build`。若引入自动化测试，应一并说明框架、文件命名及运行命令。

## 提交与 Pull Request

历史提交主要使用简短中文主题，例如 `文章收藏`、`替换logo`，未采用统一的 Conventional Commits 格式。新提交应明确描述功能与变更，避免仅写“优化”。保持单次提交范围集中。Pull Request 应说明问题、解决方式、验证结果及配置影响；有关联 issue 时附链接，界面变更附截图。

## 配置与代理协作规则

`.env.development` 和 `.env.production` 分别配置开发与生产环境。`VITE_API_BASE_URL` 指定请求地址，默认 `/admin-api`；`VITE_BASE_PATH` 同时控制 Vite 和 history 路由的基础路径，默认 `/`；`VITE_ADMIN_PATH` 指定管理后台路径。`VITE_*` 会暴露到浏览器，不能存放密钥。

默认使用中文沟通和编写文档。修改前读取适用的 `AGENTS.md`，保留已有及无关改动。

业务代码或构建配置修改完成后，自动运行 `npm run build`；检查通过后，自动提交本次任务相关文件，使用具体的中文提交说明。纯文档修改检查内容和空白即可，不运行构建。编译或检查失败时先修复，未解决前不提交；不顺带提交用户已有或无关改动。跨项目任务分别在各目录验证和提交，不主动运行完整测试，不自动推送或部署。

`.claude/settings*.json` 是 Claude Code 专用权限配置；本项目自动编译和提交按上述用户约定执行。
