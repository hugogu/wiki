import { createLegacyRouter } from '../modules/router-legacy'
import { getWikiInstance } from '../modules/wiki-instance'
import { profileRoutes } from './routes-profile'

export function createProfileRouter () {
  return createLegacyRouter({
    base: '/p',
    routes: profileRoutes,
    beforeEach: (to, from, next) => {
      const wiki = getWikiInstance()
      if (wiki) {
        wiki.$store.commit('loadingStart', 'profile')
      }
      next()
    },
    afterEach: () => {
      const wiki = getWikiInstance()
      if (wiki) {
        wiki.$store.commit('loadingStop', 'profile')
      }
    }
  })
}
