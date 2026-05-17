export function createLegacyClientAppOptions ({
  apolloProvider,
  applyLegacyMomentPreferences,
  helpers,
  i18n,
  pageMountOptions,
  siteConfig,
  store,
  vuetify
}) {
  return {
    el: '#root',
    components: {},
    mixins: [helpers],
    apolloProvider,
    store,
    i18n,
    vuetify,
    mounted () {
      applyLegacyMomentPreferences(this, store, siteConfig)
    },
    ...(pageMountOptions || {})
  }
}

export function createLegacySetupAppOptions ({ vuetify }) {
  return {
    el: '#root',
    vuetify
  }
}
