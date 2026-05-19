/* eslint-disable import/first */
import 'vuetify/dist/vuetify.min.css'
import boot from './modules/boot'
import { createLegacySetupAppOptions } from './modules/app-options-legacy'
import { createLegacyVuetify, installLegacySetupPlugins, registerLegacySetupComponents } from './modules/vue-legacy-app'
import { mountLegacyVueApp } from './modules/vue-legacy-instance'
import { legacyVueRegistrationTarget } from './modules/vue-legacy-runtime'
import { clearWikiInstance, setWikiInstance } from './modules/wiki-instance'
/* eslint-enable import/first */

clearWikiInstance()
window.boot = boot

let bootstrap = () => {
  installLegacySetupPlugins(legacyVueRegistrationTarget)
  registerLegacySetupComponents(legacyVueRegistrationTarget)

  setWikiInstance(mountLegacyVueApp(createLegacySetupAppOptions({
    vuetify: createLegacyVuetify()
  })))
}

window.boot.onDOMReady(bootstrap)
