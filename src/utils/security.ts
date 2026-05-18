export const sanitizeUrl = (url: string): string => {
  if (!url) return 'about:blank'
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:']
  const lowerUrl = url.toLowerCase().trim()
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) return 'about:blank'
  }
  return url
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}
