/* eslint-disable import/first */
import Vue from 'vue'
import 'vuetify/dist/vuetify.min.css'
import boot from './modules/boot'
import { createLegacyVuetify, installLegacySetupPlugins, registerLegacySetupComponents } from './modules/vue-legacy-app'
import { mountLegacyVueApp } from './modules/vue-legacy-instance'
import { clearWikiInstance, setWikiInstance } from './modules/wiki-instance'
/* eslint-enable import/first */

clearWikiInstance()
window.boot = boot

installLegacySetupPlugins(Vue)
registerLegacySetupComponents(Vue)

let bootstrap = () => {
  setWikiInstance(mountLegacyVueApp({
    el: '#root',
    vuetify: createLegacyVuetify()
  }))
}

window.boot.onDOMReady(bootstrap)
