/* eslint-disable import/first */
import './modules/vue-compat'
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

installLegacySetupPlugins(legacyVueRegistrationTarget)
registerLegacySetupComponents(legacyVueRegistrationTarget)

let bootstrap = () => {
  setWikiInstance(mountLegacyVueApp(createLegacySetupAppOptions({
    vuetify: createLegacyVuetify()
  })))
}

window.boot.onDOMReady(bootstrap)
