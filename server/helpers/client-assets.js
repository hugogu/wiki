const fs = require('fs-extra')
const path = require('path')

const DEV_BASE = '/_assets/'

const ENTRY_FILES = {
  app: 'client/index-app.js',
  legacy: 'client/index-legacy.js',
  setup: 'client/index-setup.js'
}

module.exports = {
  init () {
    let manifestCache = null
    const rootPath = global.WIKI ? WIKI.ROOTPATH : process.cwd()

    const loadManifest = () => {
      if (global.DEV) {
        return null
      }
      if (manifestCache) {
        return manifestCache
      }

      const manifestPath = path.join(rootPath, 'assets', 'manifest.json')
      if (!fs.existsSync(manifestPath)) {
        throw new Error(`Vite manifest not found at ${manifestPath}. Run the client build first.`)
      }

      manifestCache = fs.readJsonSync(manifestPath)
      return manifestCache
    }

    const toPublicPath = (assetPath) => {
      return `${DEV_BASE}${assetPath}`.replace(/\/{2,}/g, '/')
    }

    const collectChunkAssets = (manifest, key, chunks, styles, seen) => {
      if (!key || seen.has(key) || !manifest[key]) {
        return
      }
      seen.add(key)

      const chunk = manifest[key]

      if (chunk.file) {
        chunks.add(toPublicPath(chunk.file))
      }

      for (const cssFile of chunk.css || []) {
        styles.add(toPublicPath(cssFile))
      }

      for (const importedKey of chunk.imports || []) {
        collectChunkAssets(manifest, importedKey, chunks, styles, seen)
      }
    }

    return {
      getAssetSet (entryName) {
        const entryFile = ENTRY_FILES[entryName]
        if (!entryFile) {
          throw new Error(`Unknown client asset entry: ${entryName}`)
        }

        if (global.DEV) {
          return {
            styles: [],
            preloads: [],
            scripts: [
              { src: `${DEV_BASE}@vite/client`, type: 'module' },
              { src: `${DEV_BASE}${entryFile}`, type: 'module' }
            ]
          }
        }

        const manifest = loadManifest()
        const entryChunk = manifest[entryFile]

        if (!entryChunk) {
          throw new Error(`Vite manifest entry missing for ${entryFile}`)
        }

        const chunks = new Set()
        const styles = new Set()
        const seen = new Set()

        for (const cssFile of entryChunk.css || []) {
          styles.add(toPublicPath(cssFile))
        }

        for (const importedKey of entryChunk.imports || []) {
          collectChunkAssets(manifest, importedKey, chunks, styles, seen)
        }

        const entryScript = toPublicPath(entryChunk.file)
        chunks.delete(entryScript)

        return {
          styles: Array.from(styles),
          preloads: Array.from(chunks),
          scripts: [
            { src: entryScript, type: 'module' }
          ]
        }
      }
    }
  }
}
