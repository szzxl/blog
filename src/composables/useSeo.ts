function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}

let _siteName = '时光博客'

export function setSiteName(name: string) {
  _siteName = name
}

export function useSeo(options: { title?: string; description?: string; image?: string; type?: 'article' | 'website' }) {
  const fullTitle = options.title ? `${options.title} | ${_siteName}` : _siteName
  const desc = options.description?.replace(/<[^>]+>/g, '').slice(0, 160) || ''

  document.title = fullTitle
  setMeta('description', desc)
  setOgMeta('og:site_name', _siteName)
  setOgMeta('og:title', fullTitle)
  setOgMeta('og:description', desc)
  setOgMeta('og:url', window.location.href)
  setOgMeta('og:type', options.type || 'website')
  setOgMeta('og:image', options.image ? new URL(options.image, window.location.origin).href : '')
}

export function resetSeo(pageTitle?: string) {
  useSeo({ title: pageTitle })
}
