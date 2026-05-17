import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createLegacyStore (options) {
  return new Vuex.Store(options)
}
