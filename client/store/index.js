import Vue from 'vue'
import Vuex from 'vuex'
import { createRootStoreOptions } from './root-options'

Vue.use(Vuex)

export default new Vuex.Store(createRootStoreOptions())
