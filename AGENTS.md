# AGENTS.md

This file provides guidelines for agentic coding assistants working in this repository.

## Build Commands

```bash
# Development server
npm run dev

# Production build (runs TypeScript compiler + Vite)
npm run build

# Preview production build
npm run preview
```

**Note**: This project does not have test infrastructure. No test commands available.

## Project Overview

- **Stack**: Vue 3 + TypeScript + Vite
- **UI Framework**: Element Plus (auto-imported via unplugin-vue-components)
- **State Management**: Pinia (composition API pattern)
- **Routing**: Vue Router with lazy-loaded routes
- **HTTP**: Axios with custom interceptors
- **Styling**: SCSS with scoped styles
- **Path Alias**: `@/` → `src/`

## Code Style Guidelines

### TypeScript & Configuration

- **Strict mode**: Enabled (noImplicitAny, strictNullChecks, etc.)
- **No unused locals/parameters**: Enforced
- **Target**: ES2023 for build, ESNext for app
- **Module Resolution**: Bundler mode
- **NEVER use**: `as any`, `@ts-ignore`, `@ts-expect-error`

### Component Structure

```vue
<script setup lang="ts">
// 1. Imports (explicit for custom components, auto-imported: Vue APIs, Element Plus)
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomComponent from '@/components/CustomComponent.vue'

// 2. Type definitions (interfaces inline or imported)
interface Article {
  id: number
  title: string
}

// 3. Composables/Hooks
const router = useRouter()

// 4. Reactive state
const articles = ref<Article[]>([])
const loading = ref(false)

// 5. Functions
const fetchArticles = async () => {
  // Implementation
}

// 6. Lifecycle hooks
onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <!-- Template code -->
</template>

<style scoped lang="scss">
/* Styles with SCSS */
</style>
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ArticleList.vue`, `UserProfile.vue`)
- **Variables/Functions**: camelCase (e.g., `articleList`, `fetchArticles`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces/Types**: PascalCase (e.g., `User`, `ArticleResponse`)
- **CSS classes**: kebab-case or BEM-like (e.g., `.article-card`, `.article-card__title`)

### Import Organization

```typescript
// 1. External libraries
import { ref, computed } from 'vue'
import axios from 'axios'

// 2. Internal imports (use @ alias)
import { useUserStore } from '@/stores/user'
import { getArticleList } from '@/api/article'
import Header from '@/components/Header.vue'
```

**Note**: Element Plus components and some Vue APIs are auto-imported. DO NOT explicitly import them.

### API Layer

All API calls should go through `src/api/request.ts` (axios instance with interceptors).

```typescript
// src/api/article.ts
import request from './request'

export const getArticleList = (data: {
  pageNo?: number
  pageSize?: number
}) => {
  return request({
    url: '/web/article/list',
    method: 'post',
    data
  })
}
```

**Important**:
- API base URL: `/admin-api` (configured in request.ts)
- Request interceptor adds `Authorization: Bearer <token>` header
- Response interceptor handles errors, 401 redirects to login
- Public APIs are whitelisted in `request.ts`

### Pinia Store Pattern

```typescript
// src/stores/user.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  // Actions
  const login = async (username: string, password: string) => {
    // Implementation
  }

  return {
    user,
    isLoggedIn,
    login
  }
})
```

### Error Handling

```typescript
try {
  await someApiCall()
  ElMessage.success('操作成功')
} catch (error: any) {
  ElMessage.error(error.msg || error.message || '操作失败')
}
```

Use Element Plus's `ElMessage` for user-facing notifications. The axios interceptor handles most error responses.

### Styling

- **Language**: SCSS
- **Scope**: Use `scoped` attribute for component-specific styles
- **Global**: Place shared styles in `src/styles/global.scss`
- **Naming**: Use meaningful class names with semantic naming
- **Responsive**: Mobile-first with `@media (max-width: 768px)` breakpoints

Example:
```scss
.article-card {
  padding: 20px;
  background: white;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 15px;
  }
}
```

### Route Definitions

- Use lazy loading for route components
- Add `meta: { requiresAuth: true }` for protected routes
- Route guard in `src/router/index.ts` checks authentication

```typescript
{
  path: '/profile',
  name: 'profile',
  component: () => import('@/views/Profile.vue'),
  meta: { requiresAuth: true }
}
```

### Type Safety

- Always define interfaces for API responses
- Use proper TypeScript types for props and emits
- Leverage Vue's `ref<T>()`, `computed<T>()`, etc.

```typescript
interface Article {
  id: number
  title: string
}

const articles = ref<Article[]>([])
```

## Common Patterns

### Authentication

- Token stored in `localStorage` as `ACCESS_TOKEN` (JSON format)
- User info stored in `localStorage` as `user`
- Use `useUserStore()` from `@/stores/user` for auth state
- Protected routes auto-redirect to `/login` if not authenticated

### Form Validation

Use Element Plus's built-in form validation:

```typescript
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}

await formRef.value.validate()
```

### File Upload

```typescript
const formData = new FormData()
formData.append('file', file)

return request({
  url: '/infra/file/upload',
  method: 'post',
  data: formData,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

## Notes

- No existing linter/formatter config (no ESLint, Prettier, or similar)
- No test infrastructure
- Production build includes TypeScript compilation check
- Use SCSS for all styling (no Tailwind, no CSS-in-JS)
- Element Plus is configured with `zhCn` (Chinese) locale
- Some comments are in Chinese - maintain this pattern when appropriate
