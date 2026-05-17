import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

export function createLegacyVueRuntime ({
  VueConstructor = Vue,
  VueRouterConstructor = VueRouter,
  VuexConstructor = Vuex
} = {}) {
  let isLegacyRouterInstalled = false
  let isLegacyStoreInstalled = false

  const ensureLegacyRouterInstalled = () => {
    if (!isLegacyRouterInstalled) {
      VueConstructor.use(VueRouterConstructor)
      isLegacyRouterInstalled = true
    }
  }

  const ensureLegacyStoreInstalled = () => {
    if (!isLegacyStoreInstalled) {
      VueConstructor.use(VuexConstructor)
      isLegacyStoreInstalled = true
    }
  }

  const createLegacyRouterInstance = ({ base, routes = [], beforeEach, afterEach }) => {
    ensureLegacyRouterInstalled()

    const router = new VueRouterConstructor({
      mode: 'history',
      base,
      routes
    })

    if (beforeEach) {
      router.beforeEach(beforeEach)
    }

    if (afterEach) {
      router.afterEach(afterEach)
    }

    return router
  }

  const createLegacyStoreInstance = (options) => {
    ensureLegacyStoreInstalled()
    return new VuexConstructor.Store(options)
  }

  const mountLegacyVueInstance = (options) => {
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

export const ensureLegacyRouterInstalled = legacyVueRuntime.ensureLegacyRouterInstalled
export const ensureLegacyStoreInstalled = legacyVueRuntime.ensureLegacyStoreInstalled
export const createLegacyRouterInstance = legacyVueRuntime.createLegacyRouterInstance
export const createLegacyStoreInstance = legacyVueRuntime.createLegacyStoreInstance
export const mountLegacyVueInstance = legacyVueRuntime.mountLegacyVueInstance
