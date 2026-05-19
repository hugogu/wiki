import { createLegacyRouter } from '../modules/router-legacy'
import { adminRoutes } from './routes-admin'

export function createAdminRouter () {
  return createLegacyRouter({
    base: '/a',
    routes: adminRoutes
  })
}
