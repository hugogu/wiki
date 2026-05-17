let currentWikiInstance = null

export function getWikiInstance () {
  return currentWikiInstance
}

export function setWikiInstance (instance) {
  currentWikiInstance = instance
  window.WIKI = instance
  return instance
}

export function clearWikiInstance () {
  currentWikiInstance = null
  window.WIKI = null
}
