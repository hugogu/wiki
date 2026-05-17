import pathify from 'vuex-pathify'
import { createLegacyStoreInstance } from '../modules/vue-legacy-runtime'

export function createLegacyStore (options) {
  const store = createLegacyStoreInstance(options)

  // Vuex 4 + vuex-pathify compat: preserve the legacy store helper API
  // used throughout the app (`$store.get(...)`, `$store.set(...)`, etc.).
  if (typeof store.set !== 'function' || typeof store.get !== 'function') {
    pathify.plugin(store)
  }

  return store
}
