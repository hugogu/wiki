export function createCompatUnmountHooks (cleanupMethodName) {
  const invokeCleanup = function () {
    if (typeof this[cleanupMethodName] === 'function') {
      this[cleanupMethodName]()
    }
  }

  return {
    beforeDestroy: invokeCleanup,
    beforeUnmount: invokeCleanup
  }
}
