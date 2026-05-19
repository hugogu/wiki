const registerDirective = (target, name, definition) => {
  if (typeof target?.directive === 'function') {
    target.directive(name, definition)
  }
}

const assignGlobalProperty = (target, name, value) => {
  if (target?.config?.globalProperties) {
    target.config.globalProperties[name] = value
    return
  }

  target.prototype[name] = value
}

const copyText = async (value) => {
  const text = String(value ?? '')

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return text
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }

  return text
}

const mountClipboardHandler = (element, binding) => {
  const handler = async () => {
    await copyText(typeof binding.value === 'function' ? binding.value() : binding.value)
  }

  element.__compatClipboardHandler = handler
  element.addEventListener('click', handler)
}

const unmountClipboardHandler = (element) => {
  if (element.__compatClipboardHandler) {
    element.removeEventListener('click', element.__compatClipboardHandler)
    delete element.__compatClipboardHandler
  }
}

export default {
  install (target) {
    assignGlobalProperty(target, '$clipboard', copyText)
    assignGlobalProperty(target, '$copyText', copyText)

    registerDirective(target, 'clipboard', {
      bind: mountClipboardHandler,
      beforeMount: mountClipboardHandler,
      updated (element, binding) {
        unmountClipboardHandler(element)
        mountClipboardHandler(element, binding)
      },
      beforeUnmount: unmountClipboardHandler,
      unbind: unmountClipboardHandler
    })
  }
}
