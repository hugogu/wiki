import { h } from 'vue'
import Admin from '../components/admin.vue'
import Login from '../components/login.vue'
import NewPage from '../components/new-page.vue'
import NotFound from '../components/not-found.vue'
import Profile from '../components/profile.vue'
import Register from '../components/register.vue'
import Tags from '../components/tags.vue'
import Unauthorized from '../components/unauthorized.vue'
import Welcome from '../components/welcome.vue'

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

const SIMPLE_ROOT_COMPONENTS = {
  admin: Admin,
  login: Login,
  'new-page': NewPage,
  notfound: NotFound,
  profile: Profile,
  register: Register,
  tags: Tags,
  unauthorized: Unauthorized,
  welcome: Welcome
}

const kebabToCamel = (value) => value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

const parseBoundAttributeValue = (value) => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (value !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  try {
    return JSON.parse(value)
  } catch (err) {
    return value
  }
}

const readSimpleRootProps = (componentEl) => {
  return Array.from(componentEl.attributes).reduce((props, attr) => {
    const isBound = attr.name.startsWith(':')
    const propName = kebabToCamel(isBound ? attr.name.slice(1) : attr.name)
    props[propName] = isBound ? parseBoundAttributeValue(attr.value) : attr.value
    return props
  }, {})
}

export function buildLegacyPageMountOptions () {
  const rootEl = document.getElementById('root')
  const pageEl = rootEl ? rootEl.querySelector(':scope > page') || rootEl.querySelector('page') : null
  document.documentElement.setAttribute('data-root-page-el', pageEl ? 'page' : 'none')

  if (!pageEl) {
    const rootComponentEl = rootEl?.firstElementChild
    const rootComponentTag = rootComponentEl?.tagName?.toLowerCase()
    const rootComponent = rootComponentTag ? SIMPLE_ROOT_COMPONENTS[rootComponentTag] : null
    document.documentElement.setAttribute('data-root-component-tag', rootComponentTag || 'none')

    if (!rootComponent || !rootComponentEl) {
      return null
    }

    const rootProps = readSimpleRootProps(rootComponentEl)

    return {
      ...(rootComponent.router ? { router: rootComponent.router } : {}),
      data () {
        return {
          legacyRootProps: rootProps
        }
      },
      render () {
        return h(rootComponent, {
          props: this.legacyRootProps
        })
      }
    }
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
    render (createElement) {
      const slotNodes = []

      if (contentsTemplate) {
        slotNodes.push(createElement('div', {
          slot: 'contents',
          domProps: {
            innerHTML: contentsTemplate.innerHTML
          }
        }))
      }

      if (commentsTemplate) {
        slotNodes.push(createElement('div', {
          slot: 'comments',
          domProps: {
            innerHTML: commentsTemplate.innerHTML
          }
        }))
      }

      return createElement('Page', {
        props: pageProps
      }, slotNodes)
    }
  }
}
