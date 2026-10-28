const BLOCKED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'textarea',
  'select',
  'button',
  'link',
  'meta',
  'base',
  'applet',
])

const EVENT_ATTR_RE = /^on/i
const JS_URL_RE = /^javascript:/i

function sanitizeAttributes(el: Element) {
  const attrs = Array.from(el.attributes)
  for (const attr of attrs) {
    if (EVENT_ATTR_RE.test(attr.name)) {
      el.removeAttribute(attr.name)
    } else if (
      (attr.name === 'href' || attr.name === 'src' || attr.name === 'action') &&
      JS_URL_RE.test(attr.value)
    ) {
      el.removeAttribute(attr.name)
    }
  }
}

function walk(node: Node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    const tag = el.tagName.toLowerCase()

    if (BLOCKED_TAGS.has(tag)) {
      el.remove()
      return
    }

    sanitizeAttributes(el)

    const children = Array.from(el.childNodes)
    for (const child of children) {
      walk(child)
    }
  }
}

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body
  walk(body)
  return body.innerHTML
}

export function isHtmlContent(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value)
}
