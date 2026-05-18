import * as VueModule from 'vue'
import * as VueRouterModule from 'vue-router'
import * as VuexModule from 'vuex'

const resolveLegacyVueConstructor = (module) => module.default || module
const resolveLegacyRouterConstructor = (module) => module.default || module.VueRouter || null
const resolveLegacyStoreConstructor = (module) => module.default || module.Vuex || null
const resolveModernStoreFactory = (module) => module.createStore || module.default?.createStore || null

const DefaultVueConstructor = resolveLegacyVueConstructor(VueModule)
const DefaultVueRouterConstructor = resolveLegacyRouterConstructor(VueRouterModule)
const DefaultVuexConstructor = resolveLegacyStoreConstructor(VuexModule)
const DefaultCreateStore = resolveModernStoreFactory(VuexModule)

export function createLegacyVueRuntime ({
  VueConstructor = DefaultVueConstructor,
  VueRouterConstructor = DefaultVueRouterConstructor,
  VuexConstructor = DefaultVuexConstructor,
  createApp = null,
  createRouter = null,
  createWebHistory = null,
  createStore = DefaultCreateStore
} = {}) {
  let isLegacyRouterInstalled = false
  let isLegacyStoreInstalled = false
  let isModernStoreBridgeInstalled = false
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

  const ensureModernStoreBridgeInstalled = () => {
    if (!hasModernStoreApi || hasModernAppApi || isModernStoreBridgeInstalled || typeof VueConstructor?.mixin !== 'function') {
      return
    }

    VueConstructor.mixin({
      beforeCreate () {
        const ownStore = typeof this.$options.store === 'function'
          ? this.$options.store()
          : this.$options.store

        if (ownStore) {
          this.$store = ownStore
        } else if (this.$parent?.$store) {
          this.$store = this.$parent.$store
        }

        const ownApolloProvider = typeof this.$options.apolloProvider === 'function'
          ? this.$options.apolloProvider()
          : this.$options.apolloProvider

        if (ownApolloProvider) {
          this.$apolloProvider = ownApolloProvider
        } else if (this.$parent?.$apolloProvider) {
          this.$apolloProvider = this.$parent.$apolloProvider
        }
      }
    })

    isModernStoreBridgeInstalled = true
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

    ensureModernStoreBridgeInstalled()
    return new VueConstructor(options)
  }

  return {
    ensureLegacyRouterInstalled,
    ensureLegacyStoreInstalled,
    ensureModernStoreBridgeInstalled,
    createLegacyRouterInstance,
    createLegacyStoreInstance,
    mountLegacyVueInstance
  }
}

const legacyVueRuntime = createLegacyVueRuntime()

export const legacyVueRegistrationTarget = DefaultVueConstructor
export const hasLegacyVueRuntimeAppApi = false
export const ensureLegacyRouterInstalled = legacyVueRuntime.ensureLegacyRouterInstalled
export const ensureLegacyStoreInstalled = legacyVueRuntime.ensureLegacyStoreInstalled
export const ensureModernStoreBridgeInstalled = legacyVueRuntime.ensureModernStoreBridgeInstalled
export const createLegacyRouterInstance = legacyVueRuntime.createLegacyRouterInstance
export const createLegacyStoreInstance = legacyVueRuntime.createLegacyStoreInstance
export const mountLegacyVueInstance = legacyVueRuntime.mountLegacyVueInstance
