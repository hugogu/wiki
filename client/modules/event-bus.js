export function createEventBus () {
  const listeners = new Map()

  const off = (event, handler) => {
    const handlers = listeners.get(event)

    if (!handlers) {
      return
    }

    if (handler) {
      handlers.delete(handler)
    } else {
      handlers.clear()
    }

    if (handlers.size < 1) {
      listeners.delete(event)
    }
  }

  const on = (event, handler) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }

    listeners.get(event).add(handler)

    return () => off(event, handler)
  }

  const emit = (event, payload) => {
    const handlers = listeners.get(event)

    if (!handlers) {
      return
    }

    Array.from(handlers).forEach(handler => {
      handler(payload)
    })
  }

  return {
    emit,
    off,
    on
  }
}
