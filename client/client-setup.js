/* eslint-disable import/first */
import Vue from 'vue'
import 'vuetify/dist/vuetify.min.css'
import boot from './modules/boot'
import { createLegacyVuetify, installLegacySetupPlugins, registerLegacySetupComponents } from './modules/vue-legacy-app'
/* eslint-enable import/first */

window.WIKI = null
window.boot = boot

installLegacySetupPlugins(Vue)
registerLegacySetupComponents(Vue)

let bootstrap = () => {
  window.WIKI = new Vue({
    el: '#root',
    vuetify: createLegacyVuetify()
  })
}

window.boot.onDOMReady(bootstrap)
