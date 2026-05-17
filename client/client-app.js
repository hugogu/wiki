/* global siteConfig */

import Vue from 'vue'
import VueClipboards from 'vue-clipboards'
import { ApolloClient } from 'apollo-client'
import { BatchHttpLink } from 'apollo-link-batch-http'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { ErrorLink } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'
import 'vuetify/dist/vuetify.min.css'
import Velocity from 'velocity-animate'
import Vuescroll from 'vuescroll/dist/vuescroll-native'
import Hammer from 'hammerjs'
import moment from 'moment-timezone'
import store from './store'
import Cookies from 'js-cookie'

// ====================================
// Load Modules
// ====================================

import boot from './modules/boot'
import localization from './modules/localization'
import {
  applyLegacyMomentPreferences,
  createLegacyApolloProvider,
  createLegacyVuetify,
  installLegacyPlugins,
  registerLegacyAppComponents
} from './modules/vue-legacy-app'
import { createLegacyClientAppOptions } from './modules/app-options-legacy'
import { mountLegacyVueApp } from './modules/vue-legacy-instance'
import { clearWikiInstance, setWikiInstance } from './modules/wiki-instance'

// ====================================
// Load Helpers
// ====================================

import helpers from './helpers'

const themeComponentLoaders = import.meta.glob('./themes/*/components/*.vue')
const getThemeComponentLoader = (componentName) => {
  const componentPath = `./themes/${siteConfig.theme}/components/${componentName}.vue`
  const loader = themeComponentLoaders[componentPath]

  if (!loader) {
    throw new Error(`Theme component not found: ${componentPath}`)
  }

  return loader
}

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

const buildPageMountOptions = () => {
  const rootEl = document.getElementById('root')
  const pageEl = rootEl ? rootEl.querySelector(':scope > page') || rootEl.querySelector('page') : null

  if (!pageEl) {
    return null
  }

  const contentsTemplate = pageEl.querySelector('template[slot="contents"]')
  const commentsTemplate = pageEl.querySelector('template[slot="comments"]')

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
    render(h) {
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

// ====================================
// Initialize Global Vars
// ====================================

clearWikiInstance()
window.boot = boot
window.Hammer = Hammer

moment.locale(siteConfig.lang)

store.commit('user/REFRESH_AUTH')

// ====================================
// Initialize Apollo Client (GraphQL)
// ====================================

const graphQLEndpoint = window.location.protocol + '//' + window.location.host + '/graphql'
const graphQLWSEndpoint = ((window.location.protocol === 'https:') ? 'wss:' : 'ws:') + '//' + window.location.host + '/graphql-subscriptions'

const graphQLLink = ApolloLink.from([
  new ErrorLink(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      let isAuthError = false
      graphQLErrors.map(({ message, locations, path }) => {
        if (message === `Forbidden`) {
          isAuthError = true
        }
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      })
      store.commit('showNotification', {
        style: 'red',
        message: isAuthError ? `You are not authorized to access this resource.` : `An unexpected error occurred.`,
        icon: 'alert'
      })
    }
    if (networkError) {
      console.error(networkError)
      store.commit('showNotification', {
        style: 'red',
        message: `Network Error: ${networkError.message}`,
        icon: 'alert'
      })
    }
  }),
  new BatchHttpLink({
    includeExtensions: true,
    uri: graphQLEndpoint,
    credentials: 'include',
    fetch: async (uri, options) => {
      // Strip __typename fields from variables
      let body = JSON.parse(options.body)
      body = body.map(bd => {
        return ({
          ...bd,
          variables: JSON.parse(JSON.stringify(bd.variables), (key, value) => { return key === '__typename' ? undefined : value })
        })
      })
      options.body = JSON.stringify(body)

      // Inject authentication token
      const jwtToken = Cookies.get('jwt')
      if (jwtToken) {
        options.headers.Authorization = `Bearer ${jwtToken}`
      }

      const resp = await fetch(uri, options)

      // Handle renewed JWT
      const newJWT = resp.headers.get('new-jwt')
      if (newJWT) {
        Cookies.set('jwt', newJWT, { expires: 365, secure: window.location.protocol === 'https:' })
      }
      return resp
    }
  })
])

const graphQLWSLink = new WebSocketLink({
  uri: graphQLWSEndpoint,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () => {
      const token = Cookies.get('jwt')
      return token ? { token } : {}
    }
  }
})

window.graphQL = new ApolloClient({
  link: split(({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  }, graphQLWSLink, graphQLLink),
  cache: new InMemoryCache(),
  connectToDevTools: import.meta.env.DEV
})

installLegacyPlugins(Vue, {
  localization,
  helpers,
  moment,
  velocity: Velocity
})
registerLegacyAppComponents(Vue, getThemeComponentLoader)

let bootstrap = () => {
  // ====================================
  // Notifications
  // ====================================

  window.addEventListener('beforeunload', () => {
    store.commit('loadingStart', 'page-unload')
  })

  const apolloProvider = createLegacyApolloProvider(window.graphQL)

  // ====================================
  // Bootstrap Vue
  // ====================================

  const i18n = localization.init()

  let darkModeEnabled = siteConfig.darkMode
  if ((store.get('user/appearance') || '').length > 0) {
    darkModeEnabled = (store.get('user/appearance') === 'dark')
  }

  const pageMountOptions = buildPageMountOptions()
  const vuetify = createLegacyVuetify({
    rtl: siteConfig.rtl,
    dark: darkModeEnabled
  })

  setWikiInstance(mountLegacyVueApp(createLegacyClientAppOptions({
    apolloProvider,
    applyLegacyMomentPreferences,
    helpers,
    i18n,
    pageMountOptions,
    siteConfig,
    store,
    vuetify
  })))

  // ----------------------------------
  // Dispatch boot ready
  // ----------------------------------

  window.boot.notify('vue')
}

window.boot.onDOMReady(bootstrap)
