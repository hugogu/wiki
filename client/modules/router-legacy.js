import VueRouter from 'vue-router'

export function createLegacyRouter ({ base, routes = [], beforeEach, afterEach }) {
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
