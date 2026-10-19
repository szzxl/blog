export interface ArticleSummary {
  id: number | string
  articleName: string
  articleCover?: string
  articleCategory?: string
  articleTag?: string
  summary?: string
  createTime?: number
  readNum?: number
  likeCount?: number
  isTop?: number
  isRecommend?: number
}

export interface ArticleDetail extends ArticleSummary {
  articleContent: string
  isLiked?: boolean
  isFavorited?: boolean
}
