#!/usr/bin/env node

// ===========================================
// Wiki.js DEV UTILITY
// Licensed under AGPLv3
// ===========================================

const _ = require('lodash')
const chalk = require('chalk')
const path = require('path')

const init = {
  async dev() {
    const chokidar = require('chokidar')
    const { createServer } = await import('vite')

    console.info(chalk.yellow.bold('--- ====================== ---'))
    console.info(chalk.yellow.bold('--- Wiki.js DEVELOPER MODE ---'))
    console.info(chalk.yellow.bold('--- ====================== ---'))

    global.DEV = true
    global.VITE_DEV = {
      server: await createServer({
        configFile: path.join(process.cwd(), 'vite.config.mjs'),
        appType: 'custom',
        server: {
          middlewareMode: true
        }
      })
    }

    console.info(chalk.yellow.bold('>>> Starting Wiki.js in DEVELOPER mode...'))
    require('../server')

    process.stdin.setEncoding('utf8')
    process.stdin.on('data', data => {
      if (_.trim(data) === 'rs') {
        console.warn(chalk.yellow.bold('--- >>>>>>>>>>>>>>>>>>>>>>>> ---'))
        console.warn(chalk.yellow.bold('--- Manual restart requested ---'))
        console.warn(chalk.yellow.bold('--- <<<<<<<<<<<<<<<<<<<<<<<< ---'))
        this.reload()
      }
    })

    const devWatcher = chokidar.watch([
      './server'
    ], {
      cwd: process.cwd(),
      ignoreInitial: true,
      atomic: 400
    })
    devWatcher.on('ready', () => {
      devWatcher.on('all', _.debounce(() => {
        console.warn(chalk.yellow.bold('--- >>>>>>>>>>>>>>>>>>>>>>>>>>>> ---'))
        console.warn(chalk.yellow.bold('--- Changes detected: Restarting ---'))
        console.warn(chalk.yellow.bold('--- <<<<<<<<<<<<<<<<<<<<<<<<<<<< ---'))
        this.reload()
      }, 500))
    })
  },
  async reload() {
    console.warn(chalk.yellow('--- Gracefully stopping server...'))
    await global.WIKI.kernel.shutdown(true)

    console.warn(chalk.yellow('--- Purging node modules cache...'))

    global.WIKI = {}
    Object.keys(require.cache).forEach(id => {
      if (/[/\\]server[/\\]/.test(id)) {
        delete require.cache[id]
      }
    })
    Object.keys(module.constructor._pathCache).forEach(cacheKey => {
      if (/[/\\]server[/\\]/.test(cacheKey)) {
        delete module.constructor._pathCache[cacheKey]
      }
    })

    console.warn(chalk.yellow('--- Unregistering process listeners...'))

    process.removeAllListeners('unhandledRejection')
    process.removeAllListeners('uncaughtException')

    require('../server')
  }
}

init.dev()
