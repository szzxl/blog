export type CommentId = string | number

export interface CommentResponse {
  id: CommentId
  username: string
  content: string
  creator: string
  createTime: number | string
  images: string[]
  isAuthor: boolean
  isLiked: boolean
  likeCount: number
  parentId?: CommentId | null
  rootId?: CommentId | null
  replyCount?: number
  replyToName?: string
  children?: CommentResponse[]
}

export interface CommentView extends CommentResponse {
  user: { nickname: string; isAuthor: boolean }
  children: CommentView[]
}

export interface CommentSubmission {
  content: string
  images: string[]
}
