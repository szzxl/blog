export interface Category {
  id?: number | string
  name: string
  count?: number
  description?: string
}

export interface Tag {
  id?: number | string
  name: string
  count?: number
}

// 兼容现有分类、标签接口的字段命名；页面只使用归一化后的模型。
export interface CategoryRecord {
  id?: number | string
  name?: string
  categoryName?: string
  num?: number
  count?: number
  articleCount?: number
  description?: string
}

export interface TagRecord {
  id?: number | string
  name?: string
  tagName?: string
  num?: number
}
