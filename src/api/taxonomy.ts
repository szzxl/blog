import request from './request'
import { cache, generateCacheKey } from '@/utils/cache'
import { normalizePageResult } from '@/utils/collection'
import type { Category, CategoryRecord, Tag, TagRecord } from '@/types/catalog'
import type { ListResponse } from '@/types/pagination'

interface CategoryQuery {
  id?: number
  categoryName?: string
  categoryStatus?: number
  pageNo?: number
  pageSize?: number
}
interface TagQuery {
  id?: number
  tagName?: string
  tagStatus?: number
  pageNo?: number
  pageSize?: number
}

const toCategory = (item: CategoryRecord): Category => ({
  id: item.id,
  name: item.name || item.categoryName || '',
  count: item.num ?? item.count ?? item.articleCount,
  description: item.description
})
const toTag = (item: TagRecord): Tag => ({
  id: item.id,
  name: item.name || item.tagName || '',
  count: item.num
})

// 保留现有缓存键和 TTL；接口字段差异在数据层收敛，页面只读取 name/count。
export const getCategoryList = async (params: CategoryQuery = {}): Promise<Category[]> => {
  const response = await cache.getOrFetch(
    generateCacheKey('category_list', { ...params }),
    () =>
      request.post<ListResponse<CategoryRecord>, ListResponse<CategoryRecord>>(
        '/web/category/list',
        params
      ),
    60 * 1000
  )
  return normalizePageResult(response)
    .list.map(toCategory)
    .filter((item) => item.name)
}

export const getTagList = async (params: TagQuery = {}): Promise<Tag[]> => {
  const response = await cache.getOrFetch(
    generateCacheKey('tag_list', { ...params }),
    () => request.post<ListResponse<TagRecord>, ListResponse<TagRecord>>('/web/tag/list', params),
    60 * 1000
  )
  return normalizePageResult(response)
    .list.map(toTag)
    .filter((item) => item.name)
}

export const getTagListCount = async (params: TagQuery = {}): Promise<Tag[]> => {
  const response = await request.post<ListResponse<TagRecord>, ListResponse<TagRecord>>(
    '/web/tag/list/count',
    params
  )
  return normalizePageResult(response)
    .list.map(toTag)
    .filter((item) => item.name)
}
