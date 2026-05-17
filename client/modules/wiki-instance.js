let currentWikiInstance = null

const syncLegacyGlobalWikiInstance = (instance) => {
  const globalTarget = typeof window !== 'undefined' ? window : globalThis
  globalTarget.WIKI = instance
}

export function getWikiInstance () {
  return currentWikiInstance
}

export function setWikiInstance (instance) {
  currentWikiInstance = instance
  syncLegacyGlobalWikiInstance(instance)
  return instance
}

export function clearWikiInstance () {
  currentWikiInstance = null
  syncLegacyGlobalWikiInstance(null)
}
