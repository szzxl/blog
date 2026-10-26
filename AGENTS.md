# Repository Guidelines

## 项目结构

本仓库是基于 Vue 3、TypeScript、Vite、Pinia 和 Element Plus 的博客前台；后端与管理后台在独立仓库维护。

- `src/views/`：文章、分类、标签、相册、工具等路由页面。
- `src/components/`：导航、页脚、评论及其他复用组件。
- `src/api/`：业务接口和 Axios 请求处理；`src/router/`、`src/stores/`：路由、登录和主题状态。
- `src/composables/`、`src/directives/`、`src/utils/`：组合式函数、指令及工具。
- `src/styles/global.scss`：主题与全局样式；`src/assets/`、`public/`：静态资源。
- `dist/`：生成产物，不提交。

## 开发与构建

在仓库根目录执行：

- `npm ci`：按 `package-lock.json` 安装依赖。
- `npm run dev`：启动 Vite；默认端口 `80`，`/admin-api`、`/sitemap.xml` 和 `/robots.txt` 代理到本地后端 `localhost:48080`。
- `npm run build`：执行 `vue-tsc -b` 类型检查并生成生产构建。
- `npm run preview`：预览已有构建；API 仍需单独配置可用后端。

## 代码风格与命名

使用两空格缩进、单引号，通常省略分号；保持相邻代码风格。组件采用 `<script setup lang="ts">` 和 scoped SCSS，文件名使用 PascalCase，如 `ArticleDetail.vue`；函数、变量使用 camelCase，常量使用 UPPER_SNAKE_CASE，CSS 类使用 kebab-case。通过 `@/` 引用 `src/`。保留严格类型检查，新增代码避免 `any`。目前未配置 ESLint 或 Prettier。

## 维护约定

业务请求复用 `src/api/request.ts`；新增接口时核对公开、静默及 Loading 列表。认证读取复用 `parseToken()`，受保护路由标记 `meta.requiresAuth: true`。文章 HTML 经 DOMPurify 清理后才能交给 `v-html`。主题优先使用 CSS 变量；静态页面通过路由 `meta.title` 设置 SEO，动态页面使用 `useSeo()`。调整缓存时同步检查过期和清理逻辑。

## 验证与贡献

业务代码或构建配置修改后运行 `npm run build`。当前没有 `npm test`、统一测试框架或覆盖率门槛。PR 记录验证结果与未验证项；纯文档修改检查准确性和空白即可。

提交历史包含中文主题及 `feat:`、`fix:`、`docs:` 前缀。提交说明应描述具体变更，避免仅写“优化”。保持范围集中，不覆盖或夹带无关改动。检查通过后自动提交本次任务相关文件，并推送到 `gitea`、`gitee` 和 `github` 三个远程的对应分支；纯文档修改同样执行。推送时保留远程改动，不强制推送，不自动部署。PR 说明问题、解决方式及配置影响，关联 issue，界面变更附截图或复现步骤。

## 配置与安全

通过 `.env.development`、`.env.production` 配置环境；`VITE_API_BASE_URL` 设置 API 地址，`VITE_BASE_PATH` 设置部署基础路径，`VITE_ADMIN_PATH` 设置管理后台路径。`VITE_*` 会进入浏览器产物，不能存放密钥。文档使用仓库相对路径，不提交个人目录、凭据或本地工具配置。

## 自动推送完成规则

- 用户已明确授权本项目日常修改在检查通过后自动提交并推送，无需再次询问。此项目约定是全局“默认不自动提交或推送”的例外；只有用户本次明确要求不提交或不推送时才暂停相应步骤。
- 当前 `master` 的推送目标为 `gitea/master`、`gitee/master` 和 `github/master`。其他工作分支使用对应同名远程分支，用户另有指定时按指定执行。
- 完成顺序：运行本项目要求的检查，确认只包含本次任务文件，提交前获取远程变更并安全整合，使用具体中文说明提交，普通推送到全部目标，最后通过 `git ls-remote <remote> refs/heads/<branch>` 核对远程提交与推送提交一致。
- 跨项目任务分别完成各仓库的检查、提交、推送及远程核对；最终回复列出每个项目的推送目标、提交号和结果。仅本地提交成功不算完成。
- 检查失败时先修复，不提交失败代码；推送遇到网络、凭据或无法安全整合的远程变更时明确报告未完成目标和原因，不把失败描述为成功，不强制推送，不夹带已有无关改动。
- 博客前端本地分支与公开远程可能保留不同的协作配置；同步时使用已有公开同步分支，保留公开贡献指南，核对业务代码与已验证提交一致，避免把本地专用配置发布到公开远程。
