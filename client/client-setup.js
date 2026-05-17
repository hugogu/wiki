/* eslint-disable import/first */
import * as VueModule from 'vue'
import 'vuetify/dist/vuetify.min.css'
import boot from './modules/boot'
import { createLegacySetupAppOptions } from './modules/app-options-legacy'
import { createLegacyVuetify, installLegacySetupPlugins, registerLegacySetupComponents } from './modules/vue-legacy-app'
import { mountLegacyVueApp } from './modules/vue-legacy-instance'
import { clearWikiInstance, setWikiInstance } from './modules/wiki-instance'
/* eslint-enable import/first */

const LegacyVue = VueModule.default || VueModule

clearWikiInstance()
window.boot = boot

installLegacySetupPlugins(LegacyVue)
registerLegacySetupComponents(LegacyVue)

let bootstrap = () => {
  setWikiInstance(mountLegacyVueApp(createLegacySetupAppOptions({
    vuetify: createLegacyVuetify()
  })))
}

window.boot.onDOMReady(bootstrap)
