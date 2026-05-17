const readStringAttribute = (el, name, fallback = '') => {
  const value = el.getAttribute(name)
  return value === null ? fallback : value
}

const readNumberAttribute = (el, name, fallback = 0) => {
  const value = el.getAttribute(name)
  return value === null ? fallback : Number(value)
}

const readBooleanAttribute = (el, name, fallback = false) => {
  if (!el.hasAttribute(name)) {
    return fallback
  }

  const value = el.getAttribute(name)
  return value === '' || value === 'true'
}

const readJSONAttribute = (el, name, fallback) => {
  const value = el.getAttribute(name)

  if (value === null) {
    return fallback
  }

  try {
    return JSON.parse(value)
  } catch (err) {
    console.warn(`Unable to parse JSON attribute ${name}.`, err)
    return fallback
  }
}

const getLegacyPageSlotTemplate = (pageEl, slotName) => {
  return pageEl.querySelector(`template[data-page-slot="${slotName}"]`) ||
    pageEl.querySelector(`template[slot="${slotName}"]`)
}

export function buildLegacyPageMountOptions () {
  const rootEl = document.getElementById('root')
  const pageEl = rootEl ? rootEl.querySelector(':scope > page') || rootEl.querySelector('page') : null

  if (!pageEl) {
    return null
  }

  const contentsTemplate = getLegacyPageSlotTemplate(pageEl, 'contents')
  const commentsTemplate = getLegacyPageSlotTemplate(pageEl, 'comments')

  const pageProps = {
    pageId: readNumberAttribute(pageEl, ':page-id'),
    locale: readStringAttribute(pageEl, 'locale', 'en'),
    path: readStringAttribute(pageEl, 'path', 'home'),
    title: readStringAttribute(pageEl, 'title', 'Untitled Page'),
    description: readStringAttribute(pageEl, 'description'),
    createdAt: readStringAttribute(pageEl, 'created-at'),
    updatedAt: readStringAttribute(pageEl, 'updated-at'),
    tags: readJSONAttribute(pageEl, ':tags', []),
    authorName: readStringAttribute(pageEl, 'author-name', 'Unknown'),
    authorId: readNumberAttribute(pageEl, ':author-id'),
    editor: readStringAttribute(pageEl, 'editor'),
    isPublished: readBooleanAttribute(pageEl, ':is-published'),
    toc: readStringAttribute(pageEl, 'toc'),
    sidebar: readStringAttribute(pageEl, 'sidebar'),
    navMode: readStringAttribute(pageEl, 'nav-mode', 'MIXED'),
    commentsEnabled: readBooleanAttribute(pageEl, 'comments-enabled'),
    effectivePermissions: readStringAttribute(pageEl, 'effective-permissions'),
    commentsExternal: readBooleanAttribute(pageEl, 'comments-external'),
    editShortcuts: readStringAttribute(pageEl, 'edit-shortcuts'),
    filename: readStringAttribute(pageEl, 'filename')
  }

  return {
    render (h) {
      const slotNodes = []

      if (contentsTemplate) {
        slotNodes.push(h('div', {
          slot: 'contents',
          domProps: {
            innerHTML: contentsTemplate.innerHTML
          }
        }))
      }

      if (commentsTemplate) {
        slotNodes.push(h('div', {
          slot: 'comments',
          domProps: {
            innerHTML: commentsTemplate.innerHTML
          }
        }))
      }

      return h('Page', {
        props: pageProps
      }, slotNodes)
    }
  }
}
