import { defineCompatAsyncComponent } from './vue-async-component'

export function applyGlobalPlugins (target, plugins) {
  plugins.forEach(plugin => {
    if (Array.isArray(plugin)) {
      target.use(plugin[0], plugin[1])
      return
    }

    target.use(plugin)
  })
}

export function assignGlobalProperties (target, properties) {
  if (target?.config?.globalProperties) {
    Object.assign(target.config.globalProperties, properties)
    return
  }

  Object.assign(target.prototype, properties)
}

export function defineGlobalProperties (target, descriptors) {
  if (target?.config?.globalProperties) {
    Object.defineProperties(target.config.globalProperties, descriptors)
    return
  }

  Object.defineProperties(target.prototype, descriptors)
}

export function registerGlobalComponents (target, components) {
  components.forEach(component => {
    target.component(component.name, component.loader)
  })
}

export function createLegacyAppComponentRegistry (getThemeComponentLoader) {
  return [
    { name: 'Admin', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "admin" */ '../components/admin.vue')) },
    { name: 'Comments', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "comments" */ '../components/comments.vue')) },
    { name: 'Editor', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: -100, webpackChunkName: "editor" */ '../components/editor.vue')) },
    { name: 'History', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "history" */ '../components/history.vue')) },
    { name: 'Loader', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/loader.vue')) },
    { name: 'Login', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "login" */ '../components/login.vue')) },
    { name: 'NavHeader', loader: defineCompatAsyncComponent(() => import(/* webpackMode: "eager" */ '../components/common/nav-header.vue')) },
    { name: 'NewPage', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "new-page" */ '../components/new-page.vue')) },
    { name: 'Notify', loader: defineCompatAsyncComponent(() => import(/* webpackMode: "eager" */ '../components/common/notify.vue')) },
    { name: 'NotFound', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "not-found" */ '../components/not-found.vue')) },
    { name: 'PageSelector', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/page-selector.vue')) },
    { name: 'PageSource', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "source" */ '../components/source.vue')) },
    { name: 'Profile', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "profile" */ '../components/profile.vue')) },
    { name: 'Register', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "register" */ '../components/register.vue')) },
    { name: 'SearchResults', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/search-results.vue')) },
    { name: 'SocialSharing', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/social-sharing.vue')) },
    { name: 'Tags', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "tags" */ '../components/tags.vue')) },
    { name: 'Unauthorized', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "unauthorized" */ '../components/unauthorized.vue')) },
    { name: 'VCardChin', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/v-card-chin.vue')) },
    { name: 'VCardInfo', loader: defineCompatAsyncComponent(() => import(/* webpackPrefetch: true, webpackChunkName: "ui-extra" */ '../components/common/v-card-info.vue')) },
    { name: 'Welcome', loader: defineCompatAsyncComponent(() => import(/* webpackChunkName: "welcome" */ '../components/welcome.vue')) },
    { name: 'NavFooter', loader: defineCompatAsyncComponent(getThemeComponentLoader('nav-footer')) },
    { name: 'Page', loader: defineCompatAsyncComponent(getThemeComponentLoader('page')) }
  ]
}

export function createLegacySetupComponentRegistry () {
  return [
    { name: 'setup', loader: defineCompatAsyncComponent(() => import(/* webpackMode: "eager" */ '../components/setup.vue')) }
  ]
}
