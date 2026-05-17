const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const rootDir = path.resolve(__dirname, '..')
const patchesDir = path.join(rootDir, 'patches')

if (!fs.existsSync(patchesDir)) {
  console.log('[postinstall] No patches directory found, skipping patch-package.')
  process.exit(0)
}

const patchFiles = fs.readdirSync(patchesDir).filter(file => file.endsWith('.patch'))

if (patchFiles.length === 0) {
  console.log('[postinstall] No patch files found, skipping patch-package.')
  process.exit(0)
}

let patchPackageBin

try {
  const patchPackageDir = path.dirname(require.resolve('patch-package/package.json', { paths: [rootDir] }))
  patchPackageBin = path.join(patchPackageDir, 'index.js')
} catch (err) {
  console.warn('[postinstall] patch-package is not installed, skipping local patches.')
  process.exit(0)
}

const result = spawnSync(process.execPath, [patchPackageBin], {
  cwd: rootDir,
  stdio: 'inherit'
})

if (result.error) {
  console.error('[postinstall] Failed to run patch-package:', result.error.message)
  process.exit(1)
}

process.exit(result.status || 0)
