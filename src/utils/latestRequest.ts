// 请求仍可完成，但只有最新请求可以更新页面状态。
export const createLatestRequest = () => {
  let sequence = 0
  return {
    next: () => ++sequence,
    isCurrent: (id: number) => id === sequence,
    invalidate: () => { sequence++ }
  }
}
