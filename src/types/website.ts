export interface WebsiteConfig {
  site_name?: string
  site_description?: string
  logo?: string
  seo_title?: string
  copyright?: string
  icp_number?: string
  website_motto?: string
  social_email?: string
  social_gitee?: string
  social_github?: string
  social_wechat?: string
  site_start_time?: string
  tool_miniprogram_name?: string
  tool_miniprogram_qr?: string
}

export interface SiteNotice {
  id: number
  type?: string
  content: string
  status: number
}
