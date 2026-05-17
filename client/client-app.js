/* global siteConfig */

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
import { buildLegacyPageMountOptions } from './modules/page-mount-legacy'
import { createLegacyClientAppOptions } from './modules/app-options-legacy'
import { mountLegacyVueApp } from './modules/vue-legacy-instance'
import { legacyVueRegistrationTarget } from './modules/vue-legacy-runtime'
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

installLegacyPlugins(legacyVueRegistrationTarget, {
  localization,
  helpers,
  moment,
  velocity: Velocity
})
registerLegacyAppComponents(legacyVueRegistrationTarget, getThemeComponentLoader)

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

  const pageMountOptions = buildLegacyPageMountOptions()
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
