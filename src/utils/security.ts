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

/**
 * 过滤敏感词（示例）
 * @param text 文本内容
 * @returns 过滤后的文本
 */
export const filterSensitiveWords = (text: string): string => {
  // 这里可以添加敏感词列表
  const sensitiveWords = ['敏感词1', '敏感词2']
  let filtered = text
  
  sensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  })
  
  return filtered
}

/**
 * 生成安全的随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export const generateSecureToken = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    // 降级方案
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256)
    }
  }
  
  for (let i = 0; i < length; i++) {
    const index = randomValues[i]
    if (index !== undefined) {
      result += chars[index % chars.length]
    }
  }
  
  return result
}

/**
 * 防止 CSRF 攻击 - 生成 CSRF Token
 * @returns CSRF Token
 */
export const generateCsrfToken = (): string => {
  const token = generateSecureToken()
  sessionStorage.setItem('csrf_token', token)
  return token
}

/**
 * 验证 CSRF Token
 * @param token 待验证的 token
 * @returns 是否有效
 */
export const verifyCsrfToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem('csrf_token')
  return storedToken === token
}
