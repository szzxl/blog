import type { ListResponse, PageResult } from '@/types/pagination'

/** 统一处理数组、list 和 records，保留接口明确返回的零条总数。 */
export const normalizePageResult = <T>(
  response: ListResponse<T> | null | undefined
): PageResult<T> => {
  if (Array.isArray(response)) return { list: response, total: response.length }
  const list = Array.isArray(response?.list)
    ? response.list
    : Array.isArray(response?.records)
      ? response.records
      : []
  const count = response?.total
  const total =
    typeof count === 'number' && Number.isSafeInteger(count) && count >= 0 ? count : list.length
  return { list, total }
}
