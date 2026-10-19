/** 优先使用 Clipboard API，受限环境回退到临时文本域，失败交由调用方反馈。 */
export const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    return
  } catch {
    const previousFocus = document.activeElement
    const input = document.createElement('textarea')
    input.value = text
    input.readOnly = true
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    try {
      input.select()
      if (!document.execCommand('copy')) throw new Error('复制失败')
    } finally {
      input.remove()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }
}
