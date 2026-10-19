export interface PageParams {
  pageNo: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export type ListResponse<T> =
  | T[]
  | {
      list?: T[]
      records?: T[]
      total?: number
    }
