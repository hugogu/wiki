const assignGlobalProperty = (target, name, value) => {
  if (target?.config?.globalProperties) {
    target.config.globalProperties[name] = value
    return
  }

  target.prototype[name] = value
}

export default {
  install (target, options = {}) {
    if (options.moment) {
      assignGlobalProperty(target, '$moment', options.moment)
    }
  }
}
