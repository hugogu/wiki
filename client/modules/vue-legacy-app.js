import VueApollo from 'vue-apollo'
import VueClipboards from 'vue-clipboards'
import Vuetify from 'vuetify'
import VueMoment from 'vue-moment'
import Vuescroll from 'vuescroll/dist/vuescroll-native'
import VueRouter from 'vue-router'
import {
  applyGlobalPlugins,
  assignGlobalProperties,
  createLegacyAppComponentRegistry,
  createLegacySetupComponentRegistry,
  registerGlobalComponents
} from './vue-global-registry'

export function installLegacyPlugins (Vue, { localization, helpers, moment, velocity }) {
  Vue.config.productionTip = false

  applyGlobalPlugins(Vue, [
    VueRouter,
    VueApollo,
    VueClipboards,
    localization.VueI18Next,
    helpers,
    Vuetify,
    [VueMoment, { moment }],
    Vuescroll
  ])

  assignGlobalProperties(Vue, {
    Velocity: velocity
  })
}

export function installLegacySetupPlugins (Vue) {
  Vue.config.productionTip = false
  applyGlobalPlugins(Vue, [Vuetify])
}

export function registerLegacyAppComponents (Vue, getThemeComponentLoader) {
  registerGlobalComponents(Vue, createLegacyAppComponentRegistry(getThemeComponentLoader))
}

export function registerLegacySetupComponents (Vue) {
  registerGlobalComponents(Vue, createLegacySetupComponentRegistry())
}

export function createLegacyVuetify ({ rtl = false, dark = false } = {}) {
  return new Vuetify({
    rtl,
    theme: {
      dark
    }
  })
}

export function createLegacyApolloProvider (graphQL) {
  return new VueApollo({
    defaultClient: graphQL
  })
}

export function applyLegacyMomentPreferences (vm, store, siteConfig) {
  vm.$moment.locale(siteConfig.lang)

  if ((store.get('user/dateFormat') || '').length > 0) {
    vm.$moment.updateLocale(vm.$moment.locale(), {
      longDateFormat: {
        L: store.get('user/dateFormat')
      }
    })
  }

  if ((store.get('user/timezone') || '').length > 0) {
    vm.$moment.tz.setDefault(store.get('user/timezone'))
  }
}
