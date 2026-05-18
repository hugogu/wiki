// Proxy module for @vue/compat that patches withCtx to handle Vuetify 2's
// slot-type inspection, which can call slot functions without slot props.
import * as VueModule from '@vue/compat'

export * from '@vue/compat'
export default VueModule.default || VueModule

const origWithCtx = typeof VueModule.withCtx === 'function'
  ? VueModule.withCtx
  : (fn) => fn

export function withCtx (fn, ctx) {
  const ownerInstance = ctx || VueModule.getCurrentInstance?.() || null
  const ownerProxy = ownerInstance?.proxy || ownerInstance || null

  const wrapped = function (...args) {
    if (args.length === 0) {
      args = [{}]
    } else if (args[0] === undefined) {
      args[0] = {}
    }

    return fn.apply(ownerProxy || this, args)
  }

  return origWithCtx(wrapped, ctx)
}
