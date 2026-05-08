export const parseToken = (tokenStr: string | null): string => {
  if (!tokenStr) return ''
  try {
    const tokenObj = JSON.parse(tokenStr)
    if (tokenObj.v) {
      try {
        return JSON.parse(tokenObj.v)
      } catch {
        return tokenObj.v
      }
    }
    return tokenStr
  } catch {
    return tokenStr
  }
}
