import 'core-js/stable'
import 'regenerator-runtime/runtime'
import './libs/modernizr/modernizr.js'
import './libs/prism/prism.css'
import 'prismjs/plugins/toolbar/prism-toolbar.css'
import './scss/app.scss'
import './helpers/compatibility.js'
import './client-app.js'
import '@mdi/font/css/materialdesignicons.css'

/* global siteConfig */
/* eslint-disable no-unused-expressions */

const fontLoaders = {
  ar: () => import('./scss/fonts/arabic.scss'),
  fa: () => import('./scss/fonts/arabic.scss'),
  default: () => import('./scss/fonts/default.scss')
}

const themeStyleLoaders = import.meta.glob('./themes/*/scss/app.scss')
const themeScriptLoaders = import.meta.glob('./themes/*/js/app.js')
const themeStylePath = `./themes/${siteConfig.theme}/scss/app.scss`
const themeScriptPath = `./themes/${siteConfig.theme}/js/app.js`

const activeFontLoader = fontLoaders[window.document.documentElement.lang] || fontLoaders.default
activeFontLoader()

if (!themeStyleLoaders[themeStylePath] || !themeScriptLoaders[themeScriptPath]) {
  throw new Error(`Theme assets not found for ${siteConfig.theme}`)
}

themeStyleLoaders[themeStylePath]()
themeScriptLoaders[themeScriptPath]()
