/**
 * XSS 防护工具函数
 */

/**
 * HTML 转义，防止 XSS 攻击
 * @param text 需要转义的文本
 * @returns 转义后的安全文本
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * 清理 HTML，只保留纯文本
 * @param html HTML 字符串
 * @returns 纯文本
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * 清理 URL，防止 javascript: 等危险协议
 * @param url URL 字符串
 * @returns 安全的 URL
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return 'about:blank'
  
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:']
  const lowerUrl = url.toLowerCase().trim()
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return 'about:blank'
    }
  }
  
  return url
}

/**
 * 验证并清理用户输入
 * @param input 用户输入
 * @param maxLength 最大长度
 * @returns 清理后的输入
 */
export const sanitizeInput = (input: string, maxLength = 1000): string => {
  if (!input) return ''
  
  // 移除控制字符
  let cleaned = input.replace(/[\x00-\x1F\x7F]/g, '')
  
  // 限制长度
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength)
  }
  
  // HTML 转义
  return escapeHtml(cleaned)
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证 URL 格式
 * @param url URL 地址
 * @returns 是否有效
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}
