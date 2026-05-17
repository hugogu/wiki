export function getWikiInstance () {
  return window.WIKI || null
}

export function setWikiInstance (instance) {
  window.WIKI = instance
  return instance
}

export function clearWikiInstance () {
  window.WIKI = null
}
