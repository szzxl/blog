function setMeta(key: string, content: string, property = false) {
  const attribute = property ? 'property' : 'name'
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.appendChild(element) }
  element.content = content
}
let siteName = '时光博客'
export function setSiteName(name: string) { siteName = name }
export function useSeo(options: {
  title?: string; description?: string; image?: string; type?: 'article' | 'website'
  article?: { id: string; published?: number | string; author?: string }
}) {
  const title = options.title ? `${options.title} | ${siteName}` : siteName
  const text = new DOMParser().parseFromString(options.description || '', 'text/html')
  const description = (text.body.textContent || '').replace(/\s+/g, ' ').slice(0, 160)
  const url = new URL(window.location.href)
  url.hash = ''; url.search = ''
  const query = new URLSearchParams(window.location.search)
  if (!query.has('keyword')) {
    for (const key of ['category', 'tag', 'page']) {
      const value = query.get(key)
      if (value && (key !== 'page' || (/^\d+$/.test(value) && Number(value) > 1))) url.searchParams.set(key, value)
    }
  }
  document.title = title
  setMeta('description', description)
  const privatePage = /\/(login|register|profile|favorites)\/?$/.test(url.pathname) || new URLSearchParams(window.location.search).has('keyword')
  setMeta('robots', privatePage ? 'noindex,follow' : 'index,follow')
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
  canonical.href = url.href
  let image = ''
  try { if (options.image) image = new URL(options.image, window.location.origin).href } catch { /* 无效封面不影响页面 */ }
  for (const [key, value] of Object.entries({ 'og:site_name': siteName, 'og:title': title, 'og:description': description, 'og:url': url.href, 'og:type': options.type || 'website', 'og:image': image })) setMeta(key, value, true)
  document.getElementById('article-schema')?.remove()
  if (options.article) {
    const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: options.title, description, url: url.href, mainEntityOfPage: url.href, publisher: { '@type': 'Organization', name: siteName } }
    if (image) schema.image = image
    if (options.article.author) schema.author = { '@type': 'Person', name: options.article.author }
    if (options.article.published) { const date = new Date(options.article.published); if (!Number.isNaN(date.getTime())) schema.datePublished = date.toISOString() }
    const script = document.createElement('script')
    script.id = 'article-schema'; script.type = 'application/ld+json'; script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
  }
}
export function resetSeo(pageTitle?: string) { useSeo({ title: pageTitle }) }
