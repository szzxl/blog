export const parseToken = (tokenStr: string | null): string => {
  if (!tokenStr) return ''
  try {
    const tokenObj = JSON.parse(tokenStr)
    if (!tokenObj || typeof tokenObj !== 'object') return ''
    if (tokenObj.e !== undefined && (!Number.isFinite(Number(tokenObj.e)) || Number(tokenObj.e) <= Date.now())) return ''
    if (tokenObj.v) {
      try {
        const token: unknown = JSON.parse(tokenObj.v)
        return typeof token === 'string' ? token : ''
      } catch {
        return typeof tokenObj.v === 'string' ? tokenObj.v : ''
      }
    }
    return ''
  } catch {
    return ''
  }
}
