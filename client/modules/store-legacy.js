export function ensureLegacyStoreModule (store, path, module) {
  const modulePath = Array.isArray(path) ? path : [path]

  if (typeof store.hasModule === 'function' && store.hasModule(modulePath)) {
    return
  }

  store.registerModule(path, module)
}
