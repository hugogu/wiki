import VueApollo from 'vue-apollo'
import VueClipboards from 'vue-clipboards'
import Vuetify from 'vuetify'
import VueMoment from 'vue-moment'
import Vuescroll from 'vuescroll/dist/vuescroll-native'
import VueRouter from 'vue-router'

export function installLegacyPlugins (Vue, { localization, helpers, moment, velocity }) {
  Vue.config.productionTip = false

  Vue.use(VueRouter)
  Vue.use(VueApollo)
  Vue.use(VueClipboards)
  Vue.use(localization.VueI18Next)
  Vue.use(helpers)
  Vue.use(Vuetify)
  Vue.use(VueMoment, { moment })
  Vue.use(Vuescroll)

  Vue.prototype.Velocity = velocity
}

export function installLegacySetupPlugins (Vue) {
  Vue.config.productionTip = false
  Vue.use(Vuetify)
}

export function registerLegacyAppComponents (Vue, getThemeComponentLoader) {
  Vue.component('Admin', () => import(/* webpackChunkName: "admin" */ '../components/admin.vue'))
  Vue.component('Comments', () => import(/* webpackChunkName: "comments" */ '../components/comments.vue'))
  Vue.component('Editor', () => import(/* webpackPrefetch: -100, webpackChunkName: "editor" */ '../components/editor.vue'))
  Vue.component('History', () => import(/* webpackChunkName: "history" */ '../components/history.vue'))
  Vue.component('Loader', () => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/loader.vue'))
  Vue.component('Login', () => import(/* webpackPrefetch: true, webpackChunkName: "login" */ '../components/login.vue'))
  Vue.component('NavHeader', () => import(/* webpackMode: "eager" */ '../components/common/nav-header.vue'))
  Vue.component('NewPage', () => import(/* webpackChunkName: "new-page" */ '../components/new-page.vue'))
  Vue.component('Notify', () => import(/* webpackMode: "eager" */ '../components/common/notify.vue'))
  Vue.component('NotFound', () => import(/* webpackChunkName: "not-found" */ '../components/not-found.vue'))
  Vue.component('PageSelector', () => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/page-selector.vue'))
  Vue.component('PageSource', () => import(/* webpackChunkName: "source" */ '../components/source.vue'))
  Vue.component('Profile', () => import(/* webpackChunkName: "profile" */ '../components/profile.vue'))
  Vue.component('Register', () => import(/* webpackChunkName: "register" */ '../components/register.vue'))
  Vue.component('SearchResults', () => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/search-results.vue'))
  Vue.component('SocialSharing', () => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/social-sharing.vue'))
  Vue.component('Tags', () => import(/* webpackChunkName: "tags" */ '../components/tags.vue'))
  Vue.component('Unauthorized', () => import(/* webpackChunkName: "unauthorized" */ '../components/unauthorized.vue'))
  Vue.component('VCardChin', () => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/v-card-chin.vue'))
  Vue.component('VCardInfo', () => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/v-card-info.vue'))
  Vue.component('Welcome', () => import(/* webpackChunkName: "welcome" */ '../components/welcome.vue'))

  Vue.component('NavFooter', () => getThemeComponentLoader('nav-footer')())
  Vue.component('Page', () => getThemeComponentLoader('page')())
}

export function registerLegacySetupComponents (Vue) {
  Vue.component('setup', () => import(/* webpackMode: "eager" */ '../components/setup.vue'))
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
