<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="show" class="search-overlay" @click.self="close">
        <div class="search-box">

          <div class="search-header">
            <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.5-4.5"/>
            </svg>
            <input
              ref="inputRef"
              v-model="keyword"
              class="s-input"
              placeholder="搜索文章…"
              autocomplete="off"
              @keydown.escape="close"
              @keydown.enter="goFirst"
              @keydown.up.prevent="moveSelect(-1)"
              @keydown.down.prevent="moveSelect(1)"
              @input="onInput"
            />
            <kbd class="s-esc" @click="close">ESC</kbd>
          </div>

          <div class="search-body">
            <template v-if="!keyword.trim()">
              <p class="s-tip">输入关键词搜索，<kbd>↑</kbd><kbd>↓</kbd> 导航，<kbd>↵</kbd> 打开</p>
            </template>
            <template v-else-if="searching">
              <p class="s-tip">搜索中…</p>
            </template>
            <template v-else-if="results.length === 0">
              <p class="s-tip">没有找到「{{ keyword }}」相关文章</p>
            </template>
            <ul v-else class="s-list">
              <li
                v-for="(item, i) in results"
                :key="item.id"
                class="s-item"
                :class="{ active: i === selected }"
                @mouseenter="selected = i"
                @click="goTo(item)"
              >
                <div class="s-title">{{ item.articleName }}</div>
                <div class="s-meta">
                  <span v-if="item.articleCategory" class="s-cat">{{ item.articleCategory }}</span>
                  <span v-if="item.createTime" class="s-date">{{ formatTimestamp(item.createTime) }}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticleList } from '@/api/article'
import { formatTimestamp } from '@/utils/format'

const router = useRouter()
const show = ref(false)
const keyword = ref('')
const searching = ref(false)
const results = ref<any[]>([])
const selected = ref(-1)
const inputRef = ref<HTMLInputElement>()
let searchTimer: ReturnType<typeof setTimeout>

const open = async () => {
  show.value = true
  keyword.value = ''
  results.value = []
  selected.value = -1
  await nextTick()
  inputRef.value?.focus()
}

const close = () => { show.value = false }

const onInput = () => {
  selected.value = -1
  clearTimeout(searchTimer)
  const q = keyword.value.trim()
  if (!q) { results.value = []; return }
  searching.value = true
  searchTimer = setTimeout(async () => {
    try {
      const res: any = await getArticleList({ articleName: q, pageNo: 1, pageSize: 10 })
      results.value = res?.list ?? (Array.isArray(res) ? res : [])
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 280)
}

const moveSelect = (dir: 1 | -1) => {
  if (!results.value.length) return
  selected.value = (selected.value + dir + results.value.length) % results.value.length
}

const goTo = (item: any) => {
  close()
  router.push(`/article/${item.id}`)
}

const goFirst = () => {
  const idx = selected.value >= 0 ? selected.value : 0
  const target = results.value[idx]
  if (target) goTo(target)
}

const onKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    show.value ? close() : open()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('open-search', open as EventListener)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('open-search', open as EventListener)
  clearTimeout(searchTimer)
})
</script>

<style scoped lang="scss">
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  padding-top: 88px;
  align-items: flex-start;
}

.search-box {
  width: min(620px, calc(100vw - 32px));
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.s-icon {
  width: 20px; height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.s-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--text-primary);
  caret-color: var(--color-accent);
  font-family: var(--font-sans);
  &::placeholder { color: var(--text-tertiary); }
}

.s-esc {
  padding: 2px 8px;
  border-radius: 5px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
  font-family: var(--font-sans);
  transition: all 0.15s;
  &:hover { border-color: var(--color-accent); color: var(--color-accent); }
}

.search-body {
  max-height: 400px;
  overflow-y: auto;
}

.s-tip {
  padding: 20px 24px;
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
  text-align: center;
  kbd {
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    font-size: 11px;
    margin: 0 2px;
    font-family: var(--font-sans);
  }
}

.s-list {
  list-style: none;
  padding: 8px 0;
  margin: 0;
}

.s-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 20px;
  cursor: pointer;
  transition: background 0.15s;

  &.active {
    background: var(--bg-secondary);
    .s-title { color: var(--color-accent); }
  }
  &:hover {
    background: var(--bg-secondary);
    .s-title { color: var(--color-accent); }
  }
}

.s-title {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  transition: color 0.15s;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.s-cat {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  border: 1px solid var(--border-color);
}

.s-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Transition */
.search-fade-enter-active { transition: opacity 0.2s ease; }
.search-fade-leave-active  { transition: opacity 0.18s ease; }
.search-fade-enter-from,
.search-fade-leave-to      { opacity: 0; }

.search-fade-enter-active .search-box { transition: transform 0.22s ease, opacity 0.2s ease; }
.search-fade-leave-active  .search-box { transition: transform 0.18s ease, opacity 0.18s ease; }
.search-fade-enter-from .search-box,
.search-fade-leave-to   .search-box  { transform: translateY(-16px); opacity: 0; }
</style>
