import * as VueModule from 'vue'
import * as VueRouterModule from 'vue-router'
import * as VuexModule from 'vuex'

const resolveLegacyVueConstructor = (module) => module.default || module
const resolveLegacyRouterConstructor = (module) => module.default || module.VueRouter || null
const resolveLegacyStoreConstructor = (module) => module.default || module.Vuex || null

const DefaultVueConstructor = resolveLegacyVueConstructor(VueModule)
const DefaultVueRouterConstructor = resolveLegacyRouterConstructor(VueRouterModule)
const DefaultVuexConstructor = resolveLegacyStoreConstructor(VuexModule)

export function createLegacyVueRuntime ({
  VueConstructor = DefaultVueConstructor,
  VueRouterConstructor = DefaultVueRouterConstructor,
  VuexConstructor = DefaultVuexConstructor,
  createApp = null,
  createRouter = null,
  createWebHistory = null,
  createStore = null
} = {}) {
  let isLegacyRouterInstalled = false
  let isLegacyStoreInstalled = false
  const hasModernRouterApi = typeof createRouter === 'function' && typeof createWebHistory === 'function'
  const hasModernStoreApi = typeof createStore === 'function'
  const hasModernAppApi = typeof createApp === 'function'

  const ensureLegacyRouterInstalled = () => {
    if (!hasModernRouterApi && !isLegacyRouterInstalled && typeof VueConstructor?.use === 'function' && VueRouterConstructor) {
      VueConstructor.use(VueRouterConstructor)
      isLegacyRouterInstalled = true
    }
  }

  const ensureLegacyStoreInstalled = () => {
    if (!hasModernStoreApi && !isLegacyStoreInstalled && typeof VueConstructor?.use === 'function' && VuexConstructor) {
      VueConstructor.use(VuexConstructor)
      isLegacyStoreInstalled = true
    }
  }

  const createLegacyRouterInstance = ({ base, routes = [], beforeEach, afterEach }) => {
    let router = null

    if (hasModernRouterApi) {
      router = createRouter({
        history: createWebHistory(base),
        routes
      })
    } else {
      ensureLegacyRouterInstalled()
      router = new VueRouterConstructor({
        mode: 'history',
        base,
        routes
      })
    }

    if (beforeEach) {
      router.beforeEach(beforeEach)
    }

    if (afterEach) {
      router.afterEach(afterEach)
    }

    return router
  }

  const createLegacyStoreInstance = (options) => {
    if (hasModernStoreApi) {
      return createStore(options)
    }

    ensureLegacyStoreInstalled()
    return new VuexConstructor.Store(options)
  }

  const mountLegacyVueInstance = (options) => {
    if (hasModernAppApi) {
      const { el, apolloProvider, i18n, router, store, vuetify, ...rootOptions } = options
      const app = createApp(rootOptions)

      ;[apolloProvider, i18n, router, store, vuetify].filter(Boolean).forEach(plugin => {
        app.use(plugin)
      })

      return app.mount(el)
    }

    return new VueConstructor(options)
  }

  return {
    ensureLegacyRouterInstalled,
    ensureLegacyStoreInstalled,
    createLegacyRouterInstance,
    createLegacyStoreInstance,
    mountLegacyVueInstance
  }
}

const legacyVueRuntime = createLegacyVueRuntime()

export const hasLegacyVueRuntimeAppApi = false
export const ensureLegacyRouterInstalled = legacyVueRuntime.ensureLegacyRouterInstalled
export const ensureLegacyStoreInstalled = legacyVueRuntime.ensureLegacyStoreInstalled
export const createLegacyRouterInstance = legacyVueRuntime.createLegacyRouterInstance
export const createLegacyStoreInstance = legacyVueRuntime.createLegacyStoreInstance
export const mountLegacyVueInstance = legacyVueRuntime.mountLegacyVueInstance
