import dayjs from 'dayjs'

export const formatTimestamp = (timestamp?: number, format = 'YYYY-MM-DD'): string => {
  if (!timestamp) return ''
  return dayjs(timestamp).format(format)
}

export const parseTags = (tagStr?: string): string[] => {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(Boolean)
}
