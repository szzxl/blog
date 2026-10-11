export const normalizePage = (value: unknown): number => {
  const page = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}
export const lastPage = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
