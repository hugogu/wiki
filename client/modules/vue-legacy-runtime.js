import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

let isLegacyRouterInstalled = false
let isLegacyStoreInstalled = false

export function ensureLegacyRouterInstalled (VueConstructor = Vue) {
  if (!isLegacyRouterInstalled) {
    VueConstructor.use(VueRouter)
    isLegacyRouterInstalled = true
  }
}

export function ensureLegacyStoreInstalled (VueConstructor = Vue) {
  if (!isLegacyStoreInstalled) {
    VueConstructor.use(Vuex)
    isLegacyStoreInstalled = true
  }
}

export function createLegacyRouterInstance ({ base, routes = [], beforeEach, afterEach }) {
  ensureLegacyRouterInstalled()

  const router = new VueRouter({
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

export function createLegacyStoreInstance (options) {
  ensureLegacyStoreInstalled()
  return new Vuex.Store(options)
}

export function mountLegacyVueInstance (options) {
  return new Vue(options)
}
