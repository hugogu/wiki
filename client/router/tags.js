import { createLegacyRouter } from '../modules/router-legacy'

export function createTagsRouter () {
  return createLegacyRouter({
    base: '/t'
  })
}
